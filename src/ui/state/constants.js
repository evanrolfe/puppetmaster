export const RESOURCE_TYPES = [
  'document',
  'eventsource',
  'fetch',
  'font',
  'image',
  'manifest',
  'media',
  'navigation',
  'other',
  'stylesheet',
  'script',
  'texttrack',
  'websocket',
  'xhr'
];

export const STATUS_CODES = {
  2: '2xx [Success]',
  3: '3xx [Redirect]',
  4: '4xx [Request Error]',
  5: '5xx [Server Error]'
};

export const ALL_TABLE_COLUMNS = [
  { key: 'id', title: '#', width: 40 },
  { key: 'title', title: 'Browser', width: 80 },
  { key: 'method', title: 'Method', width: 70 },
  { key: 'host', title: 'Host', width: 80 },
  { key: 'path', title: 'Path', width: 175 },
  { key: 'request_type', title: 'Type', width: 80 },
  { key: 'ext', title: 'Ext', width: 40 },
  { key: 'request_modified', title: 'Modified?', width: 85 },
  { key: 'response_status', title: 'Status', width: 70 },
  {
    key: 'response_body_length',
    title: 'Length',
    width: 70
  },
  {
    key: 'response_remote_address',
    title: 'IP Address',
    width: 130
  },
  { key: 'created_at', title: 'Time', width: 200 }
];

export const DEFAULT_COLUMNS = [
  'id',
  'title',
  'method',
  'host',
  'path',
  'response_status',
  'request_type',
  'request_modified'
];

export const PAGE_LAYOUTS = {
  vertical: [
    { key: 'vert2Pane', title: '2-Pane' },
    { key: 'vert2PaneSplit', title: '2-Pane-Split' },
    { key: 'vert3Pane', title: '3-Pane' },
    { key: 'vert3PaneSplit', title: '3-Pane-Split' }
  ],
  horizontal: [
    { key: 'horz2Pane', title: '2-Pane' },
    { key: 'horz2PaneSplit', title: '2-Pane-Split' },
    { key: 'horz3Pane', title: '3-Pane' },
    { key: 'horz3PaneSplit', title: '3-Pane-Split' }
  ]
};

export const DEFAULT_PAGE_LAYOUTS = {
  vert2Pane: {
    orientation: 'horizontal',
    panes: [
      {
        id: 1,
        tab: 'Network',
        length: 700,
        draggingPane: false
      },
      {
        id: 2,
        length: 500,
        draggingPane: false,
        tabs: ['Request', 'Response', 'Body'],
        tabIndex: 0
      }
    ]
  },
  vert3Pane: {
    orientation: 'horizontal',
    panes: [
      {
        id: 1,
        tab: 'Network',
        length: 700,
        draggingPane: false
      },
      {
        id: 2,
        length: 500,
        draggingPane: false,
        tabs: ['Request', 'Response'],
        tabIndex: 0
      },
      {
        id: 3,
        length: 500,
        draggingPane: false,
        tabs: ['Body'],
        tabIndex: 0
      }
    ]
  },
  vert2PaneSplit: {
    orientation: 'horizontal',
    panes: [
      {
        id: 1,
        tab: 'Network',
        length: 700,
        draggingPane: false
      },
      {
        id: 2,
        orientation: 'vertical',
        length: 500,
        draggingPane: false,
        panes: [
          {
            id: 3,
            tabs: ['Request', 'Response'],
            length: 300,
            draggingPane: false,
            tabIndex: 0
          },
          {
            id: 4,
            tabs: ['Body'],
            length: 300,
            draggingPane: false,
            tabIndex: 0
          }
        ]
      }
    ]
  },
  vert3PaneSplit: {
    orientation: 'horizontal',
    panes: [
      {
        id: 1,
        tab: 'Network',
        length: 700,
        draggingPane: false
      },
      {
        id: 2,
        orientation: 'vertical',
        length: 500,
        draggingPane: false,
        panes: [
          {
            id: 3,
            tabs: ['Request'],
            length: 300,
            draggingPane: false,
            tabIndex: 0
          },
          {
            id: 4,
            tabs: ['Response'],
            length: 300,
            draggingPane: false,
            tabIndex: 0
          }
        ]
      },
      {
        id: 5,
        length: 500,
        draggingPane: false,
        tabs: ['Body'],
        tabIndex: 0
      }
    ]
  },
  horz2Pane: {
    orientation: 'vertical',
    panes: [
      {
        id: 1,
        tab: 'Network',
        length: 350,
        draggingPane: false
      },
      {
        id: 2,
        draggingPane: false,
        tabs: ['Request', 'Response', 'Body'],
        tabIndex: 0
      }
    ]
  },
  horz3Pane: {
    orientation: 'vertical',
    panes: [
      {
        id: 1,
        tab: 'Network',
        length: 350,
        draggingPane: false
      },
      {
        id: 2,
        draggingPane: false,
        length: 350,
        tabs: ['Request', 'Response', 'Body'],
        tabIndex: 0
      },
      {
        id: 3,
        draggingPane: false,
        length: 350,
        tabs: ['Body'],
        tabIndex: 0
      }
    ]
  },
  horz2PaneSplit: {
    orientation: 'vertical',
    panes: [
      {
        id: 1,
        tab: 'Network',
        length: 350,
        draggingPane: false
      },
      {
        id: 2,
        draggingPane: false,
        orientation: 'horizontal',
        panes: [
          {
            id: 3,
            tabs: ['Request', 'Response'],
            length: 300,
            draggingPane: false,
            tabIndex: 0
          },
          {
            id: 4,
            tabs: ['Body'],
            length: 300,
            draggingPane: false,
            tabIndex: 0
          }
        ]
      }
    ]
  },
  horz3PaneSplit: {
    orientation: 'vertical',
    panes: [
      {
        id: 1,
        tab: 'Network',
        length: 350,
        draggingPane: false
      },
      {
        id: 2,
        draggingPane: false,
        length: 250,
        orientation: 'horizontal',
        panes: [
          {
            id: 3,
            tabs: ['Request'],
            length: 500,
            draggingPane: false,
            tabIndex: 0
          },
          {
            id: 4,
            tabs: ['Response'],
            length: 300,
            draggingPane: false,
            tabIndex: 0
          }
        ]
      },
      {
        id: 5,
        draggingPane: false,
        length: 350,
        tabs: ['Body'],
        tabIndex: 0
      }
    ]
  }
};
