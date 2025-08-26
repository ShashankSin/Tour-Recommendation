import express from 'express'
import { initiatePaymentKhalti, verifyPaymentKhalti,initiatePaymentEsewa, verifyPaymentEsewa } from '../controller/Payment_gatewayController.js'

const router = express.Router()

// Route to initiate payment
router.post('/initiate', initiatePaymentKhalti)
router.post('/Esewa',initiatePaymentEsewa)

// Route to verify payment
router.post('/verify', verifyPaymentKhalti)
router.get('/verifyEsewa', verifyPaymentEsewa)
router.get('/failureEsewa', (req, res) => {
  res.send("Payment Failed")
})

export default router
