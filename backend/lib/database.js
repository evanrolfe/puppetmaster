const fs = require('fs');
const Store = require('openrecord/store/sqlite3');

const setupDatabaseStore = async databaseFile => {
  const store = new Store({
    file: databaseFile,
    autoLoad: true,
    models: [require('../models/Request')]
  });
  await store.ready();

  console.log('Loaded database');
  const schemaSql = fs.readFileSync(`${__dirname}/schema.sql`, 'utf8');

  const queries = schemaSql
    .toString()
    .replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
    .replace(/\s+/g, ' ') // excess white space
    .split(';') // split into all statements
    .map(Function.prototype.call, String.prototype.trim)
    .filter(el => el.length !== 0); // remove any empty ones

  for (let i = 0; i < queries.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await store.connection.raw(queries[i]);
  }

  console.log('Executed schema.sql');

  return store;
};

module.exports = { setupDatabaseStore };
