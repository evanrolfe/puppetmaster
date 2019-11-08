const Request = require('../models/Request');

class RequestsController {
  // GET /requests
  async index(args) {
    console.log(`[Backend] args: ${JSON.stringify(args)}`);

    const columns = [
      'requests.id',
      'browser_id',
      'browsers.title',
      'method',
      'url',
      'host',
      'path',
      'ext',
      'requests.created_at',
      'request_type',
      'request_payload',
      'response_status',
      'response_status_message',
      'response_remote_address',
      'response_body_length'
    ];

    const requests = await Request.findByParams(columns, args);
    console.log(requests);
    return { status: 'OK', body: requests };
  }

  // GET /requests/123
  async show(args) {
    const result = await global.dbStore
      .connection('requests')
      .where({ id: args.id });

    return { status: 'OK', body: result[0] };
  }
}

module.exports = RequestsController;
