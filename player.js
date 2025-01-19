const players = new Map();

class Player {
  constructor(socketId, username, roomCode) {
    this.socketId = socketId;
    this.username = username;
    this.roomCode = roomCode;

    this.promptSubmitted = false;
    this.responseSubmitted = false;
    this.feedbackSubmitted = false;
    this.nextQuestionSubmitted = false;
    
    this.playAgainSubmitted = false;

    this.selfPrompts = []; // from this player
    this.otherPrompts = []; // from other player
    this.responses = []; // from other player
    this.feedback = []; // from other player
    this.summary = '';
  }

  resetIntermediate() {
    this.promptSubmitted = false;
    this.responseSubmitted = false;
    this.feedbackSubmitted = false;
    this.nextQuestionSubmitted = false;
  }

  resetTotal() {
    this.resetIntermediate();

    this.playAgainSubmitted = false;

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

  addFeedback(feedback) { // returns whether the feedback is good
    this.feedback.push(feedback);
    return feedback.good;
  }

  setSummary(summary) {
    this.summary = summary;
  }

  getSelfData() {
    return {
      username: this.username,
      selfPrompts: this.selfPrompts,
      otherPrompts: this.otherPrompts,
      responses: this.responses,
      feedback: this.feedback,
      summary: this.summary,
    };
  }

  getOtherData() {
    return {
      username: this.username,
      promptSubmitted: this.promptSubmitted,
      responseSubmitted: this.responseSubmitted,
      feedbackSubmitted: this.feedbackSubmitted,
      nextQuestionSubmitted: this.nextQuestionSubmitted,
      playAgainSubmitted: this.playAgainSubmitted,
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