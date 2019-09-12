const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class Database {
  constructor(fileName) {
    this.db = new sqlite3.Database(fileName);

    this.runSchema();
  }

  runSchema() {
    const schemaSql = fs.readFileSync(`${__dirname}/schema.sql`, 'utf8');
    this.db.run(schemaSql);
  }
}

module.exports = Database;
