import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    treks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trek',
      },
    ],
  },
  { timestamps: true }
)

const Wishlist =
  mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema)

export default Wishlist
