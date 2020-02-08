import React from 'react';

type Props = {
  websocketMessages: 'array'
};

export default ({ websocketMessages }: Props) => (
  <div>There are {websocketMessages.length} messages to show.</div>
);
