import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../model/userModel.js'
import transporter from '../config/nodemailer.js'
import dotenv from 'dotenv'
dotenv.config()
export const registerUser = async (req, res) => {
  const { name, email, password, userType } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    })
  }
  try {
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      role: userType || 'user',
    })
    await user.save()
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    )
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    user.verifyOtp = otp
    user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000
    await user.save()
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Verification OTP',
      text: `Your verification OTP is: ${otp}`,
    }
    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      token,
      userId: user._id,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    })
  }

  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password',
      })
    }

    //! Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    )

    //! Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    //! Send Response
    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error logging in user',
    })
  }
}

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    return res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error logging out user',
    })
  }
}

// Otp Verification
export const sendVerificationOtp = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await userModel.findById(userId)
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: 'Account already verified',
      })
    } else {
      const otp = String(Math.floor(100000 + Math.random() * 900000))
      user.verifyOtp = otp
      user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000 // 1 day for Expiry
      await user.save()
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Verification OTP',
        text: `Your verification OTP is: ${otp}`,
      }
      await transporter.sendMail(mailOptions)
      return res.json({
        success: true,
        message: 'Verification OTP sent successfully',
      })
    }
  } catch (error) {
    return res.json({
      success: false,
      message: 'Error sending verification OTP',
    })
  }
}

//! Otp Verification
export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body

  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Missing details',
    })
  }

  try {
    const user = await userModel.findById(userId)

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      })
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'User already verified',
        role: user.role,
      })
    }

    if (
      !user.verifyOtp ||
      String(user.verifyOtp).trim() !== String(otp).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      })
    }

    if (user.verifyOtpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      })
    }

    user.isVerified = true
    user.verifyOtp = ''
    user.verifyOtpExpiry = 0
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      role: user.role,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying account',
    })
  }
}

//! Check if User is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id)
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User is authenticated',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unauthorized',
    })
  }
}

//! Send password reset Otp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please enter email',
    })
  }
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      })
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    user.resetOtp = otp
    user.resetOtpExpiry = Date.now() + 15 * 60 * 1000 // 1 day for Expiry
    await user.save()
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is: ${otp}`,
    }
    await transporter.sendMail(mailOptions)
    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error sending otp',
    })
  }
}

//! Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all the fields',
    })
  }
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      })
    }
    if (user.resetOtp === '' || user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      })
    }
    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP Expired',
      })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.resetOtp = ''
    user.resetOtpExpiry = 0
    await user.save()
    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error resetting password',
    })
  }
}
