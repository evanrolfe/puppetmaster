describe('Requests', () => {
  describe('GET /requests', () => {
    beforeEach(() => {
      global.db.serialize(() => {
        global.db.run('Delete FROM requests;');
        global.db.run("DELETE FROM SQLITE_SEQUENCE WHERE name='requests';");
        global.db.run(
          'INSERT INTO requests (method, url, response_status) VALUES ("GET", "http://localhost/api/posts.json", 200);'
        );
        global.db.run(
          'INSERT INTO requests (method, url, response_status) VALUES ("POST", "http://localhost/api/posts.json", 200);'
        );
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
              response_status: 200,
              url: 'http://localhost/api/posts.json'
            },
            {
              id: 2,
              method: 'POST',
              response_status: 200,
              url: 'http://localhost/api/posts.json'
            }
          ]
        }
      });
    });
  });
});
