import Trek from '../model/trekModel.js'
import companyModel from '../model/companyModel.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
export const createTrek = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]
  try {
    const {
      title,
      location,
      description,
      duration,
      price,
      difficulty,
      category,
      images = [],
      itinerary = [],
      inclusions = [],
      route = [],
    } = req.body
    if (
      !title ||
      !location ||
      !description ||
      !duration ||
      !price ||
      !difficulty ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const companyId = decoded.id
    const company = await companyModel.findById(companyId)
    if (!company) {
      return res.status(403).json({
        success: false,
        message: 'Company not found',
      })
    }
    const normalizedDifficulty = difficulty.toLowerCase()
    const normalizedCategory = category.toLowerCase()
    const trek = new Trek({
      title,
      location,
      description,
      duration,
      price,
      difficulty: normalizedDifficulty,
      category: normalizedCategory,
      images,
      itinerary,
      inclusions,
      route,
      companyId,
      isApproved: false,
    })
    await trek.save()
    return res.status(201).json({
      success: true,
      message: 'Trek created successfully',
      trek,
    })
  } catch (error) {
    console.error('Create Trek Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all treks (with optional filters)
export const getAllTreks = async (req, res) => {
  try {
    const {
      search,
      category,
      difficulty,
      minPrice,
      maxPrice,
      location,
      sort = 'createdAt',
      order = 'desc',
      limit = 10,
      page = 1,
    } = req.query

    const filter = {}

    // Filter treks by companyId
    if (req.companyId) {
      filter.companyId = req.companyId
    }

    if (search) {
      filter.$text = { $search: search }
    }

    if (category && category !== 'all') {
      filter.category = category.toLowerCase()
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty.toLowerCase()
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const sortObj = {}
    sortObj[sort] = order === 'asc' ? 1 : -1

    const treks = await Trek.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate('companyId', 'name logo rating')
      .lean()

    const total = await Trek.countDocuments(filter)

    return res.status(200).json({
      success: true,
      treks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Get All Treks Error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    })
  }
}

// Get trek by ID
export const getTrek = async (req, res) => {
  try {
    // Only return approved treks for public access
    const treks = await Trek.find({ isApproved: true })
      .populate('companyId', 'name email logo')
      .sort({ createdAt: -1 })

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
}

// Update trek
export const updateTrek = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trek ID',
      })
    }

    const updatedData = { ...req.body }

    // Normalize category and difficulty if provided
    if (updatedData.category) {
      updatedData.category = updatedData.category.toLowerCase()
    }
    if (updatedData.difficulty) {
      updatedData.difficulty = updatedData.difficulty.toLowerCase()
    }

    const updatedTrek = await Trek.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    })

    if (!updatedTrek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Trek updated successfully',
      trek: updatedTrek,
    })
  } catch (error) {
    console.error('❌ Error updating trek:', error.stack)
    return res.status(500).json({
      success: false,
      message: 'Server error while updating trek',
      error: error.message,
    })
  }
}

// Delete trek
export const deleteTrek = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    console.log('Trek ID to delete:', id) // 🔍 Log the trek ID
    console.log('Requesting user ID:', userId) // 🔍 Log user ID for validation

    const trek = await Trek.findById(id)

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    if (trek.companyId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You don't own this trek",
      })
    }

    console.log('Deleting Trek:', trek) // 🔍 Optional full log

    await Trek.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: 'Trek deleted successfully',
    })
  } catch (error) {
    console.error('Delete error:', error.message)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get company treks
export const getCompanyTreks = async (req, res) => {
  try {
    // Get company ID from authenticated user
    const companyId = req.body.companyId

    const treks = await Trek.find({ companyId })

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
}

// Approve trek
export const approveTrek = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trek ID',
      })
    }

    // Check if trek exists and update only the isApproved field
    const trek = await Trek.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true, runValidators: false }
    )

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Trek approved successfully',
      trek,
    })
  } catch (error) {
    console.error('Approve Trek Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to approve trek',
      error: error.message,
    })
  }
}

// Reject trek
export const rejectTrek = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trek ID',
      })
    }

    // Check if trek exists and update only the isApproved field
    const trek = await Trek.findByIdAndUpdate(
      id,
      { isApproved: false },
      { new: true, runValidators: false }
    )

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: 'Trek not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Trek set to pending successfully',
      trek,
    })
  } catch (error) {
    console.error('Reject Trek Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update trek status',
      error: error.message,
    })
  }
}

export const getitinerary = async (req, res) => {
  try {
    const { id } = req.params
    console.log('Requested Trek ID:', id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trek ID format',
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
      trek, // Includes itinerary, inclusions, route, etc.
    })
  } catch (error) {
    console.error('Error fetching trek by ID:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    })
  }
}

export const useritineraryfetch = async (req, res) => {
  try {
    const { id } = req.params
    console.log('Public itinerary fetch requested for ID:', id)

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid itinerary ID' })
    }

    // Fetch the itinerary document WITHOUT populate because companyId is missing in DB
    const itinerary = await Trek.findById(id).lean()

    if (!itinerary) {
      return res
        .status(404)
        .json({ success: false, message: 'Itinerary not found' })
    }

    if (!itinerary.isApproved) {
      return res
        .status(404)
        .json({ success: false, message: 'Itinerary not available' })
    }

    // Use companyId if it exists, else fallback to userId
    let companyId = itinerary.companyId || null

    if (!companyId && itinerary.userId) {
      companyId = itinerary.userId
    }

    console.log('Resolved companyId:', companyId)

    // Return itinerary with companyId field explicitly set
    return res.status(200).json({
      ...itinerary,
      companyId,
    })
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const searchTreks = async (req, res) => {
  try {
    const { query, filters } = req.query
    const searchQuery = {}

    // Basic text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ]
    }

    // Apply filters if provided
    if (filters) {
      const { difficulty, duration, priceMin, priceMax, category } =
        JSON.parse(filters)

      if (difficulty) {
        searchQuery.difficulty = difficulty
      }

      if (duration) {
        searchQuery.duration = { $lte: parseInt(duration) }
      }

      if (priceMin || priceMax) {
        searchQuery.price = {}
        if (priceMin) searchQuery.price.$gte = parseInt(priceMin)
        if (priceMax) searchQuery.price.$lte = parseInt(priceMax)
      }

      if (category) {
        searchQuery.category = category
      }
    }

    // Only show approved treks
    searchQuery.isApproved = true

    const treks = await Trek.find(searchQuery)
      .sort({ rating: -1, ratingCount: -1 })
      .limit(20)

    res.json({
      success: true,
      data: treks,
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      message: 'Error searching treks',
      error: error.message,
    })
  }
}
