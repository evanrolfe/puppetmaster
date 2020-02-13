import React from 'react';
import RequestTableRow from './RequestTableRow';
import { useSelector } from '../../../../state/state';
import { isRequestSelected } from '../../../../state/selectors';
/*
 * NOTE: This state component is a bit of a hack. We only use it in order to
 *       "inject" the isSelected state into the RequestTableRow because
 *       react-virtualized does not let us pass any more data through to the
 *       rows apart from the request object itsself.
 * TODO: Have a "selected" attribute set on the request object.
 */

type Props = {
  request: 'object'
};

export default (props: Props) => {
  const isSelected = useSelector(state =>
    isRequestSelected(state, props.request.id)
  );

  return <RequestTableRow {...props} isSelected={isSelected} />;
};
