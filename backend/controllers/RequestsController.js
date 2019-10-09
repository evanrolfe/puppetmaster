const Request = require('../models/Request');

const RESOURCE_TYPES = [
  'document',
  'eventsource',
  'fetch',
  'font',
  'image',
  'manifest',
  'media',
  'other',
  'stylesheet',
  'script',
  'texttrack',
  'websocket',
  'xhr'
];

const STATUS_CODES = ['2', '3', '4', '5'];

class RequestsController {
  // GET /requests
  async index(args) {
    console.log(args);

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

    let query = global.dbStore.connection('requests').select(columns);

    // Host filter:
    if (['include', 'exclude'].includes(args.hostSetting)) {
      const likeOperator =
        args.hostSetting === 'include' ? 'whereIn' : 'whereNotIn';
      query = query[likeOperator]('host', args.hostList);
    }

    // Path filter:
    if (['include', 'exclude'].includes(args.pathSetting)) {
      if (args.pathSetting === 'include') {
        // eslint-disable-next-line func-names
        query = query.where(function() {
          args.pathList.forEach((path, i) => {
            const whereOperator = i === 0 ? 'where' : 'orWhere';

            this[whereOperator]('path', 'like', `%${path}%`);
          });
        });
      } else {
        // eslint-disable-next-line func-names
        query = query.where(function() {
          args.pathList.forEach(path => {
            this.where('path', 'not like', `%${path}%`);
          });
        });
      }
    }

    // Ext filter:
    if (['include', 'exclude'].includes(args.extSetting)) {
      const operator = args.extSetting === 'include' ? 'whereIn' : 'whereNotIn';
      query = query[operator]('ext', args.extList);
    }

    // ResourceType filter:
    if (
      args.resourceTypes !== undefined &&
      args.resourceTypes.length < RESOURCE_TYPES.length
    ) {
      query = query.whereIn('request_type', args.resourceTypes);
    }

    // StatusCode filter:
    if (
      args.statusCodes !== undefined &&
      args.statusCodes.length < STATUS_CODES.length
    ) {
      const questionMarks = Array(args.statusCodes.length)
        .fill()
        .map(() => '?')
        .join(',');

      query = query.whereRaw(
        `SUBSTR(CAST(response_status AS text),0,2) IN (${questionMarks})`,
        args.statusCodes
      );
    }

    // Order
    if (args.order_by !== undefined && args.dir !== undefined) {
      query = query.orderBy(args.order_by, args.dir);
    } else {
      query = query.orderBy('id', 'desc');
    }

    console.log(`[Backend] ${query.toSQL().sql}`);

    const response = await query;

    return { status: 'OK', body: response };
  }

  // GET /requests/123
  async show(args) {
    const request = await Request.find(args.id);

    return { status: 'OK', body: request };
  }
}

module.exports = RequestsController;
