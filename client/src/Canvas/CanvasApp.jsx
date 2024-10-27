import { useCallback, useRef } from "react";
import { useDraw } from "./useDraw";
import { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { drawLine } from "./drawLine";
import { initCanvasSocket } from "../utils/wss";
import { useSelector } from "react-redux";

//const socket = io("http://localhost:3001");

export default function Canvas() {
  const roomId = useSelector((store) => store.room.roomId);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const { canvasRef, onMouseDown, clear } = useDraw({ onDraw: createLine });
  const [color, setColor] = useState("#FFF");

  // host drawing
  function createLine({ prevPoint, currentPoint, ctx }) {
    socketRef.current?.emit("draw-line", { prevPoint, currentPoint, color });
    drawLine({ prevPoint, currentPoint, ctx, color });
  }
  const connectCanvasSocket = useCallback(() => {
    socketRef.current = initCanvasSocket();
    setSocket(socketRef.current);
  }, []);

  useEffect(() => {
    if (roomId) {
      connectCanvasSocket();
      socketRef.current?.on("connect", () => {
        console.log(
          "successfully connected with canvas namespace of socket.io server ",
          socketRef.current.id,
        );
      });
      const ctx = canvasRef.current?.getContext("2d");
      //TODO: send roomId to server to join room
      socketRef.current?.emit("client-ready");
      socketRef.current?.on("get-canvas-state", () => {
        //long text of whats on canvas
        if (!canvasRef.current?.toDataURL()) return;
        socketRef.current?.emit("canvas-state", canvasRef.current.toDataURL());
      });
      socketRef.current?.on("canvas-state-from-server", (state) => {
        const img = new Image();
        img.src = state;
        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
        };
      });

      socketRef.current?.on(
        "draw-line",
        ({ prevPoint, currentPoint, color }) => {
          if (!ctx) return;
          drawLine({ prevPoint, currentPoint, ctx, color });
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
  }, [canvasRef, connectCanvasSocket, roomId]);

  return (
    <>
      {socketRef.current || socket ? (
        <div className="w-screen h-screen bg-white flex justify-center items-center">
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
              className="p-2 rounded-s border border-black text-black"
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
}
