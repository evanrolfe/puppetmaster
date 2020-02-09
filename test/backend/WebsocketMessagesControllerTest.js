describe('Requests', () => {
  beforeEach(async () => {
    await global.knex.raw('Delete FROM requests;');
    await global.knex.raw('Delete FROM websocket_messages;');
    await global.knex.raw('DELETE FROM SQLITE_SEQUENCE WHERE name="requests";');
    await global.knex.raw(
      'DELETE FROM SQLITE_SEQUENCE WHERE name="websocket_messages";'
    );

    await global.knex('requests').insert({
      id: 1,
      host: 'localhost:3002',
      path: '/',
      method: 'GET',
      request_type: 'websocket',
      url: 'ws://localhost:3002/',
      response_status: 101
    });
    await global.knex('websocket_messages').insert({
      request_id: 1,
      direction: 'incoming',
      body: 'Hello, how are you?',
      created_at: Date.now()
    });
    await global.knex('websocket_messages').insert({
      request_id: 1,
      direction: 'outgoing',
      body: 'Hi, Im fine thanks, and yourself?',
      created_at: Date.now()
    });
  });

  describe('index', () => {
    it('returns the websocket_messages', async () => {
      const result = await backendConn.send(
        'WebsocketMessagesController',
        'index',
        {}
      );
      console.log(result.result.body);
      expect(result.result.status).to.eql('OK');
      expect(result.result.body.length).to.eql(2);

      expect(result.result.body[0].body).to.eql(
        'Hi, Im fine thanks, and yourself?'
      );
      expect(result.result.body[0].direction).to.eql('outgoing');
      expect(result.result.body[0].request_id).to.eql(1);
      expect(result.result.body[0].url).to.eql('ws://localhost:3002/');

      expect(result.result.body[1].body).to.eql('Hello, how are you?');
      expect(result.result.body[1].direction).to.eql('incoming');
      expect(result.result.body[1].request_id).to.eql(1);
      expect(result.result.body[1].url).to.eql('ws://localhost:3002/');
    });
  });
  /*
  describe('show', () => {
    it('returns the request with id 1', async () => {
      const result = await backendConn.send('RequestsController', 'show', {
        id: 1
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body.id).to.eql(1);
      expect(result.result.body.method).to.eql('POST');
      expect(result.result.body.url).to.eql(
        'http://localhost/api/secrets.json'
      );
    });
  });
*/
});
