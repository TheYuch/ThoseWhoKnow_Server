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

    this.prompts = [];
    this.responses = [];
    this.feedback = [];
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

  addPrompt(prompt) {
    this.prompts.push(prompt);
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
      prompts: this.prompts,
      responses: this.responses,
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
      prompts: this.prompts,
      responses: this.responses,
      feedback: this.feedback,
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