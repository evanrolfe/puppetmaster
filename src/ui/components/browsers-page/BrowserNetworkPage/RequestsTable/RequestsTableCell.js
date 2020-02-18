import React from 'react';

type Props = {
  'aria-colindex': 'number',
  'aria-describedby': 'string',
  className: 'string',
  key: 'string',
  onClick: 'function',
  role: 'string',
  style: 'string',
  title: 'string',
  children: 'array'
};

export default (props: Props) => {
  const { className, key, onClick, role, style, title, children } = props;

  return (
    <div
      aria-colindex={props['aria-colindex']}
      aria-describedby={props['aria-describedby']}
      className={className}
      key={key}
      onClick={onClick}
      role={role}
      style={style}
      title={title}
    >
      {children}
    </div>
  );
};
