import express from 'express'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from '../controller/wishlistController.js'
import userAuth from '../middlewares/userAuth.js'

const wishlistRouter = express.Router()

// All routes require authentication
wishlistRouter.get('/get', userAuth, getWishlist)

wishlistRouter.post('/add', userAuth, addToWishlist)
wishlistRouter.delete('/remove/:trekId', userAuth, removeFromWishlist)
wishlistRouter.get('/check/:trekId', userAuth, checkWishlist)

export default wishlistRouter
