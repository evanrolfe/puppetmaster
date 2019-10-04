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
  await store.connection.raw(schemaSql);
  console.log('Executed schema.sql');

  return store;
};

module.exports = { setupDatabaseStore };
