import { useEffect, useRef, useState } from "react";
import EditorComp from "./components/Editor";
import { Box } from "@chakra-ui/react";
import { initEditorSocket } from "../utils/wss";
import { useCallback } from "react";

//TODO: receive roomId, username from roomPage
function EditorApp() {
  const roomId = "room1",
    username = "tempUser";
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const codeRef = useRef(null);
  const outputRef = useRef(null);
  const languageRef = useRef("javascript");

  const handleErrors = (err) => {
    console.log(`Error with ws client: ${err}`);
  };
  const connectEditorSocket = useCallback(() => {
    socketRef.current = initEditorSocket();
    setSocket(socketRef.current);
  }, []);
  useEffect(() => {
    (async () => {
      connectEditorSocket();
      socketRef.current.on("connect", () => {
        console.log(
          "successfully connected with editor namespace of socket.io server ",
          socketRef.current.id,
        );
      });

      socketRef.current?.on("connect_error", (err) => handleErrors(err));
      socketRef.current?.on("connect_failed", (err) => handleErrors(err));
      socketRef.current?.on("ERR_CONNECTION_REFUSED", (err) => {
        handleErrors(err);
      });

      socketRef.current?.emit("join", { roomId, username });
      socketRef.current?.on(
        "user-joined",
        ({ clients, username, socketId }) => {
          console.log(`user ${socketId} joined`);
          socketRef.current?.emit("sync-code", {
            code: codeRef.current,
            socketId,
          });
          socketRef.current?.emit("sync-output", {
            output: outputRef.current,
            socketId,
          });
          socketRef.current?.emit("sync-language", {
            language: languageRef.current,
            socketId,
          });
        },
      );
    })();
    return () => {
      console.log(`disconnecting`);
      socketRef?.current?.disconnect();
      socketRef?.current?.off("user-joined");
    };
  }, [connectEditorSocket]);
  return (
    <>
      {socketRef.current || socket ? (
        <Box minH="90%" minWidth="90%" bg="#0f0a19" color="gray" px={6} py={8}>
          <EditorComp
            socketRef={socketRef.current}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
            onLanguageChange={(lang) => {
              languageRef.current = lang;
            }}
            onOutputChange={(op) => {
              outputRef.current = op;
            }}
          />
        </Box>
      ) : (
        <div>no socket found</div>
      )}
    </>
  );
}

export default EditorApp;
