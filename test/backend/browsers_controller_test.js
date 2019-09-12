describe('BrowsersController', () => {
  describe('POST /browsers', () => {
    it('works', async () => {
      const result = await backendConn.send('POST', '/browsers', {});
      expect(result).to.eql({ type: 'reply', result: { status: 'OK' } });
    });
  });

  describe('GET /browsers', () => {
    it('returns the requests stored in the database', async () => {
      const result = await backendConn.send('GET', '/browsers', {});
      console.log(result);
      expect(result).to.eql({
        type: 'reply',
        result: {
          status: 'OK',
          body: [0, 1, 2, 3]
        }
      });
    });
  });

  describe('GET /browsers/321', () => {
    it('works', async () => {
      const result = await backendConn.send('GET', '/browsers/321', {});
      expect(result).to.eql({
        type: 'reply',
        result: { status: 'OK', body: { id: 321 } }
      });
    });
  });

  describe('PATCH /browsers/123', () => {
    it('works', async () => {
      const result = await backendConn.send('PATCH', '/browsers/123', {});
      expect(result).to.eql({ type: 'reply', result: { status: 'INVALID' } });
    });
  });

  describe('DELETE /browsers/123', () => {
    it('works', async () => {
      const result = await backendConn.send('DELETE', '/browsers/123', {});
      expect(result).to.eql({ type: 'reply', result: { status: 'OK' } });
    });
  });
});
