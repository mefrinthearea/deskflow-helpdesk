require('dotenv').config();
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');

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
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});