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

io.on("connection", (socket) => {
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
  room.connectedUsers.push(newUser);
  console.log(`room ${JSON.stringify(room)}`);

  socket.join(roomId);

  // add new user to connected users array
  //connectedUsers = [...connectedUsers, newUser];
  connectedUsers.push(newUser);

  room.connectedUsers.forEach((user) => {
    if (user.socketId != socket.id) {
      io.to(user.socketId).emit("conn-prepare", {
        connUserSocketId: socket.id,
      });
    }
  });
  //just to update list in participants section
  io.to(roomId).emit("room-update", { connectedUsers: room.connectedUsers });
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
      io.to(room.id).emit("user-disconnected", { socketId: socket.id });

      io.to(room.id).emit("room-update", {
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
  io.to(connUserSocketId).emit("conn-signal", signalingData);
};

const initializeConnectionHandler = (data, socket) => {
  const { connUserSocketId } = data;

  io.to(connUserSocketId).emit("conn-init", { connUserSocketId: socket.id });
};

server.listen(PORT, () => {
  console.log(`Server is up at port ${PORT}`);
});
