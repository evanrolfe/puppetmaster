export default class WebsocketMessagesController {
  // GET /requests
  async index() {
    const messages = await global.knex
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

    return { status: 'OK', body: messages };
  }
}
