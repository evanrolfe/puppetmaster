const fs = require('fs');

const STATEFILE = 'app_state.json';

class StateController {
  constructor(params) {
    this.params = params;
  }

  // GET /state/BrowserNetworkPage
  show() {
    let state = {};

    if (fs.existsSync(STATEFILE)) {
      const stateFileJson = fs.readFileSync(STATEFILE, 'utf8');
      state = JSON.parse(stateFileJson);
      state = state[this.params.page];
    }

    if (state === undefined) {
      state = {};
    }

    return { status: 'OK', body: state };
  }

  // POST /state
  async create() {
    let state = {};

    if (fs.existsSync(STATEFILE)) {
      const stateFileJson = fs.readFileSync(STATEFILE, 'utf8');
      state = JSON.parse(stateFileJson);
    }

    if (state[this.params.page] === undefined) {
      state[this.params.page] = {};
    }

    state[this.params.page] = this.params;
    delete state[this.params.page].page;

    fs.writeFileSync(STATEFILE, JSON.stringify(state));

    return { status: 'OK', body: {} };
  }
}

module.exports = StateController;
