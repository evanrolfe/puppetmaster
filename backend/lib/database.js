const fs = require('fs');
const SqliteAsync = require('sqlite-async');

const setupDatabase = async databaseFile => {
  const db = await SqliteAsync.open(databaseFile);

  const schemaSql = fs.readFileSync(`${__dirname}/schema.sql`, 'utf8');
  await db.run(schemaSql);

  return db;
};

module.exports = setupDatabase;
