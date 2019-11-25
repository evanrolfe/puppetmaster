import React from 'react';
import { Tab, TabList, Tabs, TabPanel } from 'react-tabs';

import { useTrackedState, useDispatch } from '../state/state';
import RequestTab from './RequestView/RequestTab';
import ResponseTab from './RequestView/ResponseTab';
import BodyTab from './RequestView/BodyTab';

export default () => {
  console.log(`[RENDER] RequestView`);

  const state = useTrackedState();
  const dispatch = useDispatch();

  const {
    request,
    requestViewTabIndex,
    windowSizeThrottel,
    orientation,
    paneWidth
  } = state;

  const setRequestViewTabIndex = i =>
    dispatch({ type: 'SET_TABINDEX', requestViewTabIndex: i });

  const getCodeMirrorWidth = () => {
    let codeMirrorWidth;
    const windowWidth = windowSizeThrottel[0];
    const sideBarWidth = 53;

    if (orientation === 'horizontal') {
      codeMirrorWidth = windowWidth - sideBarWidth;
    } else if (orientation === 'vertical') {
      codeMirrorWidth = windowWidth - sideBarWidth - paneWidth;
    }

    return codeMirrorWidth;
  };

  return (
    <div className="pane-remaining pane-container-vertical ">
      <div className="pane-fixed">
        <Tabs
          className="theme--pane__body react-tabs"
          selectedIndex={requestViewTabIndex}
          onSelect={i => setRequestViewTabIndex(i)}
        >
          <TabList>
            <Tab>
              <button type="button">Request</button>
            </Tab>

            <Tab>
              <button type="button">Response</button>
            </Tab>

            <Tab>
              <button type="button">Body</button>
            </Tab>
          </TabList>

          {/* Stupid Hack to avoid a warning from react-tabs: */}
          <TabPanel />
          <TabPanel />
          <TabPanel />
          <TabPanel />
        </Tabs>
      </div>

      {requestViewTabIndex === 0 && (
        <div className="pane-remaining">
          <RequestTab request={request} />
        </div>
      )}
      {requestViewTabIndex === 1 && (
        <div className="pane-remaining">
          <ResponseTab request={request} />
        </div>
      )}
      {requestViewTabIndex === 2 && (
        <BodyTab request={request} codeMirrorWidth={getCodeMirrorWidth()} />
      )}
    </div>
  );
};
