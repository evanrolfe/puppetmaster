const SEARCHABLE_COLUMNS = ['id', 'url', 'direction'];

export default class WebsocketMessagesController {
  // GET /requests
  async index(args) {
    console.log('WebsocketMessagesController');
    console.log(args);
    let query = global.knex
      .select(
        'websocket_messages.id AS id',
        'websocket_messages.direction AS direction',
        'websocket_messages.body AS body',
        'websocket_messages.created_at AS created_at',
        'websocket_messages.request_id AS request_id',
        'requests.url AS url'
      )
      .from('websocket_messages')
      .leftJoin('requests', 'requests.id', 'websocket_messages.request_id');

    // Order
    if (args.order_by !== undefined && args.dir !== undefined) {
      if (args.order_by === 'id') args.order_by = 'websocket_messages.id';
      query = query.orderBy(args.order_by, args.dir);
    } else {
      query = query.orderBy('websocket_messages.id', 'desc');
    }

    // Search filter:
    if (args.search !== undefined) {
      // eslint-disable-next-line func-names
      query = query.where(function() {
        SEARCHABLE_COLUMNS.forEach(column => {
          if (column === 'id') column = 'websocket_messages.id';
          if (column === 'url') column = 'requests.url';

          this.orWhere(column, 'like', `%${args.search}%`);
        });
      });
    }

    const messages = await query;

    return { status: 'OK', body: messages };
  }
}
