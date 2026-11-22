const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./database');

const schema = fs.readFileSync(
  path.join(__dirname, '..', '..', 'database', 'schema.sql'),
  'utf8'
);
db.exec(schema);

const PASSWORD = 'Test1234!';
const hash = bcrypt.hashSync(PASSWORD, 10);

const insertUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
);
insertUser.run('Anna Customer', 'customer@test.com', hash, 'customer');
insertUser.run('Nika Customer', 'customer2@test.com', hash, 'customer');
insertUser.run('Sandro Agent', 'agent@test.com', hash, 'agent');

const insertTicket = db.prepare(
  `INSERT INTO tickets (title, description, category, priority, status, created_by)
   VALUES (?, ?, ?, ?, ?, ?)`
);
insertTicket.run('University email not working', 'I get "invalid password" even after resetting it.', 'Account access', 'high', 'open', 1);
insertTicket.run('Wi-Fi drops in the library', 'Connection cuts out every 10 minutes on the 2nd floor.', 'Network', 'medium', 'in_progress', 1);
insertTicket.run('Cannot open Moodle course', 'The course page shows a blank screen.', 'Software', 'low', 'open', 2);
insertTicket.run('Printer in room 204 is offline', 'Nobody can print since Monday.', 'Hardware', 'medium', 'resolved', 2);

const insertComment = db.prepare(
  'INSERT INTO comments (ticket_id, user_id, body) VALUES (?, ?, ?)'
);
insertComment.run(2, 3, 'We are checking the access point on that floor.');
insertComment.run(2, 1, 'Thanks, it happened again today at 14:00.');
insertComment.run(4, 3, 'Printer restarted and reconnected to the network.');

console.log('Database created and seeded.');