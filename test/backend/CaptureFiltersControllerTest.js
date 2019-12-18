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
    await global.knex.raw('Delete FROM capture_filters;');
    await global.knex.raw(
      'DELETE FROM SQLITE_SEQUENCE WHERE name="capture_filters";'
    );

    await global
      .knex('capture_filters')
      .insert({ id: 1, filters: JSON.stringify(DEFAULT_FILTERS) });
  });

  describe('show', () => {
    it('returns capture filters', async () => {
      const result = await backendConn.send(
        'CaptureFiltersController',
        'show',
        {}
      );

      expect(result.result.status).to.eql('OK');
      expect(result.result.body).to.eql(DEFAULT_FILTERS);
    });
  });

  describe('update', () => {
    it('updates the capture filters', async () => {
      const result = await backendConn.send(
        'CaptureFiltersController',
        'update',
        {
          extList: ['js', 'css'],
          extSetting: 'exclude'
        }
      );

      expect(result.result.status).to.eql('OK');

      const dbResult = await global
        .knex('capture_filters')
        .where({ id: 1 })
        .select();
      const filters = JSON.parse(dbResult[0].filters);
      expect(filters.extList).to.eql(['js', 'css']);
      expect(filters.extSetting).to.eql('exclude');
    });
  });
});
