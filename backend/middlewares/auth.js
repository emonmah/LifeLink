const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ msg: 'No user found' });
    if (user.isBlocked || user.status !== 'active') return res.status(403).json({ msg: 'Account not active' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token invalid', error: err.message });
  }
};

module.exports = { protect };
