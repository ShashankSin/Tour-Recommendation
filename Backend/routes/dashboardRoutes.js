import express from 'express'
import { getCompanyDashboard } from '../controller/dashboardController.js'
import companyAuth from '../middlewares/companyAuth.js'

const router = express.Router()

router.get('/company', companyAuth, getCompanyDashboard)

export default router
