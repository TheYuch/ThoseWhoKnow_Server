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

  socket.on('createRoom', ({ roomCode, callback }) => createRoom(roomCode, socket.id, callback));

  socket.on('joinRoom', ({ roomCode, username, callback }) => joinPlayer(socket.id, username, roomCode, callback));

  socket.on('submitTopic', ({ topic, callback }) => getPlayerRoom(socket.id).setTopic(socket.id, topic, callback));

  socket.on('agreeTopic', ({ callback }) => getPlayerRoom(socket.id).agreeTopic(socket.id, callback));

  socket.on('startPrompt', ({ callback }) => getPlayerRoom(socket.id).startPrompt(socket.id, callback));

  socket.on('submitPrompt', ({ prompt, callback }) => getPlayerRoom(socket.id).setPrompt(socket.id, prompt, callback));

  socket.on('submitResponse', ({ response, callback }) => getPlayerRoom(socket.id).setResponse(socket.id, response, callback));

  socket.on('submitFeedback', ({ feedback, callback }) => getPlayerRoom(socket.id).setFeedback(socket.id, feedback, callback));

  socket.on('submitNextQuestion', ({ callback }) => getPlayerRoom(socket.id).setNextQuestion(socket.id, callback));

  socket.on('submitSummary', ({ callback }) => getPlayerRoom(socket.id).setSummary(socket.id, callback));

  socket.on('submitPlayAgain', ({ callback }) => getPlayerRoom(socket.id).setPlayAgain(socket.id, callback));

  socket.on('disconnecting', () => leavePlayer(socket.id));

  socket.on('disconnect', () => console.log('A user disconnected.'));
});

server.listen(PORT, () => console.log(`Those Who Know Server listening at port ${PORT}.`));