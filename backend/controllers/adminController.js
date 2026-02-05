const DonationRequest = require("../models/DonationRequest");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

const listRequests = async (req, res) => {
  try {
    const requests = await DonationRequest.find()
      .populate("donorId seekerId", "name email phone")
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(r => {
      const requestObj = r.toObject();
      return {
        ...requestObj,
        donor: requestObj.donorId,
        seeker: requestObj.seekerId
      };
    });

    return res.json({
      count: formattedRequests.length,
      requests: formattedRequests
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// VERIFY DONATION
const verifyDonation = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await DonationRequest.findById(requestId);
    if (!request)
      return res.status(404).json({ msg: "Request not found" });

    if (request.status !== "completed")
      return res.status(400).json({ msg: "Donor has not completed donation yet" });

    if (request.verified)
      return res.status(400).json({ msg: "Already verified" });

    const donor = await User.findById(request.donorId);

    // Add points + update last donation
    donor.totalPoints += 100;
    donor.lastDonationDate = request.donationDate;

    // Set 3 month next availability
    const next = new Date(request.donationDate);
    next.setMonth(next.getMonth() + 3);
    donor.nextAvailableDate = next;

    await donor.save();

    request.verified = true;
    request.verifiedBy = req.admin._id;
    request.pointsAdded = true;
    await request.save();

    return res.json({
      msg: "Donation verified & points awarded",
      request
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
// APPROVE USER NID
const approveUserNid = async (req, res) => {
  try {
    const { userId, approve } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });

    if (approve) {
      user.nidVerified = true;
      user.nidStatus = "approved";
      user.status = "active";
      user.verifiedBy = req.admin._id;
      user.verifiedAt = new Date();
    } else {
      user.nidVerified = false;
      user.nidStatus = "rejected";
      user.status = "rejected";
      user.verifiedBy = req.admin._id;
      user.verifiedAt = new Date();
    }

    await user.save();

    return res.json({
      success: true,
      msg: `User NID ${approve ? 'approved' : 'rejected'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        nidStatus: user.nidStatus,
        status: user.status
      }
    });

  } catch (err) {
    console.error('❌ NID approval error:', err);
    return res.status(500).json({
      success: false,
      msg: "Server error during NID approval",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const pendingNID = async (req, res) => {
  try {
    const users = await User.find({ role: 'donor' })
    .select('name email phone nidNumber nidVerified nidImageUrl role createdAt')
    .sort({ createdAt: -1 })
    .lean();
    
    const pendingUsers = users.filter(user => 
      !user.nidVerified || user.nidVerified === undefined
    );
    
    // Convert images to base64
    const usersWithBase64 = await Promise.all(pendingUsers.map(async (user) => {
      try {
        if (user.nidImageUrl) {
          const fs = require('fs');
          const path = require('path');
          
          // Extract filename
          const filename = user.nidImageUrl.split('/').pop();
          const filePath = path.join(__dirname, '../uploads/nid-images', filename);
          
          if (fs.existsSync(filePath)) {
            const imageBuffer = fs.readFileSync(filePath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = 'image/png'; // Adjust based on actual file type
            
            return {
              ...user,
              nidImageBase64: `data:${mimeType};base64,${base64Image}`
            };
          }
        }
        
        return {
          ...user,
          nidImageBase64: null
        };
        
      } catch (error) {
        console.error(`Error processing image for user ${user._id}:`, error);
        return {
          ...user,
          nidImageBase64: null
        };
      }
    }));
    
    res.json({
      success: true,
      count: usersWithBase64.length,
      totalWithNID: users.length,
      users: usersWithBase64.map(user => ({
        _id: user._id,
        name: user.name || 'No Name',
        email: user.email,
        phone: user.phone || '',
        nidNumber: user.nidNumber,
        nidImageUrl: user.nidImageUrl || '',
        nidImageBase64: user.nidImageBase64, // Add this
        nidVerified: user.nidVerified || false,
        role: user.role || 'user',
        createdAt: user.createdAt,
        status: user.nidVerified ? 'verified' : 'pending'
      }))
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const shouldBlock = status === 'blocked';
    console.log(shouldBlock);
    

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: shouldBlock },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${shouldBlock ? 'blocked' : 'unblocked'} successfully`,
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const fileManage = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/nid-images', filename);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }
    
    // Set proper headers for images
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for images
    
    // Send the file
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Error serving NID image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to serve image' 
    });
  }
}
const userList = async (req, res) => {
  try {
    // Get query parameters for filtering
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      verified = '',
      hasNID = ''
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role) {
      filter.role = role;
    }
    
    // Filter by verification status
    if (verified !== '') {
      filter.isVerified = verified === 'true';
    }
    
    // Filter by NID presence
    if (hasNID !== '') {
      if (hasNID === 'true') {
        filter.nidNumber = { $exists: true, $ne: null, $ne: '' };
      } else {
        filter.$or = [
          { nidNumber: { $exists: false } },
          { nidNumber: null },
          { nidNumber: '' }
        ];
      }
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with filters
    const users = await User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Get statistics
    const stats = {
      totalUsers: await User.countDocuments(),
      verifiedUsers: await User.countDocuments({ isVerified: true }),
      usersWithNID: await User.countDocuments({ 
        nidNumber: { $exists: true, $ne: null, $ne: '' } 
      }),
      verifiedNID: await User.countDocuments({ nidVerified: true }),
      adminUsers: await User.countDocuments({ role: 'admin' })
    };
    
    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      stats,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isVerified: user.isVerified || false,
        nidNumber: user.nidNumber || '',
        nidVerified: user.nidVerified || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        isBlocked: user.isBlocked
      }))
    });
    
  } catch (error) {
    console.error('❌ GET /admin/users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

const rejectUserNID = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    console.log(user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Send the email (wait for it to finish or handle failure)
    try {
      await sendMail({
        to: user.email,
        subject: "LifeLink - Invalid documents",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2>Please register again with your proper documents</h2>
            </div>
          </div>
        `
      });
    } catch (mailError) {
      console.error("Email failed to send, but proceeding with deletion:", mailError);
      // Optional: decide if you want to delete the user even if the email fails
    }

    // 4. Delete the user
    await User.findByIdAndDelete(userId);
    
    // 5. Final success response
    return res.status(200).json({
      success: true,
      message: 'User notified and deleted successfully'
    });

  } catch (error) {
    console.error("Reject User Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listRequests,
  verifyDonation,
  approveUserNid,
  updateUserStatus,
  pendingNID,
  fileManage,
  userList,
  rejectUserNID
};