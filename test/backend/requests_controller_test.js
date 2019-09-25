describe('Requests', () => {
  describe('GET /requests', () => {
    beforeEach(async () => {
      await global.db.run('Delete FROM requests;');
      await global.db.run("DELETE FROM SQLITE_SEQUENCE WHERE name='requests';");
      await global.db.run(
        'INSERT INTO requests (method, url, response_status) VALUES ("GET", "http://localhost/api/posts.json", 200);'
      );
      await global.db.run(
        'INSERT INTO requests (method, url, response_status) VALUES ("POST", "http://localhost/api/posts.json", 200);'
      );
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
