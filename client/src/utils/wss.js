//all the socket.io endpoints
import { io } from "socket.io-client";
import appStore from "../store/store";
import { setRoomId, setParticipants } from "../store/RoomSlice";
import * as webRTCHandler from "./webRTCHandler";

const SERVER = "http://localhost:5000";

let socket = null;

export const connectWithSocketIOServer = () => {
  const initOpts = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  socket = io(SERVER, initOpts); //io(`${SERVER}/chat`)
  socket.on("connect", () => {
    console.log("successfully connected with socket io server ", socket.id);
  });

  /*event to update connected users' list upon new room-create or joined*/
  socket.on("room-update", (data) => {
    const { connectedUsers } = data;
    appStore.dispatch(setParticipants(connectedUsers));
  });

  //upon sending 'create-new-room' room created and roomId is receivd->just to locallyStore roomId
  socket.on("room-id", (data) => {
    const { roomId } = data;
    console.log(`received roomId from socketSrvr ${roomId}`);
    appStore.dispatch(setRoomId(roomId));
  });

  /*event to existing users in room if new user joins*/
  socket.on("conn-prepare", ({ connUserSocketId }) => {
    webRTCHandler.prepareNewPeerConnection(connUserSocketId, false);

    // inform the user which just join the room that we have prepared for incoming connection
    socket.emit("conn-init", { connUserSocketId: connUserSocketId });
  });

  /*endpoint that'll handle received signalData like answer/offer*/
  socket.on("conn-signal", (data) => {
    webRTCHandler.handleSignalingData(data);
  });

  /*event to joined user after existing users emit that connection established on their side*/
  socket.on("conn-init", (data) => {
    const { connUserSocketId } = data;
    webRTCHandler.prepareNewPeerConnection(connUserSocketId, true);
  });

  socket.on("user-disconnected", (data) => {
    webRTCHandler.removePeerConnection(data);
  });
};

export const createNewRoom = (identity, onlyAudio) => {
  socket.emit("create-new-room", {
    identity,
    onlyAudio,
  });
};

export const joinRoom = (identity, roomId, onlyAudio) => {
  socket.emit("join-room", {
    roomId,
    identity,
    onlyAudio,
  });
};

/*to send the signal(with offer/answer/ice) to and fro*/
export const signalPeerData = (data) => {
  socket.emit("conn-signal", data);
};
