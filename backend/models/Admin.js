const {Schema, model} = require('mongoose');
const bcrypt = require("bcryptjs");

const AdminSchema = Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minLength: [3, 'Name must be at least 3 characters'],
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please use a valid email']
  },
  phone: { 
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number']
  },
  password: { 
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = model('Admin', AdminSchema);
module.exports = Admin;