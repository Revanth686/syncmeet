import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import * as twilio from "twilio";

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
app.use(cors());

let connectedUsers = [];
let rooms = [];

// create route to check if room exists
app.get("/api/room-exists/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find((room) => room.id === roomId);

  if (room) {
    // send reponse that room exists
    if (room.connectedUsers.length > 3) {
      return res.send({ roomExists: true, full: true });
    } else {
      return res.send({ roomExists: true, full: false });
    }
  } else {
    // send response that room does not exists
    return res.send({ roomExists: false });
  }
});

app.get("/", (_, res) => {
  res.send("hit  /");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const webrtcNamespace = io.of("/webrtc"),
  editorNamespace = io.of("/editor"),
  canvasNamespace = io.of("/canvas");

webrtcNamespace.on("connection", (socket) => {
  console.log(`new client connected ${socket.id}`);

  socket.on("create-new-room", (data) => {
    createNewRoomHandler(data, socket);
  });

  socket.on("join-room", (data) => {
    joinRoomHandler(data, socket);
  });

  socket.on("disconnect", () => {
    disconnectHandler(socket);
  });

  socket.on("conn-signal", (data) => {
    signalingHandler(data, socket);
  });

  socket.on("conn-init", (data) => {
    initializeConnectionHandler(data, socket);
  });
});

const createNewRoomHandler = (data, socket) => {
  console.log(
    `creating ne room for host ${socket.id} ${JSON.stringify(data)}  `,
  );

  const { identity, onlyAudio } = data;
  const roomId = uuidv4();
  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
    onlyAudio,
  };
  // connectedUsers = [...connectedUsers, newUser];
  connectedUsers.push(newUser);
  const newRoom = {
    id: roomId,
    connectedUsers: [newUser],
  };
  socket.join(roomId);
  // rooms = [...rooms, newRoom];
  rooms.push(newRoom);
  // emit to client who created room->to store roomId
  socket.emit("room-id", { roomId });

  // emit new users to existing users in room=>to setParticipants
  socket.emit("room-update", {
    connectedUsers: newRoom.connectedUsers,
  });
};
const joinRoomHandler = (data, socket) => {
  console.log(
    `joining room for attendee ${socket.id} ${JSON.stringify(data)}  `,
  );
  const { identity, roomId, onlyAudio } = data;
  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
    onlyAudio,
  };
  // join room as user which just is trying to join room passing room id
  const room = rooms.find((room) => room.id === roomId);
  room?.connectedUsers.push(newUser);
  console.log(`room ${JSON.stringify(room)}`);

  socket.join(roomId);

  // add new user to connected users array
  //connectedUsers = [...connectedUsers, newUser];
  connectedUsers.push(newUser);

  room.connectedUsers.forEach((user) => {
    if (user.socketId != socket.id) {
      webrtcNamespace.to(user.socketId).emit("conn-prepare", {
        connUserSocketId: socket.id,
      });
    }
  });
  //just to update list in participants section
  webrtcNamespace
    .to(roomId)
    .emit("room-update", { connectedUsers: room.connectedUsers });
};

const disconnectHandler = (socket) => {
  //BUG-WIP: if host leaves the room, the room is not closed
  const user = connectedUsers.find((user) => user.socketId === socket.id);
  if (user) {
    const room = rooms.find((room) => room.id === user.roomId);
    room.connectedUsers = room.connectedUsers.filter(
      (user) => user.socketId !== socket.id,
    );
    socket.leave(user.roomId);

    // close the room if amount of the users which will stay in room will be 0
    if (room.connectedUsers.length > 0) {
      webrtcNamespace
        .to(room.id)
        .emit("user-disconnected", { socketId: socket.id });

      webrtcNamespace.to(room.id).emit("room-update", {
        connectedUsers: room.connectedUsers,
      });
    } else {
      rooms = rooms.filter((r) => r.id !== room.id);
    }
  }
};

/*endpoint that handles sending offer/answer to and fro prod&cons*/
const signalingHandler = (data, socket) => {
  const { connUserSocketId, signal } = data;

  const signalingData = { signal, connUserSocketId: socket.id };
  webrtcNamespace.to(connUserSocketId).emit("conn-signal", signalingData);
};

const initializeConnectionHandler = (data, socket) => {
  const { connUserSocketId } = data;

  webrtcNamespace
    .to(connUserSocketId)
    .emit("conn-init", { connUserSocketId: socket.id });
};

server.listen(PORT, () => {
  console.log(`Server is up at port ${PORT}`);
});

//////////////////////////editor socket endpoints////////////////////////
const userSocketMap = {};
function getAllConnectedClients(roomId) {
  // Map
  return Array.from(
    editorNamespace?.sockets?.adapter?.rooms?.get(roomId) || [],
  ).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
}
editorNamespace.on("connection", (socket) => {
  console.log(`new editor socket connected ${socket.id}`);

  socket.on("join", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    console.log(
      `${socket.id} joined ${roomId} with clients ${JSON.stringify(clients)}`,
    );
    // socket.in(roomId).emit(actions.USER_JOINED, { clients, username });
    clients.forEach(({ socketId }) => {
      if (socketId != socket.id) {
        editorNamespace.to(socketId).emit("user-joined", {
          clients,
          username,
          socketId: socket.id,
        });
      }
    });
  });
  socket.on("sync-code", ({ code, socketId }) => {
    console.log(`sync-code to ${socketId} with code ${JSON.stringify(code)}`);
    editorNamespace.to(socketId).emit("code-change", { code });
  });
  socket.on("sync-language", ({ language, socketId }) => {
    editorNamespace.to(socketId).emit("language-change", { language });
  });
  socket.on("sync-output", ({ output, socketId }) => {
    editorNamespace.to(socketId).emit("output-change", { output });
  });

  socket.on("code-change", ({ roomId, code }) => {
    //send to all except the sender
    socket.in(roomId).emit("code-change", { code });
  });
  socket.on("output-change", ({ roomId, output }) => {
    //send to all except the sender
    socket.in(roomId).emit("output-change", { output });
  });
  socket.on("language-change", ({ roomId, language }) => {
    //send to all except the sender
    socket.in(roomId).emit("language-change", { language });
  });
});

//////////////////////////canvas namespace////////////////////////
canvasNamespace.on("connection", (socket) => {
  console.log(`new canvas socket connected ${socket.id}`);
});
