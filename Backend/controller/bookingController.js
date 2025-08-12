import Booking from '../model/bookingModel.js'
import Trek from '../model/trekModel.js'
import User from '../model/userModel.js'
import Company from '../model/companyModel.js'
import transporter from '../config/nodemailer.js'
import jwt from 'jsonwebtoken'
// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      trekId,
      startDate,
      endDate,
      participants,
      totalPrice,
      paymentMethod,
      specialRequests,
      userId,
      companyId,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body

    // Validate required fields
    if (
      !trekId ||
      !startDate ||
      !endDate ||
      !participants ||
      !totalPrice ||
      !userId ||
      !companyId ||
      !customerName ||
      !customerEmail
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      })
    }

    //! Check trek existence
    const trek = await Trek.findById(trekId)
    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    //! Check trek approval
    if (!trek.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'This trek is not available for booking',
      })
    }
    //! Create booking
    const booking = new Booking({
      userId,
      trekId,
      companyId,
      startDate,
      endDate,
      participants,
      totalPrice,
      paymentMethod: paymentMethod || 'card',
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending',
      customerName,
      customerEmail,
      customerPhone,
    })
    await booking.save()
    // Fetch user and company data for emails
    const user = await User.findById(userId)
    const company = await Company.findById(companyId)
    const companyName = company?.name || 'the company'
    const companyEmail = company?.email || 'no-reply@example.com'
    //! User confirmation email
    const userMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: customerEmail,
      subject: 'Booking Confirmation - TrekGuide',
      text: `Hi ${customerName},

        Thank you for booking ${
          trek.title
        } with ${companyName}. Your booking is pending confirmation from the company.

        Booking Details:
        Start Date: ${new Date(startDate).toLocaleDateString()}
        End Date: ${new Date(endDate).toLocaleDateString()}
        Participants: ${participants}
        Total Price: $${totalPrice}

        You will receive another email once your booking is confirmed.

        Regards,
        TrekGuide Team`,
    }
    // Company notification email
    const companyMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: companyEmail,
      subject: 'New Booking Notification - TrekGuide',
      text: `Hello ${companyName},
        You have received a new booking for ${trek.title}.
        Booking Details:
        Customer: ${customerName}
        Email: ${customerEmail}
        Phone: ${customerPhone || 'Not provided'}
        Start Date: ${new Date(startDate).toLocaleDateString()}
        End Date: ${new Date(endDate).toLocaleDateString()}
        Participants: ${participants}
        Total Price: $${totalPrice}

        Please log in to your dashboard to confirm or cancel this booking.

        Regards,
        TrekGuide Team`,
    }
    await transporter.sendMail(userMailOptions)
    await transporter.sendMail(companyMailOptions)
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    })
  } catch (error) {
    console.error('Booking creation error:', error.message)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id

    const bookings = await Booking.find({ userId })
      .populate('trekId', 'title location duration images')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      bookings,
    })
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get company bookings
export const getCompanyBookings = async (req, res) => {
  try {
    const companyId = req.user?.id // Get from companyAuth middleware
    console.log('Company ID from auth:', companyId)

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated as company',
      })
    }

    const bookings = await Booking.find({ companyId })
      .populate('trekId', 'title location duration')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })

    console.log('Found bookings for company:', bookings.length)

    return res.status(200).json({
      success: true,
      bookings,
    })
  } catch (error) {
    console.error('Error fetching company bookings:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching bookings',
    })
  }
}

// Update booking status

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    console.log('🔄 Booking ID:', id)
    console.log('🟡 Requested Status:', status)

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status received:', status)
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    // Step 1: Verify JWT token from Authorization header
    const authHeader = req.headers.authorization
    console.log('🔑 Authorization Header:', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: No token' })
    }

    const token = authHeader.split(' ')[1]
    console.log('🔐 Token extracted:', token)

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log('✅ Token verified and decoded:', decoded)
    } catch (err) {
      console.log('❌ Token verification failed:', err.message)
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: Invalid token' })
    }

    const requesterId = decoded.id
    const requesterRole = decoded.role
    console.log('👤 Requester ID:', requesterId)
    console.log('📛 Requester Role:', requesterRole)

    // Step 2: Fetch the booking with populated refs from User model
    const booking = await Booking.findById(id)
      .populate('trekId')
      .populate('userId')

    if (!booking) {
      console.log('❌ Booking not found for ID:', id)
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' })
    }

    console.log('✅ Booking found:', booking)
    console.log('✅ Booking companyId:', booking.companyId)

    // Step 3: Authorization check
    const isCompany = requesterRole === 'company'
    const isUser = requesterRole === 'user'

    const isAuthorized =
      (isCompany && booking.companyId.toString() === requesterId) ||
      (isUser && booking.userId.toString() === requesterId)

    console.log('🔐 Authorization:', {
      isAuthorized,
      isCompany,
      isUser,
      requesterId,
    })

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message:
          'Unauthorized: You do not have permission to update this booking',
      })
    }

    // Users can only cancel their bookings
    if (isUser && status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Users can only cancel their bookings',
      })
    }

    // Step 4: Update booking status and save
    booking.status = status
    await booking.save()

    console.log('✅ Booking status updated to:', status)

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    })
  } catch (error) {
    console.error('❌ Server error:', error.message)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params
    const requesterId = req.user.id // Get from userAuth middleware

    const booking = await Booking.findById(id)
      .populate('trekId')
      .populate('userId', 'name email')
      .populate('companyId', 'name email')

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      })
    }

    // Check if user is authorized (user who made the booking)
    if (booking.userId._id.toString() !== requesterId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You don't have permission to view this booking",
      })
    }

    return res.status(200).json({
      success: true,
      booking,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
