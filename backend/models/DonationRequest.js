const { Schema, model } = require('mongoose');

const DonationRequestSchema = Schema({
  donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hospital: { type: String },
  bloodGroup: { type: String },
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  additionalInfo: { type: String },
  address: { type: String }, // Hospital address
  requestDate: { type: Date, default: Date.now },
  donationDate: { type: Date },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  proofDocumentUrl: { type: String },
  pointsAdded: { type: Boolean, default: false },
  donorLocation: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: [Number]
  },
  hospitalLocation: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: [Number]
  }
}, { timestamps: true });

const DonationRequest = model('DonationRequest', DonationRequestSchema);

module.exports = DonationRequest;
