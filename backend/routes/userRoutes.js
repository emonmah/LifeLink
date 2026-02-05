const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { sendRequest, respondRequest, completeDonation } = require('../controllers/userController');

router.post('/requests', protect, sendRequest); // send request
router.post('/requests/:id/respond', protect, respondRequest); // accept/reject by donor
router.post('/requests/:id/complete', protect, completeDonation); // donor marks completed

module.exports = router;
