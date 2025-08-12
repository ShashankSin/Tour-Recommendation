import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('all')

  //! Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      setError(null)
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      console.log('Fetching user bookings...')
      const response = await axios.get(
        'http://10.0.2.2:5000/api/booking/user/bookings',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('Bookings response:', response.data)

      if (response.data.success) {
        setBookings(response.data.bookings || [])
      } else {
        setError('Failed to load bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('Failed to load bookings. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchBookings()
  }

  const filteredBookings = bookings.filter((booking) => {
    if (selectedStatus === 'all') return true
    return booking.status === selectedStatus
  })

  const getStatusCounts = () => {
    const counts = {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates not available'

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid dates'
    }

    const options = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', options)
    const year = end.getFullYear()
    return `${startStr} - ${endStr}, ${year}`
  }

  const getStatusBadge = (status) => {
    let backgroundColor, textColor, icon

    switch (status) {
      case 'confirmed':
        backgroundColor = 'bg-green-100'
        textColor = 'text-green-800'
        icon = 'checkmark-circle'
        break
      case 'pending':
        backgroundColor = 'bg-yellow-100'
        textColor = 'text-yellow-800'
        icon = 'time'
        break
      case 'cancelled':
        backgroundColor = 'bg-red-100'
        textColor = 'text-red-800'
        icon = 'close-circle'
        break
      case 'completed':
        backgroundColor = 'bg-blue-100'
        textColor = 'text-blue-800'
        icon = 'trophy'
        break
      default:
        backgroundColor = 'bg-gray-100'
        textColor = 'text-gray-600'
        icon = 'help-circle'
    }

    return { backgroundColor, textColor, icon }
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    let backgroundColor, textColor, icon

    switch (paymentStatus) {
      case 'paid':
        backgroundColor = 'bg-green-100'
        textColor = 'text-green-800'
        icon = 'card'
        break
      case 'pending':
        backgroundColor = 'bg-yellow-100'
        textColor = 'text-yellow-800'
        icon = 'time'
        break
      case 'refunded':
        backgroundColor = 'bg-blue-100'
        textColor = 'text-blue-800'
        icon = 'refresh'
        break
      default:
        backgroundColor = 'bg-gray-100'
        textColor = 'text-gray-600'
        icon = 'help-circle'
    }

    return { backgroundColor, textColor, icon }
  }

  const renderStatusFilter = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 py-5 bg-white border-b border-slate-200 shadow-sm"
        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
      >
        <TouchableOpacity
          className={`flex-row items-center px-4 py-3 border-2 rounded-full bg-white shadow-sm ${
            selectedStatus === 'all'
              ? 'bg-orange-500 border-orange-500 shadow-orange-500/30'
              : 'border-slate-200'
          }`}
          onPress={() => setSelectedStatus('all')}
        >
          <Ionicons
            name={selectedStatus === 'all' ? 'apps' : 'apps-outline'}
            size={16}
            color={selectedStatus === 'all' ? '#000000' : '#f97316'}
          />
          <Text className="ml-2 text-sm font-semibold text-center text-black">
            All ({statusCounts.all})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center px-4 py-3 border-2 rounded-full bg-white shadow-sm ${
            selectedStatus === 'pending'
              ? 'bg-amber-500 border-amber-500 shadow-amber-500/30'
              : 'border-slate-200'
          }`}
          onPress={() => setSelectedStatus('pending')}
        >
          <Ionicons
            name={selectedStatus === 'pending' ? 'time' : 'time-outline'}
            size={16}
            color={selectedStatus === 'pending' ? '#000000' : '#f59e0b'}
          />
          <Text className="ml-2 text-sm font-semibold text-center text-black">
            Pending ({statusCounts.pending})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center px-4 py-3 border-2 rounded-full bg-white shadow-sm ${
            selectedStatus === 'confirmed'
              ? 'bg-emerald-500 border-emerald-500 shadow-emerald-500/30'
              : 'border-slate-200'
          }`}
          onPress={() => setSelectedStatus('confirmed')}
        >
          <Ionicons
            name={
              selectedStatus === 'confirmed'
                ? 'checkmark-circle'
                : 'checkmark-circle-outline'
            }
            size={16}
            color={selectedStatus === 'confirmed' ? '#000000' : '#10b981'}
          />
          <Text className="ml-2 text-sm font-semibold text-center text-black">
            Confirmed ({statusCounts.confirmed})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center px-4 py-3 border-2 rounded-full bg-white shadow-sm ${
            selectedStatus === 'completed'
              ? 'bg-blue-500 border-blue-500 shadow-blue-500/30'
              : 'border-slate-200'
          }`}
          onPress={() => setSelectedStatus('completed')}
        >
          <Ionicons
            name={selectedStatus === 'completed' ? 'trophy' : 'trophy-outline'}
            size={16}
            color={selectedStatus === 'completed' ? '#000000' : '#3b82f6'}
          />
          <Text className="ml-2 text-sm font-semibold text-center text-black">
            Completed ({statusCounts.completed})
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )

  const renderBookingCard = (booking) => {
    const statusStyle = getStatusBadge(booking.status)
    const paymentStatusStyle = getPaymentStatusBadge(booking.paymentStatus)

    //! Get trek image from populated trek data or use default
    const trekImage =
      booking.trekId?.images?.[0] ||
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    const trekTitle = booking.trekId?.title || 'Trek Name Not Available'
    const trekLocation = booking.trekId?.location || 'Location Not Available'

    return (
      <TouchableOpacity
        key={booking._id}
        className="bg-white rounded-3xl overflow-hidden mb-5 shadow-lg border border-slate-100"
        onPress={() =>
          navigation.navigate('BookingDetail', { bookingId: booking._id })
        }
      >
        <View className="relative h-48">
          <Image
            source={{ uri: trekImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/20" />
          <View className="absolute top-4 right-4 flex-col gap-2">
            <View
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 shadow-sm ${statusStyle.backgroundColor}`}
            >
              <Ionicons
                name={statusStyle.icon}
                size={12}
                color={
                  statusStyle.textColor === 'text-green-800'
                    ? '#166534'
                    : statusStyle.textColor === 'text-yellow-800'
                    ? '#854d0e'
                    : statusStyle.textColor === 'text-red-800'
                    ? '#991b1b'
                    : statusStyle.textColor === 'text-blue-800'
                    ? '#1e40af'
                    : '#4b5563'
                }
              />
              <Text
                className={`text-xs font-bold uppercase tracking-wide ${statusStyle.textColor}`}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 shadow-sm ${paymentStatusStyle.backgroundColor}`}
            >
              <Ionicons
                name={paymentStatusStyle.icon}
                size={12}
                color={
                  paymentStatusStyle.textColor === 'text-green-800'
                    ? '#166534'
                    : paymentStatusStyle.textColor === 'text-yellow-800'
                    ? '#854d0e'
                    : paymentStatusStyle.textColor === 'text-blue-800'
                    ? '#1e40af'
                    : '#4b5563'
                }
              />
              <Text
                className={`text-xs font-bold uppercase tracking-wide ${paymentStatusStyle.textColor}`}
              >
                {booking.paymentStatus.charAt(0).toUpperCase() +
                  booking.paymentStatus.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-5">
          <Text className="text-xl font-bold text-slate-800 mb-3 leading-7">
            {trekTitle}
          </Text>

          <View className="flex-row items-center mb-2.5 py-0.5">
            <Ionicons name="location-outline" size={16} color="#f97316" />
            <Text className="ml-2.5 text-base text-slate-500 font-medium">
              {trekLocation}
            </Text>
          </View>

          <View className="flex-row items-center mb-2.5 py-0.5">
            <Ionicons name="calendar-outline" size={16} color="#f97316" />
            <Text className="ml-2.5 text-base text-slate-500 font-medium">
              {formatDateRange(booking.startDate, booking.endDate)}
            </Text>
          </View>

          <View className="flex-row items-center mb-2.5 py-0.5">
            <Ionicons name="people-outline" size={16} color="#f97316" />
            <Text className="ml-2.5 text-base text-slate-500 font-medium">
              {booking.participants}{' '}
              {booking.participants === 1 ? 'person' : 'people'}
            </Text>
          </View>

          <View className="flex-row items-center mb-2.5 py-0.5">
            <Ionicons name="card-outline" size={16} color="#f97316" />
            <Text className="ml-2.5 text-base text-slate-500 font-medium">
              Payment: {booking.paymentMethod?.toUpperCase() || 'N/A'}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-4 pt-4 border-t-2 border-slate-100">
            <Text className="text-base text-slate-500 font-semibold">
              Total Amount
            </Text>
            <Text className="text-2xl font-bold text-orange-500">
              NPR {booking.totalPrice?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="bg-orange-500 p-5 pt-6 pb-6 rounded-b-3xl shadow-lg">
          <View className="flex-col items-center">
            <Text className="text-3xl font-bold text-white mb-1">
              My Bookings
            </Text>
            <Text className="text-base text-white/90 mt-1">
              View and manage all your upcoming adventures
            </Text>
          </View>
          <View className="h-1 bg-white rounded-sm mt-3" />
        </View>
        <View className="flex-1 justify-center items-center p-10">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-lg font-semibold text-orange-500 mt-5 text-center">
            Loading your bookings...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="bg-orange-500 p-5 pt-6 pb-6 rounded-b-3xl shadow-lg">
          <View className="flex-col items-center">
            <Text className="text-3xl font-bold text-white mb-1">
              My Bookings
            </Text>
            <Text className="text-base text-white/90 mt-1">
              View and manage all your upcoming adventures
            </Text>
          </View>
          <View className="h-1 bg-white rounded-sm mt-3" />
        </View>
        <View className="flex-1 justify-center items-center p-10">
          <Ionicons name="alert-circle-outline" size={64} color="#f97316" />
          <Text className="text-2xl font-bold text-orange-500 mt-5 mb-3 text-center">
            Error Loading Bookings
          </Text>
          <Text className="text-base text-slate-500 text-center mb-8 leading-6">
            {error}
          </Text>
          <TouchableOpacity
            className="bg-orange-500 rounded-full px-8 py-4 shadow-lg shadow-orange-500/30"
            onPress={fetchBookings}
          >
            <Text className="text-white text-base font-bold text-center">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="bg-orange-500 p-5 pt-6 pb-6 rounded-b-3xl shadow-lg mt-7">
        <View className="flex-col items-center">
          <Text className="text-3xl font-bold text-white mb-1">
            My Bookings
          </Text>
          <Text className="text-base text-white/90 mt-1">
            View and manage all your upcoming adventures
          </Text>
        </View>
      </View>

      {renderStatusFilter()}

      <ScrollView
        className="flex-1 p-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map(renderBookingCard)
        ) : (
          <View className="items-center justify-center p-15 mt-10">
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text className="text-2xl font-bold text-slate-800 mt-6 mb-3 text-center">
              {selectedStatus === 'all'
                ? 'No bookings yet'
                : `No ${selectedStatus} bookings`}
            </Text>
            <Text className="text-base text-slate-500 text-center mb-8 leading-6 px-5">
              {selectedStatus === 'all'
                ? "You haven't made any bookings yet. Start exploring destinations to plan your next adventure!"
                : `You don't have any ${selectedStatus} bookings at the moment.`}
            </Text>
            {selectedStatus === 'all' && (
              <TouchableOpacity
                className="bg-orange-500 rounded-full px-8 py-4 shadow-lg shadow-orange-500/30"
                onPress={() => navigation.navigate('Explore')}
              >
                <Text className="text-white text-base font-bold text-center">
                  Explore Destinations
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default MyBookingsScreen
