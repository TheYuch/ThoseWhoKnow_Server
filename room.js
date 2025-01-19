const { createPlayer, getPlayer, deletePlayer } = require('./player');
const constants = require('./constants');

const rooms = new Map();

class Room {
  constructor(roomCode, adminSocketId) {
    this.roomCode = roomCode;
    this.adminSocketId = adminSocketId;

    this.players = []

    this.stage = constants.GAME_STAGES.LOBBY;
    this.roundsPlayed = 0;
    this.topic = '';
    this.topicAgreed = false;
    this.canPlayAgain = false;
  }

  resetGameState() {
    this.stage = constants.GAME_STAGES.LOBBY;
    this.roundsPlayed = 0;
    this.topic = '';
    this.topicAgreed = false;
    this.canPlayAgain = false;
    for (const id of this.players) {
      getPlayer(id).reset();
    }
  }

  setTopic(topic) {
    this.topic = topic;
  }

  agreeTopic() {
    this.topicAgreed = true;
  }

  getOtherSocketId(socketId) {
    return this.players[0] === socketId ? this.players[1] : this.players[0];
  }

  setPrompt(socketId, prompt) {
    getPlayer(socketId).addSelfPrompt(prompt);
    getPlayer(this.getOtherSocketId(socketId)).addOtherPrompt(prompt);
  }

  setResponse(socketId, response) {
    getPlayer(this.getOtherSocketId(socketId)).addResponse(response);
  }

  setFeedback(socketId, feedback) {
    getPlayer(this.getOtherSocketId(socketId)).addFeedback(feedback);
  }

  setPlayAgain(socketId) {
    if (socketId != this.adminSocketId) {
      this.canPlayAgain = true;
    }
  }

  getGameState(socketId) {
    return {
      roomCode: this.roomCode,
      stage: this.stage,
      roundsPlayed: this.roundsPlayed,
      topic: this.topic,
      topicAgreed: this.topicAgreed,
      canPlayAgain: this.canPlayAgain,
      player: players.get(socketId).getData(),
      otherPlayerUsername: getPlayer(this.getOtherSocketId(socketId)).username,
    };
  }
}

const createRoom = (roomCode, adminSocketId ) => {
  const room = new Room(roomCode, adminSocketId);
  rooms.set(roomCode, room);
};

const getRoom = (roomCode) => {
  return rooms.get(roomCode);
};

const deleteRoom = (roomCode) => {
  rooms.delete(roomCode);
};

const joinPlayer = (socketId, username, roomCode) => {
  createPlayer(socketId, username, roomCode);
  const room = rooms.get(roomCode);
  room.players.push(socketId);
};

const leavePlayer = (socketId) => {
  const roomCode = players.get(socketId).roomCode;
  const room = rooms.get(roomCode);
  const playerIndex = room.players.indexOf(socketId);
  if (playerIndex !== -1) {
    room.players.splice(playerIndex, 1);
  }
  deletePlayer(socketId);
};

module.exports = {
  createRoom, getRoom, deleteRoom, joinPlayer, leavePlayer,
};