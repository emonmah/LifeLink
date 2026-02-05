const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');

// Create a new blood donation request
const createRequest = async (req, res) => {
    try {
        const { donorId, hospital, bloodGroup, urgency, additionalInfo, address } = req.body;
        const seekerId = req.user._id;

        if (!donorId || !hospital || !bloodGroup) {
            return res.status(400).json({ success: false, msg: "Missing required fields" });
        }

        // Check if donor exists
        const donor = await User.findById(donorId);
        if (!donor) {
            return res.status(404).json({ success: false, msg: "Donor not found" });
        }

        // Check if user is requesting to themselves (optional)
        if (donorId.toString() === seekerId.toString()) {
            return res.status(400).json({ success: false, msg: "Cannot request blood from yourself" });
        }

        const newRequest = new DonationRequest({
            donorId,
            seekerId,
            hospital,
            bloodGroup,
            urgency,
            additionalInfo,
            address,
            status: 'pending'
        });

        await newRequest.save();

        res.status(201).json({
            success: true,
            msg: "Request sent successfully",
            request: newRequest
        });

    } catch (err) {
        console.error("Create Request Error:", err);
        res.status(500).json({ success: false, msg: "Server Error", error: err.message });
    }
};

// Get requests for the current seeker (My Requests)
const getSeekerRequests = async (req, res) => {
    try {
        const requests = await DonationRequest.find({ seekerId: req.user._id })
            .populate('donorId', 'name phone bloodGroup')
            .sort({ createdAt: -1 });

        // Transform for frontend
        const formattedRequests = requests.map(r => {
            const requestObj = r.toObject();
            return {
                ...requestObj,
                donor: requestObj.donorId, // Map donorId populate result to 'donor'
                location: requestObj.address || 'Location not specified'
            };
        });

        res.json(formattedRequests);
    } catch (err) {
        console.error("Get Seeker Requests Error:", err);
        res.status(500).json({ success: false, msg: "Server Error", error: err.message });
    }
};

// Get requests for the current donor (Incoming Requests)
const getDonorRequests = async (req, res) => {
    try {
        const requests = await DonationRequest.find({ donorId: req.user._id })
            .populate('seekerId', 'name phone')
            .sort({ createdAt: -1 });

        const formattedRequests = requests.map(r => {
            const requestObj = r.toObject();
            return {
                ...requestObj,
                seeker: requestObj.seekerId, // Map seekerId populate result to 'seeker'
                location: requestObj.address || 'Location not specified'
            };
        });

        res.json(formattedRequests);
    } catch (err) {
        console.error("Get Donor Requests Error:", err);
        res.status(500).json({ success: false, msg: "Server Error", error: err.message });
    }
};

// Update request status (Accept, Reject, Complete, Cancel)
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted', 'rejected', 'completed', 'cancelled'

        if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, msg: "Invalid status" });
        }

        const request = await DonationRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, msg: "Request not found" });
        }

        const userId = req.user._id.toString();
        const donorId = request.donorId.toString();
        const seekerId = request.seekerId.toString();

        // Authorization logic
        if (userId !== donorId && userId !== seekerId) {
            return res.status(403).json({ success: false, msg: "Not authorized to update this request" });
        }

        // Seeker can only cancel
        if (userId === seekerId && status !== 'cancelled') {
            return res.status(403).json({ success: false, msg: "Sequester can only cancel requests" });
        }

        // Donor can accept, reject, complete
        if (userId === donorId && status === 'cancelled') {
            // Optional: allow donor to cancel/reject? usually 'rejected' is better
            // Let's assume cancelled is reserved for seeker primarily, but technically allows it if logic says so.
            // For strictness:
            return res.status(403).json({ success: false, msg: "Use reject instead of cancel" });
        }

        request.status = status;

        if (status === 'completed') {
            request.donationDate = new Date();
            if (req.file) {
                request.proofDocumentUrl = req.file.path.replace(/\\/g, "/"); // Normalize path
            }
        }

        await request.save();
        res.json({ success: true, msg: `Request ${status}`, request });

    } catch (err) {
        console.error("Update Status Error:", err);
        res.status(500).json({ success: false, msg: "Server Error", error: err.message });
    }
};

module.exports = {
    createRequest,
    getSeekerRequests,
    getDonorRequests,
    updateRequestStatus
};
