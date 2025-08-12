// seedTreks.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Trek from './model/trekModel.js'
import companyModel from './model/companyModel.js'

dotenv.config()

const seedTreks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')

    // First, get or create a company
    let company = await companyModel.findOne({ email: 'demo@company.com' })
    if (!company) {
      company = await companyModel.create({
        name: 'Demo Adventure Company',
        email: 'demo@company.com',
        password: 'hashedpassword',
        phone: '+977-1-1234567',
        address: 'Thamel, Kathmandu, Nepal',
        description: 'Leading adventure company in Nepal',
        logo: 'https://example.com/logo.png',
        rating: 4.5,
        isApproved: true,
      })
      console.log('Demo company created')
    }

    const trekData = [
      {
        title: 'Annapurna Circuit Trek',
        location: 'Annapurna Region, Nepal',
        description:
          'Explore diverse landscapes, traditional villages, and breathtaking mountain views on the Annapurna Circuit Trek. This classic trek takes you through lush valleys, high mountain passes, and ancient villages.',
        duration: 14,
        price: 1050,
        difficulty: 'moderate',
        category: 'trekking',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        ],
        rating: 4.7,
        ratingCount: 398,
        itinerary: [
          {
            day: 1,
            title: 'Arrival in Kathmandu',
            description:
              'Meet and greet at the airport. Transfer to hotel and briefing about the trek.',
          },
          {
            day: 2,
            title: 'Drive to Besisahar',
            description:
              'Scenic drive to the trailhead through beautiful countryside.',
          },
          {
            day: 3,
            title: 'Trek to Bahundanda',
            description:
              'Start trek through rural villages and terraced fields.',
          },
        ],
        inclusions: [
          'Guide and porter services',
          'Trekking permits',
          'Accommodation during trek',
          'Three meals a day',
          'Transportation to/from trailhead',
        ],
        companyId: company._id,
        route: [
          {
            latitude: 28.2416,
            longitude: 84.0192,
            title: 'Besisahar',
          },
          {
            latitude: 28.6499,
            longitude: 83.5695,
            title: 'Manang',
          },
          {
            latitude: 28.7692,
            longitude: 83.9466,
            title: 'Muktinath',
          },
        ],
        isApproved: true,
      },
      {
        title: 'Langtang Valley Trek',
        location: 'Langtang Region, Nepal',
        description:
          'A short trek that offers spectacular views, rich Tamang culture, and alpine scenery. Perfect for those with limited time who want to experience the Himalayas.',
        duration: 10,
        price: 800,
        difficulty: 'moderate',
        category: 'hiking',
        images: [
          'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=800&h=600&fit=crop',
        ],
        rating: 4.6,
        ratingCount: 276,
        itinerary: [
          {
            day: 1,
            title: 'Drive to Syabrubesi',
            description: 'Start the journey to Langtang with a scenic drive.',
          },
          {
            day: 2,
            title: 'Trek to Lama Hotel',
            description: 'Trek through beautiful forests and cross rivers.',
          },
          {
            day: 3,
            title: 'Trek to Langtang Village',
            description: 'Explore the rich Tamang heritage and culture.',
          },
        ],
        inclusions: [
          'Trekking guide',
          'Permits and fees',
          'Food and lodging',
          'Transportation to/from Kathmandu',
          'Basic first aid kit',
        ],
        companyId: company._id,
        route: [
          {
            latitude: 28.1658,
            longitude: 85.3045,
            title: 'Syabrubesi',
          },
          {
            latitude: 28.2045,
            longitude: 85.5373,
            title: 'Langtang Village',
          },
        ],
        isApproved: true,
      },
      {
        title: 'Mardi Himal Trek',
        location: 'Annapurna Region, Nepal',
        description:
          'A hidden gem offering majestic views of Machapuchare and Annapurna ranges with fewer crowds. This off-the-beaten-path trek is perfect for adventure seekers.',
        duration: 7,
        price: 700,
        difficulty: 'moderate',
        category: 'trekking',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        ],
        rating: 4.8,
        ratingCount: 193,
        itinerary: [
          {
            day: 1,
            title: 'Drive to Kande, Trek to Forest Camp',
            description:
              'Start the trek in lush forest with beautiful scenery.',
          },
          {
            day: 2,
            title: 'Trek to High Camp',
            description: 'Gain altitude with panoramic views of the mountains.',
          },
          {
            day: 3,
            title: 'Hike to Mardi Base Camp',
            description:
              'Experience breathtaking sunrise views from base camp.',
          },
        ],
        inclusions: [
          'Transportation to/from trailhead',
          'Guide services',
          'Food and accommodation',
          'Permits and fees',
          'Safety equipment',
        ],
        companyId: company._id,
        route: [
          {
            latitude: 28.3311,
            longitude: 83.8331,
            title: 'Kande',
          },
          {
            latitude: 28.4833,
            longitude: 83.9167,
            title: 'Mardi Base Camp',
          },
        ],
        isApproved: true,
      },
      {
        title: 'Upper Mustang Jeep Tour',
        location: 'Mustang, Nepal',
        description:
          'Discover the ancient kingdom of Mustang with a cultural jeep tour through the arid landscapes. Experience the unique culture and stunning scenery of the forbidden kingdom.',
        duration: 8,
        price: 1400,
        difficulty: 'easy',
        category: 'adventure travel',
        images: [
          'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=800&h=600&fit=crop',
        ],
        rating: 4.5,
        ratingCount: 110,
        itinerary: [
          {
            day: 1,
            title: 'Drive to Pokhara',
            description: 'Travel to the beautiful lake city of Pokhara.',
          },
          {
            day: 2,
            title: 'Fly to Jomsom, Drive to Kagbeni',
            description:
              'Start the Upper Mustang journey with a scenic flight.',
          },
          {
            day: 3,
            title: 'Drive to Lo Manthang',
            description: 'Explore the ancient walled city of Lo Manthang.',
          },
        ],
        inclusions: [
          'Domestic flights',
          'Jeep and driver',
          'Accommodation',
          'Guide and permits',
          'All meals',
        ],
        companyId: company._id,
        route: [
          {
            latitude: 28.7533,
            longitude: 83.7722,
            title: 'Jomsom',
          },
          {
            latitude: 29.1798,
            longitude: 83.9714,
            title: 'Lo Manthang',
          },
        ],
        isApproved: true,
      },
      {
        title: 'Rara Lake Trek',
        location: 'Mugu District, Nepal',
        description:
          'Trek through remote western Nepal to the pristine Rara Lake, the largest lake in Nepal. Experience untouched wilderness and stunning mountain scenery.',
        duration: 9,
        price: 950,
        difficulty: 'moderate',
        category: 'camping',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        ],
        rating: 4.9,
        ratingCount: 134,
        itinerary: [
          {
            day: 1,
            title: 'Fly to Nepalgunj',
            description: 'Gateway to western Nepal with cultural experiences.',
          },
          {
            day: 2,
            title: 'Fly to Jumla, Trek to Chere Chaur',
            description:
              'Start of the remote trek through beautiful landscapes.',
          },
          {
            day: 3,
            title: 'Trek to Rara Lake',
            description: 'Reach the beautiful and pristine Rara Lake.',
          },
        ],
        inclusions: [
          'Flights to/from remote areas',
          'Camping equipment',
          'Guide and porter',
          'All meals and permits',
          'Safety equipment',
        ],
        companyId: company._id,
        route: [
          {
            latitude: 29.5205,
            longitude: 82.1216,
            title: 'Jumla',
          },
          {
            latitude: 29.5261,
            longitude: 82.1138,
            title: 'Rara Lake',
          },
        ],
        isApproved: true,
      },
    ]

    // Clear existing treks for this company
    await Trek.deleteMany({ companyId: company._id })
    console.log('Cleared existing treks')

    // Insert new trek data
    const createdTreks = await Trek.insertMany(trekData)
    console.log(`Created ${createdTreks.length} treks successfully`)

    mongoose.disconnect()
    console.log('Database disconnected')
  } catch (error) {
    console.error('Error seeding treks:', error)
    mongoose.disconnect()
  }
}

seedTreks()
