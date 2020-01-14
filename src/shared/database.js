import knex from 'knex';
import schemaSql from './schema';

const setupDatabaseStore = async databaseFile => {
  const dbconn = knex({
    client: 'sqlite3',
    connection: {
      filename: databaseFile
    },
    useNullAsDefault: true
  });

  console.log('Loaded database');

  const queries = schemaSql
    .toString()
    .replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
    .replace(/\s+/g, ' ') // excess white space
    .split(';') // split into all statements
    .map(Function.prototype.call, String.prototype.trim)
    .filter(el => el.length !== 0); // remove any empty ones

  for (let i = 0; i < queries.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await dbconn.raw(queries[i]);
  }

  console.log('Executed schema.sql');

  return dbconn;
};

export default { setupDatabaseStore };
