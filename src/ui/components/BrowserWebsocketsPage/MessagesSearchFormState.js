import React from 'react';

import { useDispatch, useSelector } from '../../state/state';
import MessagesSearchForm from './MessagesSearchForm';

export default () => {
  const dispatch = useDispatch();
  const filters = useSelector(state => state.browserWebsocketsPage.filters);

  const handleSearch = e => {
    dispatch({ type: 'SEARCH_WEBSOCKET_MESSAGES', value: e.target.value });
  };

  return <MessagesSearchForm filters={filters} handleSearch={handleSearch} />;
};
