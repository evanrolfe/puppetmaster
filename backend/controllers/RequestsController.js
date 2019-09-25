const Request = require('../models/Request');

class RequestsController {
  constructor(params) {
    this.params = params;
  }

  // GET /requests
  async index() {
    const requests = await Request.select(
      'id',
      'method',
      'url',
      'request_type',
      'request_headers',
      'request_payload',
      'response_status',
      'response_status_message',
      'response_headers',
      'response_remote_address'
    );

    return { status: 'OK', body: requests };
  }

  // GET /requests/123
  async show() {
    const request = await Request.find(this.params.id);

    return { status: 'OK', body: request };
  }
}

module.exports = RequestsController;
