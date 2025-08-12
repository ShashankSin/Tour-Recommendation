import userModel from '../model/userModel.js'
import jwt from 'jsonwebtoken'

export const getUserdata = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1] // extract the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // verify token
    console.log('Decoded:', decoded)

    const userId = decoded.id
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'No user ID found in token' })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({
      success: true,
      usersData: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
