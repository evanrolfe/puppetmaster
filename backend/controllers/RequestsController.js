const Request = require('../models/Request');

class RequestsController {
  // GET /requests
  async index(args) {
    const columns = [
      'id',
      'method',
      'url',
      'host',
      'path',
      'ext',
      'created_at',
      'request_type',
      'request_payload',
      'response_status',
      'response_status_message',
      'response_remote_address',
      'response_body_length'
    ];

    let query = `SELECT ${columns.join(',')} FROM requests`;

    if (args.order_by !== undefined) {
      if (args.dir.toUpperCase() === 'DESC') {
        query += ` ORDER BY ${args.order_by} DESC`;
      } else if (args.dir.toUpperCase() === 'ASC') {
        query += ` ORDER BY ${args.order_by} ASC`;
      }
    } else {
      query += ` ORDER BY id DESC`;
    }
    console.log(`the query is: ${query}`);

    const response = await global.dbStore.connection.raw(query);
    console.log(response);
    return { status: 'OK', body: response };
  }

  // GET /requests/123
  async show(args) {
    const request = await Request.find(args.id);

    return { status: 'OK', body: request };
  }
}

module.exports = RequestsController;
