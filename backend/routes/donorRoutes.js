// routes/donorRoutes.js
const express = require('express');
const router = express.Router();
const { searchDonors, updateLocation } = require('../controllers/donorController');
const { protect } = require('../middlewares/auth');

// Search donors by blood group (optional: sort by distance if lat/lng provided)
router.get('/search', searchDonors);

module.exports = router;
