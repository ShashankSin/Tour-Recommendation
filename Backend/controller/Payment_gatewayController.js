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
 * Create HMAC SHA256 signature for eSewa
 */
const createSignature = (message) => {
  const secret = process.env.ESEWA_SECRET; // set in .env
  if (!secret) throw new Error("Esewa Secret Key is missing in environment");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);
  return hmac.digest("base64");
};

/**
 * Initiate eSewa Payment
 */
export const initiatePaymentEsewa = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    // update booking with payment method
    await bookingModel.findByIdAndUpdate(bookingId, { paymentMethod });

    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Environment toggle
    const isSandbox = process.env.ESEWA_ENV === "sandbox";
    const esewaUrl = isSandbox
      ? "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
      : "https://epay.esewa.com.np/api/epay/main/v2/form";

    const productCode = isSandbox ? "EPAYTEST" : process.env.ESEWA_PRODUCT_CODE;

    // build signature message
    const message = `total_amount=${booking.totalPrice},transaction_uuid=${booking._id},product_code=${productCode}`;
    const signature = createSignature(message);

    // build form data
    const formData = new URLSearchParams({
      amount: booking.totalPrice.toString(),
      tax_amount: "0",
      total_amount: booking.totalPrice.toString(),
      product_service_charge: "0",
      product_delivery_charge: "0",
      product_code: productCode,
      transaction_uuid: booking._id.toString(),
      success_url: `${process.env.BASE_URL}/api/payment/verifyEsewa`,
      failure_url: `${process.env.BASE_URL}/api/esewa/failureEsewa`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    });

    res.status(200).json({
      success: true,
      esewaUrl,
      paymentData: Object.fromEntries(formData),
    });
  } catch (error) {
    console.error("Error initiating eSewa payment:", error.message);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};

/**
 * Verify eSewa Payment
 */
export const verifyPaymentEsewa = async (req, res) => {
  try {
    const { bookingId, paymentData } = req.body;

    if (!bookingId || !paymentData) {
      return res.status(400).json({ success: false, message: "Missing payment data" });
    }

    const booking = await bookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const { signature, signed_field_names } = paymentData;

    const message = signed_field_names
      .split(",")
      .map((field) => `${field}=${paymentData[field]}`) // use paymentData directly
      .join(",");

    // Compute HMAC SHA256 using your Esewa secret key
    const secret = process.env.ESEWA_SECRET;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(message);
    const computedSignature = hmac.digest("base64");

    if (computedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    if (paymentData.status !== "COMPLETE") {
      return res.status(400).json({ success: false, message: "Payment not successful" });
    }

    // Update booking
    booking.paymentStatus = "paid";
    booking.paymentMethod = "esewa";
    await booking.save();
    const mailOptions={
        from:process.env.SENDER_EMAIL,
        to:booking.customerEmail,
        subject:'Payment Successful',
        text:`Your payment for booking ${bookingId} was successful. Thank you for booking with us!`
      }
      await transporter.sendMail(mailOptions)

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Error verifying eSewa payment:", error.message);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

