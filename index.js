const {
  createRoom,
  getPlayerRoom,
  joinPlayer,
  leavePlayer,
} = require("./room");

const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = parseInt(process.env.PORT) || 5678;

const emitUpdateGameState = (socket, room) => {
  room.players.forEach((id) => {
    const state = room.getGameState(id);
    state["isAdmin"] = id === room.adminSocketId;
    io.to(id).emit("updateGameState", state);
  });
};

io.on("connection", (socket) => {
  console.log("A user connected.");

  socket.on("createRoom", ({ username }, callback) => {
    createRoom(socket.id, username, callback);
    const state = getPlayerRoom(socket.id).getGameState(socket.id);
    state["isAdmin"] = true;
    socket.emit("updateGameState", state);
  });

  socket.on("joinRoom", ({ roomCode, username }, callback) => {
    joinPlayer(socket.id, username, roomCode, callback);
    emitUpdateGameState(socket, getPlayerRoom(socket.id));
  });

  socket.on("submitTopic", ({ topic }, callback) => {
    const room = getPlayerRoom(socket.id);
    room.setTopic(socket.id, topic, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("agreeTopic", ({}, callback) => {
    const room = getPlayerRoom(socket.id);
    room.agreeTopic(socket.id, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("startPrompt", ({}, callback) => {
    const room = getPlayerRoom(socket.id);
    room.startPrompt(socket.id, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("submitPrompt", ({ prompt }, callback) => {
    const room = getPlayerRoom(socket.id);
    room.setPrompt(socket.id, prompt, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("submitResponse", ({ response }, callback) => {
    const room = getPlayerRoom(socket.id);
    room.setResponse(socket.id, response, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("submitFeedback", ({ feedback }, callback) => {
    const room = getPlayerRoom(socket.id);
    room.setFeedback(socket.id, feedback, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("submitNextQuestion", ({}, callback) => {
    const room = getPlayerRoom(socket.id);
    room.setNextQuestion(socket.id, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("submitSummary", ({}, callback) => {
    const room = getPlayerRoom(socket.id);
    room.setSummary(socket.id, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("submitPlayAgain", ({}, callback) => {
    const room = getPlayerRoom(socket.id);
    room.setPlayAgain(socket.id, callback);
    emitUpdateGameState(socket, room);
  });

  socket.on("disconnecting", () => {
    leavePlayer(socket.id);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected.");
  });
});

server.listen(PORT, () =>
  console.log(`Those Who Know Server listening at port ${PORT}.`)
);
