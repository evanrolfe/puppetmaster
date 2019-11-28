import * as React from 'react';

type Props = {
  children: 'object'
};

export default ({ children }: Props) => (
  <div className="pane-remaining">{children}</div>
);
