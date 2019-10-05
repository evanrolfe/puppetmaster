CREATE TABLE IF NOT EXISTS requests(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
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
  response_body_length INTEGER
);
