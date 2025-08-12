import express from 'express'
import TrekRecommendationEngine from '../cosine-recommendation-system-algorithm/recommendation-engine.js'
import userAuth from '../middlewares/userAuth.js'

const router = express.Router()

router.get('/', userAuth, async (req, res) => {
  try {
    const { userId, type = 'recommendations', limit = 5 } = req.query

    if (type === 'recommendations' && !userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required for recommendations',
      })
    }

    const engine = new TrekRecommendationEngine()

    let result = []
    try {
      switch (type) {
        case 'recommendations':
          result = await engine.getRecommendations(userId, parseInt(limit))
          break
        case 'trending':
          result = await engine.getTrendingTreks(parseInt(limit))
          break
        case 'popular-destinations':
          result = await engine.getPopularDestinations(parseInt(limit))
          break
        default:
          return res
            .status(400)
            .json({ success: false, message: 'Invalid type' })
      }
    } catch (engineError) {
      console.error('Recommendation engine error:', engineError)
      return res.status(500).json({
        success: false,
        message: 'Error generating recommendations',
        error: engineError.message,
      })
    }

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No recommendations found',
      })
    }

    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Recommendation route error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    })
  }
})

export default router
