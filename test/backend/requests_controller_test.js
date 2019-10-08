describe('Requests', () => {
  beforeEach(async () => {
    await global.dbStore.connection.raw('Delete FROM requests;');
    await global.dbStore.connection.raw(
      'DELETE FROM SQLITE_SEQUENCE WHERE name="requests";'
    );

    await global.dbStore.Model('Request').create({
      id: 1,
      method: 'POST',
      url: 'http://localhost/api/secrets.json',
      response_status: 401,
      response_body: 'Hello World!'
    });
    await global.dbStore.Model('Request').create({
      id: 2,
      method: 'GET',
      url: 'http://localhost/api/posts.json',
      response_status: 200,
      response_body: 'Hello World!'
    });
  });

  describe('GET /requests', () => {
    it('returns the requests ordered by id DESC', async () => {
      const result = await backendConn.send('RequestsController', 'index', {});
      delete result.sentAt;

      expect(result.result.status).to.eql('OK');
      expect(result.result.body[0].id).to.eql(2);
      expect(result.result.body[1].id).to.eql(1);
    });
  });

  describe('GET /requests?order_by=url&dir=desc', () => {
    it('returns the requests ordered by url DESC', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        order_by: 'url',
        dir: 'desc'
      });
      delete result.sentAt;

      expect(result.result.status).to.eql('OK');
      expect(result.result.body[0].id).to.eql(1);
      expect(result.result.body[1].id).to.eql(2);
    });
  });

  describe('GET /requests/1', () => {
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
});
