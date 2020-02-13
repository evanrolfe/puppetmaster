import React from 'react';

type Props = {
  filters: 'object',
  handleSearch: 'function'
};

export default ({ filters, handleSearch }: Props) => (
  <div className="pane-control">
    <div
      className="form-control form-control--outlined"
      style={{
        width: '60%',
        maxWidth: '800px',
        display: 'inline-block'
      }}
    >
      <label>Search:</label>
      <input
        type="text"
        style={{ width: '100%' }}
        placeholder="Enter search term"
        value={filters.search}
        onChange={handleSearch}
      />
    </div>
  </div>
);
