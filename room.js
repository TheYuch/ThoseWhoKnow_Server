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

    this.badFeedbackCount = 0;
  }

  setTopic(socketId, topic) {
    if (socketId === this.adminSocketId) {
      this.topic = topic;
    }
  }

  agreeTopic(socketId) {
    if (socketId !== this.adminSocketId) {
      this.topicAgreed = true;
    }
  }

  startPrompt(socketId) {
    if (socketId === this.adminSocketId && this.topic !== '' && this.topicAgreed) {
      this.stage = constants.GAME_STAGES.PROMPT;
      this.roundsPlayed++;
    }
  }

  getOtherSocketId(socketId) {
    return this.players[0] === socketId ? this.players[1] : this.players[0];
  }

  setPrompt(socketId, prompt) {
    const player = getPlayer(socketId);
    player.addSelfPrompt(prompt);
    player.promptSubmitted = true;
    getPlayer(this.getOtherSocketId(socketId)).addOtherPrompt(prompt);

    let numSubmitted = 0;
    for (const id of this.players) {
      if (getPlayer(id).promptSubmitted) {
        numSubmitted++;
      }
    }
    if (numSubmitted === this.players.length) {
      this.stage = constants.GAME_STAGES.RESPONSE;
    }
  }

  setResponse(socketId, response) {
    getPlayer(socketId).responseSubmitted = true;
    getPlayer(this.getOtherSocketId(socketId)).addResponse(response);
    
    let numSubmitted = 0;
    for (const id of this.players) {
      if (getPlayer(id).responseSubmitted) {
        numSubmitted++;
      }
    }
    if (numSubmitted === this.players.length) {
      this.stage = constants.GAME_STAGES.ADVISING; // players give each other feedback
    }
  }

  setFeedback(socketId, feedback) {
    getPlayer(socketId).feedbackSubmitted = true;
    const ret = getPlayer(this.getOtherSocketId(socketId)).addFeedback(feedback);
    this.badFeedbackCount += ret ? 0 : 1;

    let numSubmitted = 0;
    for (const id of this.players) {
      if (getPlayer(id).feedbackSubmitted) {
        numSubmitted++;
      }
    }
    if (numSubmitted === this.players.length) {
      this.stage = constants.GAME_STAGES.FEEDBACK; // players receive each others' feedback
    }
  }

  setNextQuestion(socketId) {
    getPlayer(socketId).nextQuestionSubmitted = true;

    let numSubmitted = 0;
    for (const id of this.players) {
      if (getPlayer(id).nextQuestionSubmitted) {
        numSubmitted++;
      }
    }
    if (numSubmitted === this.players.length) {
      for (const id of this.players) {
        getPlayer(id).resetIntermediate();
      }
      this.stage = constants.GAME_STAGES.PROMPT;
      this.roundsPlayed++;
      this.badFeedbackCount = 0;
    }
  }

  setSummary(socketId) {
    if (socketId === this.adminSocketId) {
      // TODO: add LLM summary generation here
      for (const id of this.players) {
        getPlayer(id).setSummary('TMP summary here');
      }
      this.stage = constants.GAME_STAGES.SUMMARY;
    }
  }

  setPlayAgain(socketId) {
    getPlayer(socketId).playAgainSubmitted = true;

    let numSubmitted = 0;
    for (const id of this.players) {
      if (getPlayer(id).playAgainSubmitted) {
        numSubmitted++;
      }
    }
    if (numSubmitted === this.players.length) {
      this.stage = constants.GAME_STAGES.LOBBY;
      this.roundsPlayed = 0;
      this.topic = '';
      this.topicAgreed = false;
      for (const id of this.players) {
        getPlayer(id).resetTotal();
      }
      this.badFeedbackCount = 0;
    }
  }

  getGameState(socketId) {
    const otherPlayer = getPlayer(this.getOtherSocketId(socketId));
    const otherPlayerData = otherPlayer ? otherPlayer.getOtherData() : null;
    return {
      roomCode: this.roomCode,
      stage: this.stage,
      roundsPlayed: this.roundsPlayed,
      topic: this.topic,
      topicAgreed: this.topicAgreed,
      canSummary: this.badFeedbackCount === this.players.length  || this.roundsPlayed >= constants.DEFAULT_ROUNDS,
      player: getPlayer(socketId).getSelfData(),
      otherPlayer: otherPlayerData,
    };
  }
}

const createRoom = (roomCode, adminSocketId, callback) => {
  if (rooms.has(roomCode)) {
    callback({ success: false, message: 'Room already exists.' });
    return;
  }
  const room = new Room(roomCode, adminSocketId);
  rooms.set(roomCode, room);
  callback({ success: true, message: 'Success!' });
};

const getPlayerRoom = (socketId) => {
  return rooms.get(getPlayer(socketId).roomCode);
};

const deleteRoom = (roomCode) => {
  rooms.delete(roomCode);
};

const joinPlayer = (socketId, username, roomCode, callback) => {
  createPlayer(socketId, username, roomCode);
  const room = rooms.get(roomCode);
  if (!room || room.players.includes(socketId)) {
    callback({ success: false, message: 'Invalid room or player already in room.' });
    return;
  }
  room.players.push(socketId);
};

const leavePlayer = (socketId) => { // no callback for this
  const roomCode = getPlayer(socketId).roomCode;
  const room = rooms.get(roomCode);
  if (socketId === room.adminSocketId) {
    deleteRoom(roomCode);
  } else {
    const playerIndex = room.players.indexOf(socketId);
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1);
      deletePlayer(socketId);
    }
  }
};

module.exports = {
  createRoom, getPlayerRoom, joinPlayer, leavePlayer,
};