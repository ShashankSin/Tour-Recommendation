import jwt from 'jsonwebtoken'
import userModel from '../model/userModel.js'
import bookingModel from '../model/bookingModel.js'
import axios from 'axios'
import crypto from 'crypto'
import transporter from '../config/nodemailer.js'
import dotenv from 'dotenv'
dotenv.config()

/**
 * Initiate Khalti Payment
 */
export const initiatePaymentKhalti = async (req, res) => {
  try {
    const { userId, amount, bookingId } = req.body
    // Validate input
    if (!userId || !amount || !bookingId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Find user
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // ✅ Create a pending booking payment record (optional)
    const booking = await bookingModel.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    // Generate JWT token for payment
    const token = jwt.sign({ userId, bookingId }, process.env.JWT_SECRET, { expiresIn: '1h' })

    // Call Khalti API
    const khaltiResponse = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      {
        return_url: 'http://10.0.2.2:5000/api/payment/verify',
        website_url: 'http://10.0.2.2:5000/',
        amount: amount * 100,
        purchase_order_id: bookingId,
        purchase_order_name: 'Trek Booking Payment',
        customer_info: {
          name: user.name || 'John Doe',
          email: user.email || 'test@gmail.com',
          phone: user.phone || '9800000001',
        },
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      payment: khaltiResponse.data,
      token,
    })
  } catch (error) {
    console.error('Error initiating payment:', error.response?.data || error.message)
    res.status(500).json({ success: false, message: 'Payment initiation failed' })
  }
}

export const verifyPaymentKhalti = async (req, res) => {
  try {
    const { pidx, bookingId } = req.body;
    if (!pidx) {
      return res.status(400).json({ success: false, message: 'Missing pidx' })
    }

    const verifyResponse = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    const paymentData = verifyResponse.data
    const booking = await bookingModel.findOne({ _id: bookingId })

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }
    if (paymentData.status === 'Completed') {
      booking.paymentStatus = 'paid'
      booking.paymentMethod = 'khalti'
      await booking.save()
      const mailOptions={
        from:process.env.SENDER_EMAIL,
        to:booking.customerEmail,
        subject:'Payment Successful',
        text:`Your payment for booking ${bookingId} was successful. Thank you for booking with us!`
      }
      await transporter.sendMail(mailOptions)
      return res.status(200).json({
        success: true,
        message: 'Payment verified and booking updated successfully',
        booking,
        paymentData,
      })                                   
    } else {
      booking.paymentStatus = 'failed'
      await booking.save()
      
      return res.status(400).json({                                     
        success: false,
        message: 'Payment not successful',
        paymentData,
      })
    }
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message)
    res.status(500).json({ success: false, message: 'Payment verification failed' })
  }
}

/**
 * Initiate Esewa Payment
 */
export const initiatePaymentEsewa = async (req, res) => {
  try {
    const { userId, amount, bookingId,paymentMethod } = req.body

    await bookingModel.findByIdAndUpdate(bookingId, { paymentMethod: paymentMethod });


    const booking= await bookingModel.findById(bookingId)
    
    const signature=createSignature(`total_amount=${booking.totalPrice},transaction_uuid=${booking._id},product_code=EPAYTEST`)

    const esewaUrl='https://rc-epay.esewa.com.np/api/epay/main/v2/form'
    const formData=new URLSearchParams({
      amount: booking.totalPrice,
      failure_url: 'http://localhost:5000/api/esewa/failureEsewa',
      product_service_charge: '0',
      product_delivery_charge: '0',
      product_code: 'EPAYTEST',
      signature:signature,
      signed_field_name:'total_amount,transaction_uuid,product_code',
      success_url: 'http://localhost:5000/api/payment/verifyEsewa',
      tax_amount: '0',
      total_amount: booking.totalPrice,
      transaction_uuid: booking._id.toString()
    });

    res.status(200).json({
      success: true,
      esewaUrl,
      paymentData: Object.fromEntries(formData)
    })

  } catch (error) {
    console.error('Error initiating eSewa payment:', error.response?.data || error.message)
    res.status(500).json({ success: false, message: 'Payment initiation failed' })
  }
}
// create HMAC SHA256 signature for eSewa
export const createSignature = (message) => {
  const secret = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q"
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(message)
  return hmac.digest('base64')
}

export const verifyPaymentEsewa = async (req, res) => {
  try {
    const { transaction_uuid, amount, product_code, reference_id, status } = req.query


    if (status !== 'Success') {
      return res.status(400).json({ success: false, message: 'Payment not successful' })
    }

    const booking = await bookingModel.findById(transaction_uuid)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.totalPrice.toString() !== amount) {
      return res.status(400).json({ success: false, message: 'Amount mismatch' })
    }

    const {data}=req.body
    const decodedData=JSON.parse(Buffer.from(data,'base64').toString('utf-8'))


    if (decodedData.status !== 'Success') {
      return res.status(400).json({ success: false, message: 'Payment not successful' })
    }

    const message=decodedData.signed_field_names.split(',').map(field=>`${field}=${decodedData[field]}`).join(',')


    const signature=createSignature(message)
    if (signature !== decodedData.signature) {
      return res.status(400).json({ success: false, message: 'Signature mismatch' })
    }

    req.transaction_uuid=decodedData.transaction_uuid
    req.transaction_code=decodedData.transaction_code
    // update booking payment status
    booking.paymentStatus = 'success'
    booking.paymentMethod = 'esewa'
    await booking.save()

    res.status(200).json({
      success: true,
      message: 'eSewa Payment verified and booking updated successfully',
      booking,
      reference_id,
    })
  } catch (error) {
    console.error('Error verifying eSewa payment:', error.message)
    res.status(500).json({ success: false, message: 'Payment verification failed' })
  }
}