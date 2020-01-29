// @flow
import React from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';

import BrowserTabs from '../BrowserTabs';
import PaneContainer from '../pane/PaneContainer';
import PaneRemaining from '../pane/PaneRemaining';
import PaneFixed from '../pane/PaneFixed';
import CodeEditor from '../RequestView/CodeEditor';

type Props = {
  request: 'object',
  history: 'array',
  location: 'object',
  interceptCommand: 'function',
  interceptEnabled: 'boolean',
  toggleIntercept: 'function',
  tabIndex: 'number',
  setTabIndex: 'function',
  codeMirrorWidth: 'number',
  handleChange: 'function',
  requestHeadersText: 'string',
  requestPayloadText: 'string'
};

export default ({
  request,
  interceptCommand,
  interceptEnabled,
  toggleIntercept,
  history,
  location,
  tabIndex,
  setTabIndex,
  codeMirrorWidth,
  handleChange,
  requestHeadersText,
  requestPayloadText
}: Props) => {
  const buttonsDisabled = request === null;

  let requestTitle;

  const codeEditorRef = React.createRef();

  if (request !== null) {
    requestTitle = (
      <>
        <span className={`http-method-${request.method}`}>
          {request.method}
        </span>
        &nbsp;{request.url}
      </>
    );
  }

  const changeTab = i => {
    setTabIndex(i);
  };

  const isResponse = request !== null && request.rawResponse !== undefined;

  const requestButtons = (
    <>
      <button
        className="pointer btn btn--outlined btn--super-compact"
        style={{ display: 'inline-block' }}
        onClick={() => interceptCommand('forward')}
        disabled={buttonsDisabled}
      >
        <i className="fas fa-arrow-right" />
        &nbsp; Forward
      </button>
      <button
        className="pointer btn btn--outlined btn--super-compact"
        style={{ marginLeft: '10px', display: 'inline-block' }}
        onClick={() => interceptCommand('forwardAndIntercept')}
        disabled={buttonsDisabled}
      >
        <i className="fas fa-exchange-alt" />
        &nbsp; Forward & Intercept Response
      </button>
    </>
  );

  const responseButtons = (
    <>
      <button
        className="pointer btn btn--outlined btn--super-compact"
        style={{ display: 'inline-block' }}
        onClick={() => interceptCommand('respond')}
        disabled={buttonsDisabled}
      >
        <i className="fas fa-arrow-right" />
        &nbsp; Respond
      </button>
    </>
  );

  return (
    <PaneContainer orientation="vertical">
      <PaneFixed>
        <BrowserTabs history={history} location={location} />
      </PaneFixed>

      <PaneFixed
        className="pane-border-bottom"
        style={{ marginLeft: '10px', padding: '6px' }}
      >
        <div style={{ marginTop: 0 }}>
          Request to: &nbsp;
          {requestTitle}
        </div>

        <div
          className="form-control form-control--outlined"
          style={{ width: '100%', display: 'inline-block' }}
        >
          {!isResponse && requestButtons}
          {isResponse && responseButtons}
          <button
            className="pointer btn btn--outlined btn--super-compact"
            style={{ marginLeft: '10px', display: 'inline-block' }}
            onClick={toggleIntercept}
          >
            <i className="fas fa-power-off" />
            &nbsp;
            {interceptEnabled ? 'Disable Intercept' : 'Enable Intercept'}
          </button>
        </div>
      </PaneFixed>

      <PaneFixed>
        <Tabs
          className="theme--pane__body react-tabs"
          selectedIndex={tabIndex}
          onSelect={i => changeTab(i)}
        >
          <TabList>
            <Tab>
              <button type="button">Request</button>
            </Tab>
            <Tab>
              <button type="button">Payload</button>
            </Tab>
          </TabList>
        </Tabs>
      </PaneFixed>

      <PaneRemaining style={{ width: `${codeMirrorWidth}px` }}>
        {tabIndex === 0 && (
          <CodeEditor
            value={requestHeadersText}
            mimeType={null}
            ref={codeEditorRef}
            handleChange={handleChange}
          />
        )}
        {tabIndex === 1 && (
          <CodeEditor
            value={requestPayloadText}
            mimeType={null}
            ref={codeEditorRef}
            handleChange={handleChange}
          />
        )}
      </PaneRemaining>
    </PaneContainer>
  );
};
