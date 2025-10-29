const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch(err){
    return res.status(401).json({ message: 'Invalid token' });
  }
}
