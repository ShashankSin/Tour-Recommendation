// controllers/companyAuthController.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Company from '../model/companyModel.js'
import transporter from '../config/nodemailer.js'
import dotenv from 'dotenv'
dotenv.config()

export const registerCompany = async (req, res) => {
  const { name, email, password, phone, website } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all required fields',
    })
  }

  try {
    const existingCompany = await Company.findOne({ email })
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company already exists with this email',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const company = new Company({
      name,
      email,
      password: hashedPassword,
      phone,
      website,
    })

    await company.save()

    const token = jwt.sign(
      { id: company._id, role: 'company' },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    )

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    company.verifyOtp = otp
    company.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000
    await company.save()

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Company Verification OTP',
      text: `Your verification OTP is: ${otp}`,
    }

    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      success: true,
      message: 'Company registered successfully',
      token,
      companyId: company._id,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find company
    const company = await Company.findOne({ email })
    if (!company) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, company.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Create token with 24 hour expiration
    const token = jwt.sign(
      {
        id: company._id,
        email: company.email,
        role: 'company',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
      },
    })
  } catch (error) {
    console.error('Company Login Error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    })
  }
}

export const verifyCompanyAccount = async (req, res) => {
  const { userId, otp } = req.body

  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Missing details',
    })
  }

  try {
    const company = await Company.findById(userId)
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company not found',
      })
    }

    if (company.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Company already verified',
        role: 'company',
      })
    }

    if (company.verifyOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      })
    }

    if (company.verifyOtpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      })
    }

    company.isVerified = true
    company.verifyOtp = ''
    company.verifyOtpExpiry = 0
    await company.save()

    return res.status(200).json({
      success: true,
      message: 'Company verified successfully',
      role: 'company',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const resendCompanyOtp = async (req, res) => {
  const { userId, email } = req.body

  try {
    const company = await Company.findOne({
      $or: [{ _id: userId }, { email }],
    })

    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company not found',
      })
    }

    if (company.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Company already verified',
      })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    company.verifyOtp = otp
    company.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000
    await company.save()

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: company.email,
      subject: 'Company Verification OTP',
      text: `Your verification OTP is: ${otp}`,
    }

    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      success: true,
      message: 'New OTP sent successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
