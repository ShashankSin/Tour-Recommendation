import jwt from 'jsonwebtoken'
import Company from '../model/companyModel.js'

const companyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token format',
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded || !decoded.id || decoded.role !== 'company') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    // Check if company exists
    const company = await Company.findById(decoded.id)
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      })
    }

    // Add company info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: company.email,
    }

    next()
  } catch (error) {
    console.error('Auth Middleware Error:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    })
  }
}

export default companyAuth
