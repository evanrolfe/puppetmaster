import React, { Component } from 'react';
import { Tab, TabList, Tabs, TabPanel } from 'react-tabs';
import RequestTab from './RequestView/RequestTab';
import ResponseTab from './RequestView/ResponseTab';
import BodyTab from './RequestView/BodyTab';
import CookiesTab from './RequestView/CookiesTab';

type Props = {
  selectedRequestId: 'number',
  panelHeight: 'number'
};

export default class RequestView extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = { request: {} };
    this.loadRequest();
  }

  componentDidMount() {
    this.loadRequest();
  }

  componentDidUpdate(previousProps) {
    if (this.props.selectedRequestId !== previousProps.selectedRequestId) {
      this.loadRequest();
    }
  }

  async loadRequest() {
    if (this.props === undefined || this.props.selectedRequestId === undefined)
      return;

    const id = this.props.selectedRequestId;
    const response = await global.backendConn.send(
      'RequestsController',
      `show`,
      { id: id }
    );
    const request = response.result.body;

    if (request !== undefined && request.id !== this.state.request.id) {
      const newState = Object.assign({}, this.state);
      newState.request = request;
      this.setState(newState);
    }
  }

  render() {
    const request = this.state.request;

    return (
      <>
        <Tabs className="pane__tabs theme--pane__body react-tabs">
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

            <Tab>
              <button type="button">Cookies</button>
            </Tab>
          </TabList>

          {/* Stupid Hack to avoid a warning from react-tabs: */}
          <TabPanel>
            <RequestTab height={this.props.panelHeight} request={request} />
          </TabPanel>
          <TabPanel>
            <ResponseTab height={this.props.panelHeight} request={request} />
          </TabPanel>
          <TabPanel>
            <BodyTab request={request} />
          </TabPanel>
          <TabPanel>
            <CookiesTab request={request} />
          </TabPanel>
        </Tabs>
      </>
    );
  }
}
