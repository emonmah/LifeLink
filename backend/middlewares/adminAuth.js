const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminProtect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Admin token missing' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) return res.status(401).json({ msg: 'No admin found' });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid admin token' });
  }
};

module.exports = { adminProtect };
