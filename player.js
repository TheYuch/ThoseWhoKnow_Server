class Player {
  constructor(socketId, username) {
    this.socketId = socketId;
    this.username = username;
    
    this.selfPrompts = []; // from this player
    this.otherPrompts = []; // from other player
    this.responses = []; // from other player
    this.feedback = []; // from other player
    this.summary = '';
  }

  getData() {
    return {
      selfPrompts: this.selfPrompts,
      otherPrompts: this.otherPrompts,
      responses: this.responses,
      feedback: this.feedback,
      summary: this.summary,
    };
  }
}

module.exports = {
  Player,
};