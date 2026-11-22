require('dotenv').config();
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const commentRoutes = require('./routes/comments');

const app = express();

app.use(express.json()); // lets req.body contain the JSON the frontend sends

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' }
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', commentRoutes);


 // unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// errors thrown by Express itself, e.g. broken JSON in the request body
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Something went wrong' : 'Invalid request'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
