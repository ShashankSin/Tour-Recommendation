import Wishlist from '../model/wishlistModel.js'
import Trek from '../model/trekModel.js'

// Get user wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id
    console.log('🔐 Decoded user ID from token:', userId)

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID not found in token' })
    }

    // Try to find the user's wishlist
    let wishlist = await Wishlist.findOne({ userId })

    // If it doesn't exist, create an empty one
    if (!wishlist) {
      wishlist = new Wishlist({ userId, treks: [] })
      await wishlist.save()
      console.log('🆕 Created new empty wishlist for user:', userId)
    }

    // Populate treks and their associated company
    await wishlist.populate({
      path: 'treks',
      select:
        'title location duration price rating images difficulty companyId',
      populate: {
        path: 'companyId',
        model: 'Company',
        select: 'name',
      },
    })

    const trekIds = (wishlist.treks || []).map((trek) => trek._id)
    console.log('📦 Trek IDs in Wishlist:', trekIds)

    return res.status(200).json({
      success: true,
      wishlist,
      trekIds,
    })
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    })
  }
}

// Add trek to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { trekId } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not authenticated',
      })
    }

    const trek = await Trek.findById(trekId)
    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    let wishlist = await Wishlist.findOne({ userId })

    if (!wishlist) {
      wishlist = new Wishlist({ userId, treks: [trekId] })
    } else {
      if (wishlist.treks.includes(trekId)) {
        return res.status(400).json({
          success: false,
          message: 'Trek already in wishlist',
        })
      }
      wishlist.treks.push(trekId)
    }

    await wishlist.save()

    return res.status(200).json({
      success: true,
      message: 'Trek added to wishlist',
      wishlist,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Remove trek from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { trekId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not authenticated',
      })
    }

    const wishlist = await Wishlist.findOne({ userId })

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      })
    }

    if (!wishlist.treks.includes(trekId)) {
      return res.status(400).json({
        success: false,
        message: 'Trek not in wishlist',
      })
    }

    wishlist.treks = wishlist.treks.filter((id) => id.toString() !== trekId)
    await wishlist.save()

    return res.status(200).json({
      success: true,
      message: 'Trek removed from wishlist',
      wishlist,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Check if trek is in wishlist
export const checkWishlist = async (req, res) => {
  try {
    const { trekId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not authenticated',
      })
    }

    const wishlist = await Wishlist.findOne({ userId })

    const isInWishlist = wishlist?.treks.includes(trekId) || false

    return res.status(200).json({
      success: true,
      isInWishlist,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
