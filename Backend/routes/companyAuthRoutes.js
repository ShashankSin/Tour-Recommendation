// routes/companyAuthRoutes.js
import express from 'express'
import {
  registerCompany,
  loginCompany,
  verifyCompanyAccount,
  resendCompanyOtp,
} from '../controller/companyAuthController.js'

const router = express.Router()

router.post('/register', registerCompany)
router.post('/login', loginCompany)
router.post('/verify-account', verifyCompanyAccount)
router.post('/resend-otp', resendCompanyOtp)

export default router
