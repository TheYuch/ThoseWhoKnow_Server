const players = new Map();

class Player {
  constructor(socketId, username, roomCode) {
    this.socketId = socketId;
    this.username = username;
    this.roomCode = roomCode;
    
    this.selfPrompts = []; // from this player
    this.otherPrompts = []; // from other player
    this.responses = []; // from other player
    this.feedback = []; // from other player
    this.summary = '';
  }

  reset() {
    this.selfPrompts = [];
    this.otherPrompts = [];
    this.responses = [];
    this.feedback = [];
    this.summary = '';
  }

  addSelfPrompt(prompt) {
    this.selfPrompts.push(prompt);
  }

  addOtherPrompt(prompt) {
    this.otherPrompts.push(prompt);
  }

  addResponse(response) {
    this.responses.push(response);
  }

  addFeedback(feedback) {
    this.feedback.push(feedback);
  }

  setSummary(summary) {
    this.summary = summary;
  }

  getData() {
    return {
      username: this.username,
      selfPrompts: this.selfPrompts,
      otherPrompts: this.otherPrompts,
      responses: this.responses,
      feedback: this.feedback,
      summary: this.summary,
    };
  }
}

const createPlayer = (socketId, username) => {
  const player = new Player(socketId, username, roomCode);
  players.set(socketId, player);
};

const getPlayer = (socketId) => {
  return players.get(socketId);
};

const deletePlayer = (socketId) => {
  players.delete(socketId);
};

module.exports = {
  createPlayer, getPlayer, deletePlayer,
};