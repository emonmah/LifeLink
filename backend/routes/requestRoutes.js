const express = require('express');
const router = express.Router();
const {
    createRequest,
    getSeekerRequests,
    getDonorRequests,
    updateRequestStatus
} = require('../controllers/requestController');
const { protect } = require('../middlewares/auth');

// Apply protection to all routes
router.use(protect);

// Create new request
router.post('/', createRequest);

// Get requests for seeker dashboard
router.get('/seeker', getSeekerRequests);

// Get requests for donor dashboard
router.get('/donor', getDonorRequests);

const upload = require('../middlewares/upload');

// Update request status (accept, reject, complete, cancel)
router.put('/:id/status', upload.single('proofDocument'), updateRequestStatus);

module.exports = router;
