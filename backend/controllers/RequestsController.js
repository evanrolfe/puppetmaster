class RequestsController {
  constructor(params) {
    this.params = params;
  }

  // GET /requests
  async index() {
    const requests = await global.db.all(
      'SELECT id, method, url, response_status FROM requests'
    );
    console.log(`Received: ${requests.length} requests!`);

    return { status: 'OK', body: requests };
  }
}

module.exports = RequestsController;
