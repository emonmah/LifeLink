const DonationRequest = require("../models/DonationRequest");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

// controllers/requestController.js - Update sendRequest function
const sendRequest = async (req, res) => {
  try {
    const { 
      donorId, 
      patientName,
      patientAge,
      hospitalName, 
      hospitalAddress,
      bloodGroup,
      urgency,
      unitsNeeded,
      requiredDate,
      contactPerson,
      contactPhone,
      additionalNotes,
      seekerLocation // Add this: { lat, lng }
    } = req.body;
    
    const seekerId = req.user._id;

    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({ 
        success: false,
        msg: "Donor not found" 
      });
    }

    // Check if donor is available (90-day rule)
    if (donor.lastDonation) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      if (new Date(donor.lastDonation) > ninetyDaysAgo) {
        return res.status(400).json({
          success: false,
          msg: "Donor is not available (donated within last 90 days)"
        });
      }
    }

    // Check donor availability status
    if (!donor.isAvailable) {
      return res.status(400).json({
        success: false,
        msg: "Donor is currently unavailable"
      });
    }

    // Create the request
    const request = await DonationRequest.create({
      donorId,
      donorName: donor.name,
      donorBloodGroup: donor.bloodGroup,
      donorLocation: donor.location, // Store donor's location
      
      seekerId,
      seekerName: req.user.name,
      seekerLocation: seekerLocation, // Store seeker's location
      
      patientName,
      patientAge,
      hospitalName,
      hospitalAddress,
      bloodGroup,
      urgency,
      unitsNeeded,
      requiredDate,
      contactPerson,
      contactPhone,
      additionalNotes,
      
      status: "pending",
      createdAt: new Date()
    });

    // Send notification to donor (you can implement email/SMS)
    // sendMail(donor.email, "New Blood Request", `You have a new blood request from ${req.user.name}`);

    return res.status(201).json({
      success: true,
      msg: "Blood request sent successfully",
      request: {
        _id: request._id,
        donorName: donor.name,
        donorBloodGroup: donor.bloodGroup,
        patientName,
        hospitalName,
        status: request.status,
        createdAt: request.createdAt
      }
    });

  } catch (err) {
    console.error("Send request error:", err);
    return res.status(500).json({ 
      success: false,
      msg: "Error sending request",
      error: err.message 
    });
  }
};

// DONOR RESPONSE (Accept/Reject)
const respondRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { action } = req.body;
    const donorId = req.user._id;

    const request = await DonationRequest.findById(requestId);
    if (!request)
      return res.status(404).json({ msg: "Request not found" });

    if (String(request.donorId) !== String(donorId))
      return res.status(403).json({ msg: "Not authorized" });

    if (action === "accept") request.status = "accepted";
    else if (action === "reject") request.status = "rejected";
    else return res.status(400).json({ msg: "Invalid action" });

    await request.save();

    return res.json({
      msg: `Request ${action}ed successfully`,
      request
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// DONOR MARK COMPLETED
const completeDonation = async (req, res) => {
  try {
    const requestId = req.params.id;
    const donorId = req.user._id;

    const request = await DonationRequest.findById(requestId);
    if (!request)
      return res.status(404).json({ msg: "Request not found" });

    if (String(request.donorId) !== String(donorId))
      return res.status(403).json({ msg: "Not authorized" });

    request.status = "completed";
    request.donationDate = new Date();

    await request.save();

    return res.json({
      msg: "Donation marked completed. Waiting for admin verification.",
      request
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports={
    sendRequest,
    respondRequest,
    completeDonation
}
