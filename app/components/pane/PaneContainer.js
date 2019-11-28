import * as React from 'react';

type Props = {
  orientation: 'string',
  children: 'object'
};

export default ({ orientation, children }: Props) => (
  <div className={`pane-container-${orientation}`}>{children}</div>
);
