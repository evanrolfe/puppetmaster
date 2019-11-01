describe('BrowsersController', () => {
  describe('create', () => {
    it('works', async () => {
      const result = await backendConn.send('BrowsersController', 'create', {});
      delete result.sentAt;

      expect(result).to.eql({ type: 'reply', result: { status: 'OK' } });
    });
  });
});
