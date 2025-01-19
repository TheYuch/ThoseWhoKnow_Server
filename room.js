const { Player } = require('./player');

const rooms = new Map();

class Room {
  constructor(roomCode, adminSocketId) {
    this.roomCode = roomCode;
    this.adminSocketId = adminSocketId;
    this.players = new Map();
  }

  addPlayer(socketId, username) {
    if (this.players.has(socketId) || this.players.size >= 2) {
      return;
    }
    const player = new Player(socketId, username);
    this.players.set(socketId, player);
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  getPlayers() {
    return this.players;
  }
};

const createRoom = (roomCode, adminSocketId ) => {
  const room = new Room(roomCode, adminSocketId);
  rooms.set(roomCode, room);
};

const deleteRoom = (roomCode) => {
  rooms.delete(roomCode);
}

module.exports = {
  Room, rooms, createRoom, deleteRoom,
};