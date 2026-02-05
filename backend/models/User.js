const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const LocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  },
  area: { type: String } // Keeps your human-readable address
});

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: {
    type: String, 
    required: true, 
    unique: true,
    lowercase: true
  },
  phone: { 
    type: String,
    required: true
  },
  password: { 
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ['donor', 'seeker', 'admin'],
    default: 'donor'
  },
  bloodGroup: { 
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', null],
    default: null
  },
  location: LocationSchema,
  nidNumber: { 
    type: String,
    default: ''
  },
  nidVerified: {
    type: Boolean,
    default: false
  },
  nidImageUrl: { 
    type: String,
    default: ''
  },
  nidStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending'
  },
  status: { 
    type: String, 
    enum: ['active', 'pending', 'blocked', 'rejected'], 
    default: 'pending'
  },
  lastDonationDate: { type: Date },
  nextAvailableDate: { type: Date },
  totalPoints: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

const User = mongoose.model('User', UserSchema);
module.exports = User;