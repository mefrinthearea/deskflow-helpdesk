const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/database');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'This email is already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);

  // the role is not taken from the request, so nobody can register as an agent
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name.trim(), email, hash, 'customer');

  req.session.user = { id: result.lastInsertRowid, name: name.trim(), role: 'customer' };
  res.status(201).json(req.session.user);
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // same message for both cases, so an attacker can't tell which emails exist
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.json(req.session.user);
});

router.post('/logout', requireLogin, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', requireLogin, (req, res) => {
  res.json(req.session.user);
});

module.exports = router;