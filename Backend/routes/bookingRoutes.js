import express from 'express'
import {
  createBooking,
  getUserBookings,
  getCompanyBookings,
  updateBookingStatus,
  getBookingById,
} from '../controller/bookingController.js'
import userAuth from '../middlewares/userAuth.js'
import companyAuth from '../middlewares/companyAuth.js'

const bookingRouter = express.Router()

// User routes
bookingRouter.post('/create', userAuth, createBooking)
bookingRouter.get('/user/bookings', userAuth, getUserBookings)
bookingRouter.get('/user/:id', userAuth, getBookingById)

// Company routes
bookingRouter.get('/company', companyAuth, getCompanyBookings)
bookingRouter.put('/status/:id', companyAuth, updateBookingStatus)

// Error handling middleware
bookingRouter.use((err, req, res, next) => {
  console.error('Booking Route Error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error in booking route',
  })
})

export default bookingRouter
