import express from 'express'
import {
  createTrek,
  getAllTreks,
  getTrek,
  updateTrek,
  deleteTrek,
  getCompanyTreks,
  approveTrek,
  rejectTrek,
  getitinerary,
  useritineraryfetch,
  searchTreks,
} from '../controller/trekController.js'
import adminAuth from '../middlewares/adminAuth.js'
import companyAuth from '../middlewares/companyAuth.js'
import Trek from '../model/trekModel.js'
import mongoose from 'mongoose'

const trekRouter = express.Router()

// Public routes
trekRouter.get('/search', searchTreks)
trekRouter.get('/all', companyAuth, getAllTreks)
trekRouter.get('/allitinerary', getTrek)
trekRouter.get('/trending', async (req, res) => {
  try {
    const treks = await Trek.find({ isApproved: true })
      .sort({ ratingCount: -1, rating: -1 })
      .limit(5)
      .populate('companyId', 'name logo rating')

    return res.status(200).json({
      success: true,
      treks,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})
trekRouter.get('/popular', async (req, res) => {
  try {
    const treks = await Trek.find({ isApproved: true })
      .sort({ bookingCount: -1, rating: -1 })
      .limit(5)
      .populate('companyId', 'name logo rating')

    return res.status(200).json({
      success: true,
      treks,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})
trekRouter.get('/itinerary/:id', companyAuth, getitinerary)

// Company routes (requires company authentication)
trekRouter.post('/create', companyAuth, createTrek)
trekRouter.put('/update/:id', companyAuth, updateTrek)
trekRouter.delete('/delete/:id', companyAuth, deleteTrek)
trekRouter.get('/company/all', companyAuth, getCompanyTreks)

// Admin routes (requires admin authentication)
trekRouter.put('/approve/:id', adminAuth, approveTrek)
trekRouter.put('/reject/:id', adminAuth, rejectTrek)

trekRouter.get('/public/itinerary/:id', useritineraryfetch)
trekRouter.get('/public/trek/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trek ID',
      })
    }

    const trek = await Trek.findById(id).populate('companyId', 'name email')

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    return res.status(200).json({
      success: true,
      trek,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

export default trekRouter
