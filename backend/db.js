const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'jobs.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskName TEXT NOT NULL,
      payload TEXT,
      priority TEXT CHECK(priority IN ('Low','Medium','High')) NOT NULL,
      status TEXT CHECK(status IN ('pending','running','completed')) NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      completedAt TEXT
    )
  `);
});

module.exports = db;