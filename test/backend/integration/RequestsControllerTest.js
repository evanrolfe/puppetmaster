describe('Requests', () => {
  beforeEach(async () => {
    await global.dbStore.connection.raw('Delete FROM requests;');
    await global.dbStore.connection.raw(
      'DELETE FROM SQLITE_SEQUENCE WHERE name="requests";'
    );

    await global.dbStore.Model('Request').create({
      id: 1,
      host: 'localhost',
      path: '/api/secrets.json',
      method: 'POST',
      request_type: 'fetch',
      url: 'http://localhost/api/secrets.json',
      response_status: 401,
      response_body: 'Hello World!'
    });
    await global.dbStore.Model('Request').create({
      id: 2,
      host: 'localhost',
      path: '/api/posts.json',
      method: 'GET',
      request_type: 'xhr',
      url: 'http://localhost/api/posts.json',
      response_status: 200,
      response_body: 'Hello World!'
    });
  });

  describe('index', () => {
    it('returns the requests', async () => {
      const result = await backendConn.send('RequestsController', 'index', {});

      expect(result.result.status).to.eql('OK');
      expect(result.result.body[0].id).to.eql(2);
      expect(result.result.body[1].id).to.eql(1);
    });

    it('returns the requests ordered by url desc', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        order_by: 'url',
        dir: 'desc'
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body[0].id).to.eql(1);
      expect(result.result.body[1].id).to.eql(2);
    });

    it('returns the requests filtered by hostList', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        hostList: ['localhost', 'example.com'],
        hostSetting: 'exclude'
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body.length).to.eql(0);
    });

    it('returns the requests filtered by pathList include', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        pathList: ['/secrets', '/posts'],
        pathSetting: 'include'
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body.length).to.eql(2);
    });

    it('returns the requests filtered by pathList exclude', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        pathList: ['/secrets', '/posts'],
        pathSetting: 'exclude'
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body.length).to.eql(0);
    });

    it('returns the requests filtered by extList', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        extList: ['json', 'xml'],
        extSetting: 'exclude'
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body.length).to.eql(0);
    });

    it('returns the requests filtered by resourceType', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        resourceTypes: ['fetch']
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body.length).to.eql(1);
    });

    it('returns the requests filtered by status code', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        statusCodes: ['2', '3']
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body.length).to.eql(1);
    });

    it('returns the requests filtered by search term', async () => {
      const result = await backendConn.send('RequestsController', 'index', {
        search: 'secrets'
      });

      expect(result.result.status).to.eql('OK');
      expect(result.result.body.length).to.eql(1);
      expect(result.result.body[0].id).to.eql(1);
    });
  });

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
});
