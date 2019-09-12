CREATE TABLE IF NOT EXISTS requests(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  request_headers TEXT,
  request_post_data TEXT,
  request_resource_type TEXT,
  response_status INTEGER,
  response_headers TEXT,
  response_body TEXT
);
