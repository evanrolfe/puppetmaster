export default `CREATE TABLE IF NOT EXISTS requests(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  browser_id INTEGER,
  method TEXT,
  url TEXT,
  host TEXT,
  path TEXT,
  ext TEXT,
  created_at INTEGER,
  request_type TEXT,
  request_headers TEXT,
  request_payload TEXT,
  response_status INTEGER,
  response_status_message TEXT,
  response_headers TEXT,
  response_remote_address TEXT,
  response_body TEXT,
  response_body_length INTEGER,
  response_body_rendered TEXT
);

CREATE TABLE IF NOT EXISTS capture_filters(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filters TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS intercept_filters(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filters TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS browsers(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  open INTEGER NOT NULL,
  cookies TEXT,
  pages TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS settings(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);`;
