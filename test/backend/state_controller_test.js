const fs = require('fs');

const STATEFILE = 'app_state.json';

describe('Requests', () => {
  beforeEach(() => {
    if (fs.existsSync(STATEFILE)) {
      fs.unlinkSync(STATEFILE);
    }
  });

  describe('GET /state/BrowserNetworkPage', () => {
    context('when there is not state file', () => {
      it('returns an empty object', async () => {
        const result = await backendConn.send(
          'GET',
          '/state/BrowserNetworkPage',
          {}
        );

        expect(result.result.status).to.eql('OK');
        expect(result.result.body).to.eql({});
      });
    });

    context('when state file already exists', () => {
      it('return the state from the file', async () => {
        const state = {
          BrowserInterceptPage: {
            hello: 'world'
          },
          BrowserNetworkPage: {
            browserNetworkPaneHeight: 250,
            tableColumnWidths: [40, 100, 500, 100],
            order_by: 'id',
            dir: 'desc',
            requestsTableScrollTop: 0
          }
        };
        fs.writeFileSync(STATEFILE, JSON.stringify(state));

        const result = await backendConn.send(
          'GET',
          '/state/BrowserNetworkPage',
          {}
        );

        expect(result.result.status).to.eql('OK');
        expect(result.result.body).to.eql(state.BrowserNetworkPage);
      });
    });
  });

  describe('POST /state/BrowserNetworkPage', () => {
    context('when there is not state file', () => {
      it('creates a state file with the params saved', async () => {
        const params = {
          page: 'BrowserNetworkPage',
          browserNetworkPaneHeight: 250,
          tableColumnWidths: [40, 100, 500, 100],
          order_by: 'id',
          dir: 'desc',
          requestsTableScrollTop: 0
        };
        const result = await backendConn.send('POST', '/state', params);

        expect(result.result.status).to.eql('OK');

        const stateFileJson = fs.readFileSync(STATEFILE, 'utf8');
        const stateResult = JSON.parse(stateFileJson);

        expect(stateResult).to.eql({
          BrowserNetworkPage: {
            browserNetworkPaneHeight: params.browserNetworkPaneHeight,
            tableColumnWidths: params.tableColumnWidths,
            order_by: params.order_by,
            dir: params.dir,
            requestsTableScrollTop: params.requestsTableScrollTop
          }
        });
      });
    });

    context('when state file already exists', () => {
      beforeEach(() => {
        const state = {
          BrowserInterceptPage: {
            hello: 'world'
          },
          BrowserNetworkPage: {
            browserNetworkPaneHeight: 250,
            tableColumnWidths: [40, 100, 500, 100],
            order_by: 'id',
            dir: 'desc',
            requestsTableScrollTop: 0
          }
        };
        fs.writeFileSync(STATEFILE, JSON.stringify(state));
      });

      it('creates updates state file with new params', async () => {
        const params = {
          page: 'BrowserNetworkPage',
          browserNetworkPaneHeight: 123,
          tableColumnWidths: [100, 200, 300, 400],
          order_by: 'response_status',
          dir: 'asc',
          requestsTableScrollTop: 321
        };
        const result = await backendConn.send('POST', '/state', params);

        expect(result.result.status).to.eql('OK');

        const stateFileJson = fs.readFileSync(STATEFILE, 'utf8');
        const stateResult = JSON.parse(stateFileJson);

        expect(stateResult).to.eql({
          BrowserInterceptPage: {
            hello: 'world'
          },
          BrowserNetworkPage: {
            browserNetworkPaneHeight: params.browserNetworkPaneHeight,
            tableColumnWidths: params.tableColumnWidths,
            order_by: params.order_by,
            dir: params.dir,
            requestsTableScrollTop: params.requestsTableScrollTop
          }
        });
      });
    });
  });
});
