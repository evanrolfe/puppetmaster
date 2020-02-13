import React from 'react';
import PaneRemaining from '../../../pane/PaneRemaining';
import OriginalModifiedDropdown from './OriginalModifiedDropdown';

type Props = {
  showModifiedRequest: 'boolean',
  setOriginalRequest: 'function',
  setModifiedRequest: 'function',
  requestModified: 'boolean',
  method: 'string',
  url: 'string',
  headers: 'object',
  payload: 'string'
};

export default ({
  showModifiedRequest,
  payload,
  requestModified,
  setOriginalRequest,
  setModifiedRequest,
  method,
  url,
  headers
}: Props) => {
  let payloadContent;
  if (payload !== null) {
    payloadContent = (
      <>
        <br />
        <br />
        <span>Payload:</span>
        <br />
        <span className="selectable force-wrap">{payload}</span>
      </>
    );
  }

  let modifiedDropdown;
  if (requestModified === 1) {
    modifiedDropdown = (
      <OriginalModifiedDropdown
        setOriginal={setOriginalRequest}
        setModified={setModifiedRequest}
        showModified={showModifiedRequest}
        isModified={requestModified}
      />
    );
  }

  return (
    <PaneRemaining>
      <div className="request-tab-panel">
        <div className="row-fill row-fill--top">
          <div className="selectable force-wrap">
            <span className={`http-method-${method}`}>{method}</span> {url}
          </div>

          {modifiedDropdown}
        </div>

        <br />
        <span>Headers:</span>
        <br />
        <table
          key="table"
          className="table--fancy table--striped table--compact"
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(headers).map((key, i) => (
              <tr className="selectable" key={i}>
                <td style={{ whiteSpace: 'nowrap' }} className="force-wrap">
                  {key}
                </td>
                <td className="force-wrap">{headers[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {payloadContent}
      </div>
    </PaneRemaining>
  );
};
