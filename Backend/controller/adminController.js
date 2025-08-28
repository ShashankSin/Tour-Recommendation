import Admin from '../model/Admin.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Company from '../model/companyModel.js'
import User from '../model/userModel.js'

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
        message: 'Invalid Email',
      })
    }

    // Verify password
    if (password !== admin.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
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

export const getCompany = async (req, res)=>{
  try{
    const company= await Company.find()

    if (!company || company.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No companies found',
      })
    }
    res.status(200).json({
      success:true,
      message:'Company fetched successfully',
      data:company
    })
  }catch(error){
    console.error('Get Company Error:', error)
    res.status(500).json({
      success: false,
      message: 'Fetching company failed',
      error: error.message,
    })
  }
}

export const getUsers = async (req, res) => {

  try{
    const users= await User.find()

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found',
      })
    }
    res.status(200).json({
      success:true,
      message:'Users fetched successfully',
      data:users
    })
  }catch(error){
    console.error('Get Users Error:', error)
    res.status(500).json({
      success: false,
      message: 'Fetching users failed',
      error: error.message,
    })
  }

}