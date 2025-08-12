import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Load environment variables
dotenv.config()

// Import routes
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoute.js'
import trekRouter from './routes/trekRoutes.js'
import bookingRouter from './routes/bookingRoutes.js'
import wishlistRouter from './routes/wishlistRoutes.js'
import reviewRouter from './routes/reviewRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import recommendationRoutes from './routes/recommendationRoutes.js'
import companyAuthRoutes from './routes/companyAuthRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

// Import database connection
import connectDB from './config/mongodb.js'

const app = express()

// Port
const port = process.env.PORT || 5000

// Connect MongoDB
connectDB()

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:19006',
      'exp://localhost:19000',
    ],
    credentials: true,
  })
)

// API Endpoints
app.get('/', (req, res) => {
  res.send('TrekGuide API is running!')
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/trek', trekRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/review', reviewRouter)
app.use('/api/admin', adminRouter)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/auth/company', companyAuthRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app
