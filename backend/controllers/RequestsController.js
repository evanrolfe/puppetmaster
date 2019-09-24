class RequestsController {
  constructor(params) {
    this.params = params;
  }

  // GET /requests
  async index() {
    const requests = await global.db.all(
      'SELECT id, method, url, response_status, response_status_message FROM requests'
    );
    console.log(`Received: ${requests.length} requests!`);

    return { status: 'OK', body: requests };
  }

  // GET /requests/123
  async show() {
    const request = await global.db.get(
      'SELECT id, method, url, response_status, response_status_message FROM requests WHERE id=?',
      this.params.id
    );

    return { status: 'OK', body: request };
  }
}

module.exports = RequestsController;
