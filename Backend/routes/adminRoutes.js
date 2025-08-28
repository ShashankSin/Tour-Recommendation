import express from 'express'
import { loginAdmin,getCompany,getUsers } from '../controller/adminController.js'

const adminRouter = express.Router()

// No registration route, only login
adminRouter.post('/login', loginAdmin)
adminRouter.get('/getCompany',getCompany)
adminRouter.get('/getUsers',getUsers)

export default adminRouter
