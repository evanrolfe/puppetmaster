const Request = require('../models/Request');

class RequestsController {
  constructor(params) {
    this.params = params;
  }

  // GET /requests
  async index() {
    let requests = Request.select(
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

    if (this.params.order_by !== undefined) {
      let dir = false; // Default is ascending order
      if (this.params.dir.toLowerCase() === 'desc') dir = true;

      requests = requests.order(this.params.order_by, dir);
    } else {
      requests = requests.order('id', true);
    }

    const body = await requests;

    return { status: 'OK', body: body };
  }

  // GET /requests/123
  async show() {
    const request = await Request.find(this.params.id);

    return { status: 'OK', body: request };
  }
}

module.exports = RequestsController;
