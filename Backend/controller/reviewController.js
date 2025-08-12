import Review from '../model/reviewModel.js'
import Trek from '../model/trekModel.js'
import Booking from '../model/bookingModel.js'

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { trekId, rating, comment } = req.body

    // Get user ID from authenticated user
    const userId = req.body.userId

    // Check if required fields are provided
    if (!trekId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      })
    }

    // Check if trek exists
    const trek = await Trek.findById(trekId)
    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    // Check if user has booked and completed this trek
    const booking = await Booking.findOne({
      userId,
      trekId,
      status: 'completed',
    })

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'You can only review treks you have completed',
      })
    }

    // Check if user has already reviewed this trek
    const existingReview = await Review.findOne({ userId, trekId })
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this trek',
      })
    }

    // Create new review
    const review = new Review({
      userId,
      trekId,
      rating,
      comment,
    })

    await review.save()

    // Update trek rating
    const reviews = await Review.find({ trekId })
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    trek.rating = averageRating
    trek.ratingCount = reviews.length
    await trek.save()

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get trek reviews
export const getTrekReviews = async (req, res) => {
  try {
    const { trekId } = req.params

    const reviews = await Review.find({ trekId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      reviews,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body

    // Get user ID from authenticated user
    const userId = req.body.userId

    // Find review
    const review = await Review.findById(id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      })
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You don't own this review",
      })
    }

    // Update review fields
    if (rating) review.rating = rating
    if (comment) review.comment = comment

    await review.save()

    // Update trek rating
    const trekId = review.trekId
    const reviews = await Review.find({ trekId })
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    const trek = await Trek.findById(trekId)
    trek.rating = averageRating
    await trek.save()

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params

    // Get user ID from authenticated user
    const userId = req.body.userId

    // Find review
    const review = await Review.findById(id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      })
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You don't own this review",
      })
    }

    // Get trek ID before deleting review
    const trekId = review.trekId

    await Review.findByIdAndDelete(id)

    // Update trek rating
    const reviews = await Review.find({ trekId })

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      )
      const averageRating = totalRating / reviews.length

      const trek = await Trek.findById(trekId)
      trek.rating = averageRating
      trek.ratingCount = reviews.length
      await trek.save()
    } else {
      // No reviews left, reset rating
      const trek = await Trek.findById(trekId)
      trek.rating = 0
      trek.ratingCount = 0
      await trek.save()
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
