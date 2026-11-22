
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'You must be logged in' });
  }
  next();
}

function requireAgent(req, res, next) {
  if (req.session.user.role !== 'agent') {
    return res.status(403).json({ error: 'Only support agents can do this' });
  }
  next();
}

module.exports = { requireLogin, requireAgent };