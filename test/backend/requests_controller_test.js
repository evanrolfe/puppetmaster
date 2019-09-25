describe('Requests', () => {
  describe('GET /requests', () => {
    beforeEach(async () => {
      await global.dbStore.connection.raw('Delete FROM requests;');
      await global.dbStore.connection.raw(
        'DELETE FROM SQLITE_SEQUENCE WHERE name="requests";'
      );

      await global.dbStore.Model('Request').create({
        method: 'GET',
        url: 'http://localhost/api/posts.json',
        response_status: 200,
        response_body: 'Hello World!'
      });
      await global.dbStore.Model('Request').create({
        method: 'POST',
        url: 'http://localhost/api/posts.json',
        response_status: 200,
        response_body: 'Hello World!'
      });
    });

    it('returns the requests stored in the database', async () => {
      const result = await backendConn.send('GET', '/requests', {});

      expect(result).to.eql({
        type: 'reply',
        result: {
          status: 'OK',
          body: [
            {
              id: 1,
              method: 'GET',
              request_headers: null,
              request_payload: null,
              request_type: null,
              response_body: null,
              response_headers: null,
              response_remote_address: null,
              response_status: 200,
              response_status_message: null,
              url: 'http://localhost/api/posts.json'
            },
            {
              id: 2,
              method: 'POST',
              request_headers: null,
              request_payload: null,
              request_type: null,
              response_body: null,
              response_headers: null,
              response_remote_address: null,
              response_status: 200,
              response_status_message: null,
              url: 'http://localhost/api/posts.json'
            }
          ]
        }
      });
    });
  });
});
