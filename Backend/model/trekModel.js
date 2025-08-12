import mongoose from 'mongoose'

const trekSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult', 'extreme'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'hiking',
        'trekking',
        'mountain climbing',
        'camping',
        'international travel',
        'adventure travel',
        'wildlife safari',
      ],
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
      },
    ],
    inclusions: [
      {
        type: String,
      },
    ],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    route: [
      {
        latitude: Number,
        longitude: Number,
        title: String,
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Add text index for search functionality
trekSchema.index({ title: 'text', location: 'text', description: 'text' })

const Trek = mongoose.models.Trek || mongoose.model('Trek', trekSchema)

export default Trek
