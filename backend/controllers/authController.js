const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { sendMail } = require("../utils/mailer");

const generateTempToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      email: user.email 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: "24h" } // Increased from 10m to 24h
  );
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, bloodGroup, nidNumber, location } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !role || !nidNumber) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Blood group required for donors
    if (role === 'donor' && !bloodGroup) {
      return res.status(400).json({ msg: "Blood group is required for donors" });
    }

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ 
        msg: "Email already exists. Please use a different email or login." 
      });
    }

    // Check NID image
    if (!req.file) {
      return res.status(400).json({ msg: "NID image is required" });
    }

    const nidImageUrl = `/uploads/${req.file.filename}`;

    let locationData = {
      type: 'Point',
      coordinates: [0, 0], // Default [lon, lat]
      area: ""
    };

    try {
      const parsed = typeof location === 'string' ? JSON.parse(location) : location;
      
      if (parsed) {
        locationData = {
          type: 'Point',
          coordinates: [
            parseFloat(parsed.lon) || 0, 
            parseFloat(parsed.lat) || 0
          ],
          area: parsed.area || ""
        };
      }
    } catch (error) {
      console.error('Error parsing location:', error);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();



    // Create temporary token with HASHED password
    const tempToken = generateTempToken({
      name,
      email,
      phone,
      password: password,
      role,
      bloodGroup,
      nidNumber,
      nidImageUrl,
      otp,
      location: locationData 
    });

    // Send OTP via email
    await sendMail({
      to: email,
      subject: "LifeLink - Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; text-align: center;">LifeLink Email Verification</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering with LifeLink. Please use the OTP below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px;">${otp}</span>
            </div>
            <p>This OTP will expire in 5 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `
    });

    return res.status(201).json({
      success: true,
      msg: "OTP sent to your email. Please verify to complete registration.",
      temporaryToken: tempToken
    });

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ 
      success: false,
      msg: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: "Email and password are required" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        msg: "Invalid email or password" 
      });
    }

    console.log('Stored password hash:', user.password);
    console.log('Password length:', user.password?.length);

    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        msg: "Invalid email or password" 
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ 
        success: false,
        msg: "Please verify your email first. Check your inbox for the verification OTP." 
      });
    }

    // Check NID approval
    if (user.nidStatus !== "approved") {
      return res.status(403).json({ 
        success: false,
        msg: "Your NID verification is pending. Please wait for admin approval." 
      });
    }

    // Check account status
    if (user.status !== "active") {
      return res.status(403).json({ 
        success: false,
        msg: "Your account is not active. Please contact support." 
      });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        msg: "Your account has been blocked. Cotatct with admin@lifelink.com" 
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return user info (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bloodGroup: user.bloodGroup,
      totalPoints: user.totalPoints,
      nidStatus: user.nidStatus,
      lastDonationDate: user.lastDonationDate,
      nextAvailableDate: user.nextAvailableDate
    };

    return res.json({
      success: true,
      msg: "Login successful",
      token,
      user: userResponse
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ 
      success: false,
      msg: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ADMIN LOGIN
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Invalid admin credentials" });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid admin credentials" });
    }

    const token = generateToken(admin);

    return res.json({
      success: true,
      msg: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ 
      success: false,
      msg: "Server error during admin login" 
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { otp, temporaryToken } = req.body;

    if (!otp || !temporaryToken) {
      return res.status(400).json({ msg: "OTP and temporary token are required" });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(temporaryToken, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ msg: "Verification token has expired. Please register again." });
      }
      return res.status(400).json({ msg: "Invalid verification token" });
    }

    // Verify OTP
    if (otp !== decoded.otp) {
      return res.status(400).json({ msg: "Invalid OTP. Please check and try again." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ 
        msg: "User already exists. Please login instead." 
      });
    }

    const isSeeker = decoded.role === 'seeker'
    const user = new User({
      name: decoded.name,
      email: decoded.email,
      password: decoded.password, // This is the plain text password from the token
      phone: decoded.phone,
      role: decoded.role || 'donor',
      bloodGroup: decoded.bloodGroup,
      location: decoded.location,
      emailVerified: true, // They just verified it!
      status: isSeeker ? 'active' : 'pending' ,
      nidStatus: isSeeker? 'approved' : 'pending',
      nidNumber: decoded.nidNumber, 
      nidImageUrl: decoded.nidImageUrl, 
      location: decoded.location || {}

    });

    await user.save();

    return res.json({
      success: true,
      msg: "Email verified successfully! Your account is now pending NID verification by admin.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        nidStatus: user.nidStatus,
        status: user.status,
        location: user.location
      }
    });

  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ 
      success: false,
      msg: "Server error during email verification",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  verifyEmail
};