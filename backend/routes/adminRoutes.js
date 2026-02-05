const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middlewares/adminAuth');
const {listRequests, verifyDonation, approveUserNid, updateUserStatus, pendingNID, fileManage, userList, rejectUserNID} = require('../controllers/adminController');
const seedAdmin = require('../config/adminSeeder');
const User = require('../models/User')

router.get('/requests', adminProtect, listRequests);
router.post('/requests/:id/verify', adminProtect, verifyDonation);
router.post('/users/nid-approve', adminProtect, approveUserNid);
router.get('/users', userList);
router.get('/users/pending-nid', adminProtect, pendingNID)

// Make this route public
router.get('/nid-image/:filename', fileManage);
router.delete('/users/nid-reject', rejectUserNID);
router.put('/users/:id/status', updateUserStatus);
module.exports = router;
