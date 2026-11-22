const express = require('express');
const db = require('../db/database');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

function isValidBody(body) {
  return typeof body === 'string' && body.trim().length > 0 && body.trim().length <= 1000;
}

function findComment(id) {
  return db
    .prepare(
      `SELECT c.id, c.ticket_id, c.user_id, c.body, c.created_at,
              u.name AS author_name, u.role AS author_role
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`
    )
    .get(id);
}

// add a comment: ticket owner or any agent
router.post('/tickets/:id/comments', requireLogin, (req, res) => {
  const ticketId = Number(req.params.id);
  if (!Number.isInteger(ticketId)) {
    return res.status(400).json({ error: 'Invalid ticket id' });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const user = req.session.user;
  if (user.role !== 'agent' && ticket.created_by !== user.id) {
    return res.status(403).json({ error: 'You can only comment on your own tickets' });
  }

  if (!isValidBody(req.body.body)) {
    return res.status(400).json({ error: 'Comment must be 1 to 1000 characters' });
  }

  const result = db
    .prepare('INSERT INTO comments (ticket_id, user_id, body) VALUES (?, ?, ?)')
    .run(ticketId, user.id, req.body.body.trim());

  res.status(201).json(findComment(result.lastInsertRowid));
});

// edit a comment: only its author
router.put('/comments/:id', requireLogin, (req, res) => {
  const commentId = Number(req.params.id);
  if (!Number.isInteger(commentId)) {
    return res.status(400).json({ error: 'Invalid comment id' });
  }

  const comment = findComment(commentId);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  if (comment.user_id !== req.session.user.id) {
    return res.status(403).json({ error: 'You can only edit your own comments' });
  }

  if (!isValidBody(req.body.body)) {
    return res.status(400).json({ error: 'Comment must be 1 to 1000 characters' });
  }

  db.prepare('UPDATE comments SET body = ? WHERE id = ?').run(
    req.body.body.trim(),
    commentId
  );
  res.json(findComment(commentId));
});

// delete a comment: its author or any agent
router.delete('/comments/:id', requireLogin, (req, res) => {
  const commentId = Number(req.params.id);
  if (!Number.isInteger(commentId)) {
    return res.status(400).json({ error: 'Invalid comment id' });
  }

  const comment = findComment(commentId);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  const user = req.session.user;
  if (user.role !== 'agent' && comment.user_id !== user.id) {
    return res.status(403).json({ error: 'You can only delete your own comments' });
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
  res.json({ message: 'Comment deleted' });
});

module.exports = router;