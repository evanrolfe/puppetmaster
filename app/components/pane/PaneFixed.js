import * as React from 'react';

export default React.forwardRef((props, ref) => (
  <div className="pane-fixed" {...props} ref={ref}>
    {props.children}
  </div>
));
