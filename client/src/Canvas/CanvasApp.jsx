import { useCallback, useRef } from "react";
import { useDraw } from "./useDraw";
import { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { drawLine } from "./drawLine";
import { initCanvasSocket } from "../utils/wss";
import { useSelector } from "react-redux";

const Canvas = () => {
  const roomId = useSelector((store) => store.room.roomId);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [color, setColor] = useState("#FFF");
  const identity = useSelector((store) => store.room.identity);
  // host drawing
  const createLine = ({ prevPoint, currentPoint, ctx }) => {
    console.log(`socketRef ${socketRef.current}`);
    socketRef.current?.emit("draw-line", { prevPoint, currentPoint, color });
    console.log(`emiting draw-line`);
    drawLine({ prevPoint, currentPoint, ctx, color });
  };
  const { canvasRef, onMouseDown, clear } = useDraw({ onDraw: createLine });

  const connectCanvasSocket = useCallback(() => {
    socketRef.current = initCanvasSocket();
    setSocket(socketRef.current);
  }, []);

  useEffect(() => {
    if (roomId && canvasRef) {
      connectCanvasSocket();
      socketRef.current?.on("connect", () => {
        console.log(
          "successfully connected with canvas namespace of socket.io server ",
          socketRef.current.id,
        );
      });
      const ctx = canvasRef.current?.getContext("2d");
      //TODO: send roomId to server to join room
      socketRef.current?.emit("client-ready", {
        roomId: roomId,
        username: identity,
      });

      socketRef.current?.on("get-canvas-state", () => {
        console.log(`get-canvas-state triggered sending state`);
        //long text of whats on canvas
        if (!canvasRef.current?.toDataURL()) {
          console.log(
            `receivd get-canv-st but no canvasRef.curr so returning with empty`,
          );
          return;
        }
        socketRef.current?.emit("canvas-state", canvasRef.current.toDataURL());
      });
      socketRef.current?.on("canvas-state-from-server", (state) => {
        const img = new Image();
        img.src = state;
        img.onload = () => {
          // ctx?.drawImage(img, 0, 0);
          (ctx || canvasRef.current?.getContext("2d")).drawImage(img, 0, 0);
        };
        //FIXME: ctx is undefined
        console.log(
          `received canvas-state-from-server populating screen ${state} ctx ${ctx}`,
        );
      });

      socketRef.current?.on(
        "draw-line",
        ({ prevPoint, currentPoint, color }) => {
          if (!ctx && !canvasRef.current?.getContext("2d")) {
            console.log(
              `recvd draw-line but no ctx  and no canvRef.curr.getCtx(2d)=>returning`,
            );
            return;
          }
          console.log(`received draw-line`);
          drawLine({
            prevPoint,
            currentPoint,
            ctx: ctx ? ctx : canvasRef.current?.getContext("2d"),
            color,
          });
        },
      );
      socketRef.current?.on("clear-canvas", () => {
        clear();
      });
    }
    return () => {
      socketRef.current?.off("draw-line");
      socketRef.current?.off("clear-canvas");
      socketRef.current?.off("get-canvas-state");
      socketRef.current?.off("canvas-state-from-server");
    };
  }, [canvasRef, roomId]);

  return (
    <>
      {socketRef.current || socket ? (
        <div className="w-full h-full bg-white flex justify-center items-center">
          <div className="flex flex-col gap-10 pr-10">
            <ChromePicker
              color={color}
              onChange={(e) => {
                setColor(e.hex);
              }}
            />
            <button
              onClick={() => {
                clear();
                socketRef.current?.emit("clear-canvas");
              }}
              type="button"
              className="p-2 rounded-s border border-gray text-white"
            >
              Clear Canvas
            </button>
          </div>
          <canvas
            onMouseDown={() => {
              onMouseDown();
            }}
            ref={canvasRef}
            width={600}
            height={600}
            className="border border-black rounded-md "
          ></canvas>
        </div>
      ) : (
        <div>no canvasSocket found</div>
      )}
    </>
  );
};
export default Canvas;
