import express from 'express'
import {
  createReview,
  getTrekReviews,
  updateReview,
  deleteReview,
} from '../controller/reviewController.js'
import userAuth from '../middlewares/userAuth.js'

const reviewRouter = express.Router()

// Public routes
reviewRouter.get('/trek/:trekId', getTrekReviews)

// Authenticated routes
reviewRouter.post('/create', userAuth, createReview)
reviewRouter.put('/update/:id', userAuth, updateReview)
reviewRouter.delete('/delete/:id', userAuth, deleteReview)

export default reviewRouter
