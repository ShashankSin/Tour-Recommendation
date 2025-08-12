import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const mockBookings = [
  {
    id: '1',
    name: 'Mount Everest Trek',
    location: 'Nepal',
    companyName: 'Adventure Tours',
    totalPrice: 12000,
    image: 'https://example.com/mount-everest.jpg',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-10-10'),
    participants: 2,
    specialRequests: 'Need extra oxygen',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    trekId: '1',
  },
]

function BookingDetailScreen({ route, navigation }) {
  const { bookingId } = route.params
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setBooking(mockBookings[bookingId])
      setLoading(false)
    }, 500)
  }, [bookingId])

  const formatDateRange = (startDate, endDate) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' }
    const start = startDate.toLocaleDateString('en-US', options)
    const end = endDate.toLocaleDateString('en-US', options)
    return `${start} - ${end}`
  }

  const getStatusBadge = (status) => {
    let backgroundColor, textColor

    switch (status) {
      case 'confirmed':
        backgroundColor = '#dcfce7'
        textColor = '#166534'
        break
      case 'pending':
        backgroundColor = '#fef9c3'
        textColor = '#854d0e'
        break
      case 'cancelled':
        backgroundColor = '#fee2e2'
        textColor = '#991b1b'
        break
      case 'completed':
        backgroundColor = '#dbeafe'
        textColor = '#1e40af'
        break
      default:
        backgroundColor = '#f3f4f6'
        textColor = '#4b5563'
    }

    return { backgroundColor, textColor }
  }

  const getPaymentStatusBadge = (status) => {
    let backgroundColor, textColor

    switch (status) {
      case 'paid':
        backgroundColor = '#dcfce7'
        textColor = '#166534'
        break
      case 'pending':
        backgroundColor = '#fef9c3'
        textColor = '#854d0e'
        break
      case 'refunded':
        backgroundColor = '#dbeafe'
        textColor = '#1e40af'
        break
      default:
        backgroundColor = '#f3f4f6'
        textColor = '#4b5563'
    }

    return { backgroundColor, textColor }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    )
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Booking Not Found</Text>
        <Text style={styles.errorMessage}>
          The booking you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Ionicons name="arrow-back" size={16} color="#f97316" />
          <Text style={styles.backButtonText}>Back to Bookings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const statusStyle = getStatusBadge(booking.status)
  const paymentStatusStyle = getPaymentStatusBadge(booking.paymentStatus)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Ionicons name="arrow-back" size={20} color="#f97316" />
          <Text style={styles.backLinkText}>Back to Bookings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Image
            source={{ uri: booking.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.cardContent}>
            <View style={styles.titleSection}>
              <View>
                <Text style={styles.title}>{booking.name}</Text>
                <Text style={styles.location}>{booking.location}</Text>
                <Text style={styles.company}>
                  Provided by {booking.companyName}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  ₹{booking.totalPrice.toLocaleString()}
                </Text>
                <Text style={styles.priceLabel}>Total price</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Trip Dates</Text>
                  <Text style={styles.detailText}>
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </Text>
                  <Text style={styles.detailSubtext}>
                    {Math.ceil(
                      (booking.endDate.getTime() -
                        booking.startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Participants</Text>
                  <Text style={styles.detailText}>
                    {booking.participants}{' '}
                    {booking.participants === 1 ? 'person' : 'people'}
                  </Text>
                </View>
              </View>

              {booking.specialRequests ? (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#f97316"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailTitle}>Special Requests</Text>
                    <Text style={styles.detailText}>
                      {booking.specialRequests}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.detailItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Booking Status</Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusStyle.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: statusStyle.textColor },
                      ]}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Payment</Text>
                  <View style={styles.paymentRow}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: paymentStatusStyle.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: paymentStatusStyle.textColor },
                        ]}
                      >
                        {booking.paymentStatus.charAt(0).toUpperCase() +
                          booking.paymentStatus.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.paymentMethod}>
                      via{' '}
                      {booking.paymentMethod.charAt(0).toUpperCase() +
                        booking.paymentMethod.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#f97316"
                  style={styles.detailIcon}
                />
                <View>
                  <Text style={styles.detailTitle}>Booking ID</Text>
                  <Text style={styles.bookingId}>{booking.id}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionSection}>
              {booking.status === 'confirmed' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.modifyButton}
                    onPress={() =>
                      navigation.navigate('ModifyBooking', {
                        bookingId: booking.id,
                      })
                    }
                  >
                    <Text style={styles.modifyButtonText}>Modify Booking</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.status === 'completed' && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() =>
                    navigation.navigate('WriteReview', {
                      trekId: booking.trekId,
                    })
                  }
                >
                  <Text style={styles.reviewButtonText}>Write a Review</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fef7ed',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef7ed',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fef7ed',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fed7aa',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backLinkText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  cardContent: {
    padding: 28,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#fed7aa',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 34,
  },
  location: {
    fontSize: 18,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 6,
  },
  company: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  priceContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fed7aa',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f97316',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '600',
  },
  detailsGrid: {
    marginBottom: 28,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#fefbf7',
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  detailIcon: {
    marginRight: 18,
    marginTop: 4,
    backgroundColor: '#fff7ed',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    lineHeight: 24,
  },
  detailSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  paymentMethod: {
    marginLeft: 14,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#1f2937',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 28,
    paddingTop: 28,
    borderTopWidth: 2,
    borderTopColor: '#fed7aa',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  modifyButton: {
    flex: 1,
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#f97316',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modifyButtonText: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reviewButton: {
    backgroundColor: '#f97316',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
  },
})

export default BookingDetailScreen
