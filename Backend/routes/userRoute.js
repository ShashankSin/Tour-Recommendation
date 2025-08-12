import express from 'express'
import userAuth from '../middlewares/userAuth.js'
import { getUserdata } from '../controller/userController.js'

const userRouter = express.Router()

userRouter.get('/userData', userAuth, getUserdata)

export default userRouter
