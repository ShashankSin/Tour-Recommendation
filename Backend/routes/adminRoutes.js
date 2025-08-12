import express from 'express'
import { loginAdmin } from '../controller/adminController.js'

const adminRouter = express.Router()

// No registration route, only login
adminRouter.post('/login', loginAdmin)

export default adminRouter
