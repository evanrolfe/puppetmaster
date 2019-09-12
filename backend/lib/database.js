const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class Database {
  constructor() {
    this.db = new sqlite3.Database('pntest.db');

    this.runSchema();
  }

  runSchema() {
    const schemaSql = fs.readFileSync(`${__dirname}/schema.sql`, 'utf8');
    this.db.run(schemaSql);
  }
}

module.exports = Database;
