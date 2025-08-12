import express from 'express'
import {
  registerUser,
  loginUser,
  logoutUser,
  sendVerificationOtp,
  verifyOtp,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from '../controller/authController.js'
import userAuth from '../middlewares/userAuth.js'

const authRouter = express.Router()

authRouter.post('/registerUser', registerUser)
authRouter.post('/loginUser', loginUser)
authRouter.post('/logoutUser', logoutUser)
authRouter.post('/send-verification-otp', userAuth, sendVerificationOtp)
authRouter.post('/verify-account', verifyOtp)
authRouter.get('/isAuth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendResetOtp)
authRouter.post('/reset-password', resetPassword)

export default authRouter
