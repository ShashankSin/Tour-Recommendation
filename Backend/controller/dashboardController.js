import Company from '../model/companyModel.js'
import Trek from '../model/trekModel.js'
import Booking from '../model/bookingModel.js'

export const getCompanyDashboard = async (req, res) => {
  try {
    const companyId = req.user.id

    // Fetch company profile
    const company = await Company.findById(companyId)
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      })
    }

    // Fetch company treks
    const treks = await Trek.find({ companyId })

    // Fetch company bookings
    const bookings = await Booking.find({ companyId })
      .populate('trekId', 'title location duration price images')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })

    // Calculate dashboard stats
    const stats = {
      totalTreks: treks.length,
      totalBookings: bookings.length,
      totalRevenue: bookings
        .filter((booking) => booking.paymentStatus === 'paid')
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
      pendingBookings: bookings.filter(
        (booking) => booking.status === 'pending'
      ).length,
      completedBookings: bookings.filter(
        (booking) => booking.status === 'completed'
      ).length,
      cancelledBookings: bookings.filter(
        (booking) => booking.status === 'cancelled'
      ).length,
    }

    // Get recent bookings (last 5)
    const recentBookings = bookings
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)

    // Get popular treks (top 5 by booking count)
    const popularTreks = treks
      .map((trek) => ({
        ...trek.toObject(),
        bookingsCount: bookings.filter(
          (b) => b.trekId?._id.toString() === trek._id.toString()
        ).length,
      }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5)

    // Calculate monthly revenue for the last 6 months
    const today = new Date()
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)
    const monthlyRevenue = []

    for (let d = sixMonthsAgo; d <= today; d.setMonth(d.getMonth() + 1)) {
      const month = d.getMonth()
      const year = d.getFullYear()
      const monthRevenue = bookings
        .filter((booking) => {
          const bookingDate = new Date(booking.createdAt)
          return (
            bookingDate.getMonth() === month &&
            bookingDate.getFullYear() === year &&
            booking.paymentStatus === 'paid'
          )
        })
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

      monthlyRevenue.push({
        month: d.toLocaleString('default', { month: 'short' }),
        revenue: monthRevenue,
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        company,
        stats,
        recentBookings,
        popularTreks,
        monthlyRevenue,
      },
    })
  } catch (error) {
    console.error('Dashboard Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    })
  }
}
