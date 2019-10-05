const Request = require('../models/Request');

class RequestsController {
  constructor(params) {
    this.params = params;
  }

  // GET /requests
  async index() {
    let query =
      'SELECT id, method, url, request_type, request_payload, response_status, response_status_message, response_remote_address FROM requests';

    if (this.params.order_by !== undefined) {
      if (this.params.dir.toUpperCase() === 'DESC') {
        query += ` ORDER BY ${this.params.order_by} DESC`;
      } else if (this.params.dir.toUpperCase() === 'ASC') {
        query += ` ORDER BY ${this.params.order_by} ASC`;
      }
    } else {
      query += ` ORDER BY id DESC`;
    }

    const response = await global.dbStore.connection.raw(query);

    return { status: 'OK', body: response };
  }

  // GET /requests/123
  async show() {
    const request = await Request.find(this.params.id);

    return { status: 'OK', body: request };
  }
}

module.exports = RequestsController;
