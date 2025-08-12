import mongoose from 'mongoose'

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    address: {
      type: String,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyOtp: {
      type: String,
      default: '',
    },
    verifyOtpExpiry: {
      type: Number,
      default: 0,
    },
    resetOtp: {
      type: String,
      default: '',
    },
    resetOtpExpiry: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

const Company =
  mongoose.models.Company || mongoose.model('Company', companySchema)

export default Company
