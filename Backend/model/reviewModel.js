import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trekId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trek',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

// Ensure a user can only review a trek once
reviewSchema.index({ userId: 1, trekId: 1 }, { unique: true })

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema)

export default Review
