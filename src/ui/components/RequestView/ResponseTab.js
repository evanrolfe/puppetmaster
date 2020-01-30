import React from 'react';
import PaneRemaining from '../pane/PaneRemaining';
import OriginalModifiedDropdown from './OriginalModifiedDropdown';

type Props = {
  statusCode: 'string',
  statusMessage: 'string',
  headers: 'object',
  setOriginalResponse: 'function',
  setModifiedResponse: 'function',
  showModifiedResponse: 'boolean',
  responseModified: 'boolean'
};

export default ({
  statusCode,
  statusMessage,
  headers,
  setOriginalResponse,
  setModifiedResponse,
  showModifiedResponse,
  responseModified
}: Props) => {
  let content;

  let modifiedDropdown;
  if (responseModified === 1) {
    modifiedDropdown = (
      <OriginalModifiedDropdown
        setOriginal={setOriginalResponse}
        setModified={setModifiedResponse}
        showModified={showModifiedResponse}
        isModified={responseModified}
      />
    );
  }

  if (statusCode === null) {
    content = <>No response received.</>;
  } else {
    content = (
      <>
        <div className="row-fill row-fill--top">
          Response status: {statusCode} {statusMessage}
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
      </>
    );
  }

  return (
    <PaneRemaining>
      <div className="request-tab-panel">{content}</div>
    </PaneRemaining>
  );
};
