describe('Test', () => {
  beforeEach(() => {});

  it('works as it should do', async () => {
    const result = await backendConn.send('ring-ring', {
      message: 'this is james'
    });
    expect(result).to.equal('hello!');
  });
});
