import Request from '../models/Request';
import ipc from '../../shared/ipc-server';

export default class RequestsController {
  // GET /requests
  async index(args) {
    const columns = [
      'requests.id',
      'browser_id',
      'browsers.title',
      'method',
      'url',
      'host',
      'path',
      'ext',
      'request_modified',
      'response_modified',
      'requests.created_at',
      'request_type',
      'request_payload',
      'response_status',
      'response_status_message',
      'response_remote_address',
      'response_body_length'
    ];

    let requests = await Request.findByParams(columns, args);
    requests = Request.stripWholeBody(requests);

    return { status: 'OK', body: requests };
  }

  async show(args) {
    const result = await global.knex('requests').where({ id: args.id });

    return { status: 'OK', body: result[0] };
  }

  async delete(args) {
    if (Array.isArray(args.id)) {
      await global
        .knex('requests')
        .whereIn('id', args.id)
        .del();
    } else {
      await global
        .knex('requests')
        .where({ id: args.id })
        .del();
    }

    // TODO: Change this to requestsChanged
    ipc.send('requestDeleted', { requestId: args.id });

    return { status: 'OK', body: {} };
  }
}
