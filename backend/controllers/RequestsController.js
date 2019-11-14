const Request = require('../models/Request');
const ipc = require('../server-ipc');

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

    return { status: 'OK', body: requests };
  }

  async show(args) {
    const result = await global.dbStore
      .connection('requests')
      .where({ id: args.id });

    return { status: 'OK', body: result[0] };
  }

  async delete(args) {
    console.log(`RequestsController.delete()`);
    console.log(args);

    if (Array.isArray(args.id)) {
      await global.dbStore
        .connection('requests')
        .whereIn('id', args.id)
        .del();
    } else {
      await global.dbStore
        .connection('requests')
        .where({ id: args.id })
        .del();
    }

    // TODO: Change this to requestsChanged
    ipc.send('requestCreated', {});

    return { status: 'OK', body: {} };
  }
}

module.exports = RequestsController;
