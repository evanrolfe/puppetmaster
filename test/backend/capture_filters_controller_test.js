const DEFAULT_FILTERS = {
  hostList: [],
  hostSetting: 'include',
  pathList: [],
  pathSetting: 'include',
  extList: [],
  extSetting: 'include'
};

describe('CaptureFiltersController', () => {
  beforeEach(async () => {
    await global.dbStore.connection.raw('Delete FROM capture_filters;');
    await global.dbStore.connection.raw(
      'DELETE FROM SQLITE_SEQUENCE WHERE name="capture_filters";'
    );

    await global.dbStore
      .connection('capture_filters')
      .insert({ id: 1, filters: JSON.stringify(DEFAULT_FILTERS) });
  });

  describe('update', () => {
    it('returns the requests filtered by search term', async () => {
      const result = await backendConn.send(
        'CaptureFiltersController',
        'update',
        {
          extList: ['js', 'css'],
          extSetting: 'exclude'
        }
      );

      expect(result.result.status).to.eql('OK');

      const dbResult = await global.dbStore
        .connection('capture_filters')
        .where({ id: 1 })
        .select();
      const filters = JSON.parse(dbResult[0].filters);
      expect(filters.extList).to.eql(['js', 'css']);
      expect(filters.extSetting).to.eql('exclude');
    });
  });
});
