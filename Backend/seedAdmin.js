// seedAdmin.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import Admin from './model/Admin.js'

dotenv.config()

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')

    const hashedPassword = await bcrypt.hash('admin123', 10)

    const existing = await Admin.findOne({ email: 'admin@test.com' })
    if (existing) {
      console.log('Admin already exists')
    } else {
      await Admin.create({
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Super Admin',
      })
      console.log('Admin created successfully')
    }

    mongoose.disconnect()
  } catch (error) {
    console.error('Error seeding admin:', error)
  }
}

seedAdmin()
