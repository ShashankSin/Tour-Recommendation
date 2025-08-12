import jwt from 'jsonwebtoken'

import devenv from 'dotenv'
devenv.config()

const userAuth = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please login to access this resource',
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.id) {
      req.user = decoded
    } else {
      return res.status(401).json({
        success: false,
        message: 'otp',
      })
    }
    next()
  } catch (error) {
    console.error('JWT Error:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

export default userAuth
