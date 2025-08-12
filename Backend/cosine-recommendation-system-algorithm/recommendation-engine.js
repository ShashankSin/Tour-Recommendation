import Trek from '../model/trekModel.js'
import Review from '../model/reviewModel.js'
import Wishlist from '../model/wishlistModel.js'
import Booking from '../model/bookingModel.js'

class TrekRecommendationEngine {
  constructor() {
    this.difficultyWeights = { easy: 1, moderate: 2, difficult: 3, extreme: 4 }
    this.categoryWeights = {
      hiking: 1,
      trekking: 2,
      'mountain climbing': 3,
      camping: 1,
      'international travel': 2,
      'adventure travel': 2,
      'wildlife safari': 2,
    }
  }

  //! Create feature vector for a trek
  createTrekVector(trek) {
    if (!trek) {
      console.error('Invalid trek object provided to createTrekVector')
      return [0, 0, 0, 0, 0, 0]
    }

    return [
      this.difficultyWeights[trek.difficulty?.toLowerCase()] || 0,
      this.categoryWeights[trek.category?.toLowerCase()] || 0,
      Math.log(trek.duration + 1),
      Math.log(trek.price + 1),
      trek.rating || 0,
      Math.log(trek.ratingCount + 1),
    ]
  }

  //! Create user preference vector based on their interactions
  async createUserVector(userId) {
    if (!userId) {
      console.error('Invalid userId provided to createUserVector')
      return await this.getAverageVector()
    }

    try {
      const [userReviews, userWishlist, userBookings] = await Promise.all([
        Review.find({ userId }).populate('trekId'),
        Wishlist.findOne({ userId }).populate('treks'),
        Booking.find({ userId }).populate('trekId'),
      ])

      if (
        !userReviews?.length &&
        !userWishlist?.treks?.length &&
        !userBookings?.length
      ) {
        return await this.getAverageVector()
      }

      const weightedVector = [0, 0, 0, 0, 0, 0]
      let totalWeight = 0

      //! Weight based on reviews (highest weight)
      userReviews?.forEach((review) => {
        if (review?.trekId) {
          const trekVector = this.createTrekVector(review.trekId)
          const weight = review.rating || 3 // Default to 3 if no rating
          for (let i = 0; i < trekVector.length; i++) {
            weightedVector[i] += trekVector[i] * weight
          }
          totalWeight += weight
        }
      })

      //! Weight based on bookings (medium weight)
      userBookings?.forEach((booking) => {
        if (booking?.trekId) {
          const trekVector = this.createTrekVector(booking.trekId)
          const weight = booking.status === 'completed' ? 4 : 3
          for (let i = 0; i < trekVector.length; i++) {
            weightedVector[i] += trekVector[i] * weight
          }
          totalWeight += weight
        }
      })

      //! Weight based on wishlist (lower weight)
      userWishlist?.treks?.forEach((trek) => {
        if (trek) {
          const trekVector = this.createTrekVector(trek)
          const weight = 2
          for (let i = 0; i < trekVector.length; i++) {
            weightedVector[i] += trekVector[i] * weight
          }
          totalWeight += weight
        }
      })

      //! Normalize the vector
      if (totalWeight > 0) {
        for (let i = 0; i < weightedVector.length; i++) {
          weightedVector[i] /= totalWeight
        }
      }

      return weightedVector
    } catch (error) {
      console.error('Error creating user vector:', error)
      return await this.getAverageVector()
    }
  }

  //! Get average vector for new users
  async getAverageVector() {
    try {
      const treks = await Trek.find({ isApproved: true })
      if (!treks?.length) {
        return [2, 2, 2, 7, 4, 3]
      }

      const vectors = treks.map((trek) => this.createTrekVector(trek))
      const avgVector = [0, 0, 0, 0, 0, 0]

      vectors.forEach((vector) => {
        for (let i = 0; i < vector.length; i++) {
          avgVector[i] += vector[i]
        }
      })

      for (let i = 0; i < avgVector.length; i++) {
        avgVector[i] /= vectors.length
      }

      return avgVector
    } catch (error) {
      console.error('Error getting average vector:', error)
      return [2, 2, 2, 7, 4, 3] // Default fallback vector
    }
  }

  //! Calculate cosine similarity between two vectors
  cosineSimilarity(vectorA, vectorB) {
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
      console.error('Invalid vectors provided to cosineSimilarity')
      return 0
    }

    if (vectorA.length !== vectorB.length) {
      console.error('Vectors must have the same length')
      return 0
    }

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += (vectorA[i] || 0) * (vectorB[i] || 0)
      magnitudeA += (vectorA[i] || 0) * (vectorA[i] || 0)
      magnitudeB += (vectorB[i] || 0) * (vectorB[i] || 0)
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0
    }

    return dotProduct / (magnitudeA * magnitudeB)
  }

  //! Get recommendations for a user
  async getRecommendations(userId, limit = 5) {
    if (!userId) {
      throw new Error('User ID is required for recommendations')
    }

    try {
      const userVector = await this.createUserVector(userId)

      //! Get treks user has already interacted with
      const [userReviews, userWishlist, userBookings] = await Promise.all([
        Review.find({ userId }).select('trekId'),
        Wishlist.findOne({ userId }).select('treks'),
        Booking.find({ userId }).select('trekId'),
      ])

      const userInteractedTreks = new Set()
      userReviews?.forEach(
        (r) => r?.trekId && userInteractedTreks.add(r.trekId.toString())
      )
      userBookings?.forEach(
        (b) => b?.trekId && userInteractedTreks.add(b.trekId.toString())
      )
      if (userWishlist?.treks) {
        userWishlist.treks.forEach(
          (trekId) => trekId && userInteractedTreks.add(trekId.toString())
        )
      }

      //! Get all approved treks not interacted with
      const availableTreks = await Trek.find({
        isApproved: true,
        _id: { $nin: Array.from(userInteractedTreks) },
      })

      if (!availableTreks?.length) {
        return []
      }

      //! Calculate similarity for all available treks
      const recommendations = availableTreks
        .map((trek) => {
          if (!trek) return null
          const trekVector = this.createTrekVector(trek)
          const similarity = this.cosineSimilarity(userVector, trekVector)

          return {
            trek,
            similarity,
            score:
              similarity *
              (trek.rating || 3) *
              Math.log((trek.ratingCount || 0) + 1),
          }
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      return recommendations.map((rec) => ({
        ...rec.trek.toObject(),
        similarity: rec.similarity,
        score: rec.score,
      }))
    } catch (error) {
      console.error('Error getting recommendations:', error)
      throw error
    }
  }

  //! Get trending treks
  async getTrendingTreks(limit = 5) {
    try {
      const treks = await Trek.find({ isApproved: true })
        .sort({ ratingCount: -1, rating: -1 })
        .limit(limit)

      return treks || []
    } catch (error) {
      console.error('Error getting trending treks:', error)
      throw error
    }
  }

  //! Get popular destinations
  async getPopularDestinations(limit = 5) {
    try {
      const treks = await Trek.find({ isApproved: true })
        .sort({ bookingCount: -1, rating: -1 })
        .limit(limit)

      return treks || []
    } catch (error) {
      console.error('Error getting popular destinations:', error)
      throw error
    }
  }
}

export default TrekRecommendationEngine
