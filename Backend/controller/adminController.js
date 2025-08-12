import Admin from '../model/Admin.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Find admin
    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Create token with 24 hour expiration
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
      },
    })
  } catch (error) {
    console.error('Admin Login Error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    })
  }
}
