class BrowsersController {
  constructor(params) {
    this.params = params;
  }

  // POST /browsers
  create() {
    return { status: 'OK' };
  }

  // GET /browsers
  index() {
    return { status: 'OK', body: [0, 1, 2, 3] };
  }

  // GET /browsers/123
  show() {
    return { status: 'OK', body: { id: this.params.id } };
  }

  // PATCH /browsers/123
  update() {
    return { status: 'INVALID' };
  }

  // DELETE /browsers/1232
  delete() {
    return { status: 'OK' };
  }
}

module.exports = BrowsersController;
