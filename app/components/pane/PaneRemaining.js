import * as React from 'react';

type Props = {
  children: 'object'
};

export default (props: Props) => (
  <div className="pane-remaining" {...props}>
    {props.children}
  </div>
);
