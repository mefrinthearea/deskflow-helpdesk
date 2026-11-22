const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'helpdesk.db'));

// SQLite ignores foreign keys unless you turn them on for each connection
db.pragma('foreign_keys = ON');

module.exports = db;