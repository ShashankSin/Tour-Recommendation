import jwt from 'jsonwebtoken'

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: Admins only' })
    }

    req.user = decoded // pass user to next handler
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export default adminAuth
