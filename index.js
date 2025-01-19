import { createRoom, getPlayerRoom, joinPlayer, leavePlayer } from './room';

const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = parseInt(process.env.PORT) || 5678;

io.on('connection', (socket) => {
  console.log('A user connected.');

  socket.on('createRoom', ({ roomCode, callback }) => {
    createRoom(roomCode, socket.id, callback);
  });

  socket.on('joinRoom', ({ roomCode, username, callback }) => {
    joinPlayer(socket.id, username, roomCode, callback);
  });

  socket.on('disconnecting', () => {
    console.log('A user is disconnecting.');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

server.listen(PORT, () => console.log(`Those Who Know Server listening at port ${PORT}.`));