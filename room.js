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
    this.canSummary = false;
  }

  getOtherSocketId(socketId) { // private helper function
    return this.players[0] === socketId ? this.players[1] : this.players[0];
  }

  setTopic(socketId, topic, callback) {
    if (socketId !== this.adminSocketId) {
      callback({ success: false, message: 'Only the admin can set the topic.' });
      return;
    }
    this.topic = topic;
    callback({ success: true, message: 'Success!' });
  }

  agreeTopic(socketId, callback) {
    if (socketId === this.adminSocketId || this.topic !== '') {
      callback({ success: false, message: 'Only the non-admin can agree to the topic.' });
      return;
    }
    this.topicAgreed = true;
    callback({ success: true, message: 'Success!' });
  }

  startPrompt(socketId, callback) {
    if (socketId !== this.adminSocketId || !this.topicAgreed) {
      callback({ success: false, message: 'Only the admin can start the prompt.' });
      return;
    }
    this.stage = constants.GAME_STAGES.PROMPT;
    this.roundsPlayed++;
    callback({ success: true, message: 'Success!' });
  }

  setPrompt(socketId, prompt, callback) {
    const player = getPlayer(socketId);
    if (player.promptSubmitted) { // TODO: this should be done in the player class
      callback({ success: false, message: 'You have already submitted a prompt.' });
      return;
    }
    player.promptSubmitted = true; // TODO: this should be done in the player class
    player.addPrompt(prompt);

    let numSubmitted = 0;
    for (const id of this.players) {
      if (getPlayer(id).promptSubmitted) {
        numSubmitted++;
      }
    }
    if (numSubmitted === this.players.length) {
      this.stage = constants.GAME_STAGES.RESPONSE;
    }

    callback({ success: true, message: 'Success!' });
  }

  setResponse(socketId, response, callback) {
    const player = getPlayer(socketId);
    if (player.responseSubmitted) {
      callback({ success: false, message: 'You have already submitted a response.' });
      return;
    }
    player.responseSubmitted = true;
    player.addResponse(response);
    
    let numSubmitted = 0;
    for (const id of this.players) {
      if (getPlayer(id).responseSubmitted) {
        numSubmitted++;
      }
    }
    if (numSubmitted === this.players.length) {
      this.stage = constants.GAME_STAGES.ADVISING; // players give each other feedback
    }

    callback({ success: true, message: 'Success!' });
  }

  setFeedback(socketId, feedback, callback) {
    const player = getPlayer(socketId);
    if (player.feedbackSubmitted) {
      callback({ success: false, message: 'You have already submitted a feedback.' });
      return;
    }
    player.feedbackSubmitted = true;
    this.badFeedbackCount += player.addFeedback(feedback) ? 0 : 1;

    let numSubmitted = 0;
    for (const id of this.players) {
      if (getPlayer(id).feedbackSubmitted) {
        numSubmitted++;
      }
    }
    if (numSubmitted === this.players.length) {
      this.stage = constants.GAME_STAGES.FEEDBACK; // players receive each others' feedback
      this.canSummary = this.badFeedbackCount === this.players.length || this.roundsPlayed >= constants.DEFAULT_ROUNDS;
    }

    callback({ success: true, message: 'Success!' });
  }

  setNextQuestion(socketId, callback) {
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
      this.canSummary = false;
    }

    callback({ success: true, message: 'Success!' });
  }

  setSummary(socketId, callback) {
    if (socketId !== this.adminSocketId || !this.canSummary) {
      callback({ success: false, message: 'Must be admin with summary conditions met.' });
      return;
    }

    // TODO: add LLM summary generation here
    for (const id of this.players) {
      getPlayer(id).setSummary('TMP summary here');
    }
    this.stage = constants.GAME_STAGES.SUMMARY;

    callback({ success: true, message: 'Success!' });
  }

  setPlayAgain(socketId, callback) {
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
      this.canSummary = false;
    }

    callback({ success: true, message: 'Success!' });
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
      canSummary: this.canSummary,
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
  callback({ success: true, message: 'Success!' });
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