const express = require('express');
const db = require('../db/database');
const { requireLogin, requireAgent } = require('../middleware/auth');

const router = express.Router();

// every ticket route needs a logged in user
router.use(requireLogin);

const CATEGORIES = ['Account access', 'Network', 'Software', 'Hardware', 'Other'];
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// returns an error message, or null if everything is fine
function validateTicketFields({ title, description, category, priority }) {
  if (!isText(title)) return 'Title is required';
  if (title.trim().length > 100) return 'Title must be 100 characters or less';
  if (!isText(description)) return 'Description is required';
  if (!CATEGORIES.includes(category)) return 'Category is not valid';
  if (!PRIORITIES.includes(priority)) return 'Priority must be low, medium or high';
  return null;
}

// finds the ticket and checks that this user may see it
// sends the error response itself and returns null if something is wrong
function loadTicket(req, res) {
  const ticketId = Number(req.params.id);
  if (!Number.isInteger(ticketId)) {
    res.status(400).json({ error: 'Invalid ticket id' });
    return null;
  }

  const ticket = db
    .prepare(
      `SELECT t.*, u.name AS created_by_name
       FROM tickets t
       JOIN users u ON u.id = t.created_by
       WHERE t.id = ?`
    )
    .get(ticketId);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return null;
  }

  const user = req.session.user;
  if (user.role !== 'agent' && ticket.created_by !== user.id) {
    res.status(403).json({ error: 'You can only access your own tickets' });
    return null;
  }

  return ticket;
}

router.get('/', (req, res) => {
  const user = req.session.user;
  let tickets;

  if (user.role === 'agent') {
    tickets = db
      .prepare(
        `SELECT t.*, u.name AS created_by_name
         FROM tickets t
         JOIN users u ON u.id = t.created_by
         ORDER BY t.created_at DESC, t.id DESC`
      )
      .all();
  } else {
    tickets = db
      .prepare(
        `SELECT t.*, u.name AS created_by_name
         FROM tickets t
         JOIN users u ON u.id = t.created_by
         WHERE t.created_by = ?
         ORDER BY t.created_at DESC, t.id DESC`
      )
      .all(user.id);
  }

  res.json(tickets);
});

router.get('/:id', (req, res) => {
  const ticket = loadTicket(req, res);
  if (!ticket) return;

  ticket.comments = db
    .prepare(
      `SELECT c.id, c.ticket_id, c.user_id, c.body, c.created_at,
              u.name AS author_name, u.role AS author_role
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.ticket_id = ?
       ORDER BY c.created_at, c.id`
    )
    .all(ticket.id);

  res.json(ticket);
});

router.post('/', (req, res) => {
  const user = req.session.user;
  if (user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can open tickets' });
  }

  const message = validateTicketFields(req.body);
  if (message) {
    return res.status(400).json({ error: message });
  }

  const { title, description, category, priority } = req.body;
  const result = db
    .prepare(
      `INSERT INTO tickets (title, description, category, priority, created_by)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(title.trim(), description.trim(), category, priority, user.id);

  const created = db
    .prepare('SELECT * FROM tickets WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const ticket = loadTicket(req, res);
  if (!ticket) return;

  const user = req.session.user;

  if (user.role === 'agent') {
    // agents only change the status
    if (!STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: 'Status is not valid' });
    }
    db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(
      req.body.status,
      ticket.id
    );
  } else {
    // customers only edit the text, and only while the ticket is still open
    if (ticket.status !== 'open') {
      return res
        .status(403)
        .json({ error: 'Tickets can only be edited while they are open' });
    }
    const message = validateTicketFields(req.body);
    if (message) {
      return res.status(400).json({ error: message });
    }
    const { title, description, category, priority } = req.body;
    db.prepare(
      `UPDATE tickets
       SET title = ?, description = ?, category = ?, priority = ?
       WHERE id = ?`
    ).run(title.trim(), description.trim(), category, priority, ticket.id);
  }

  const updated = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticket.id);
  res.json(updated);
});

// requireAgent runs first, so a customer never reaches the delete
router.delete('/:id', requireAgent, (req, res) => {
  const ticket = loadTicket(req, res);
  if (!ticket) return;

  db.prepare('DELETE FROM tickets WHERE id = ?').run(ticket.id);
  res.json({ message: 'Ticket deleted' });
});

module.exports = router;