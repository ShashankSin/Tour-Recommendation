import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['user', 'company', 'admin'],
      default: false,
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
  },
  {
    timestamps: true,
  }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
