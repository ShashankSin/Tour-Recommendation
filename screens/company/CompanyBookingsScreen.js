import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
function CompanyBookingsScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [searchQuery, activeFilter, bookings])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        throw new Error('Authentication token not found')
      }

      const decoded = jwtDecode(token)
      if (!decoded || !decoded.id || decoded.role !== 'company') {
        throw new Error('Invalid authentication token')
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.defaults.headers.common['Content-Type'] = 'application/json'

      const response = await axios.get(
        'http://10.0.2.2:5000/api/booking/company'
      )

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch bookings')
      }

      const bookings = response.data.bookings || []

      const sortedBookings = bookings.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )

      setBookings(sortedBookings)
      setFilteredBookings(sortedBookings)
    } catch (error) {
      console.error('❌ Error fetching bookings:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch bookings'
      Alert.alert('Error', errorMessage)
      setBookings([])
      setFilteredBookings([])
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    if (activeFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === activeFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.customerName.toLowerCase().includes(query) ||
          booking.trekName.toLowerCase().includes(query) ||
          booking.customerEmail.toLowerCase().includes(query)
      )
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        throw new Error('Authentication token not found')
      }

      const decoded = jwtDecode(token)
      if (!decoded || !decoded.id || decoded.role !== 'company') {
        throw new Error('Invalid authentication token')
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.defaults.headers.common['Content-Type'] = 'application/json'

      const response = await axios.put(
        `http://10.0.2.2:5000/api/booking/status/${bookingId}`,
        { status: newStatus }
      )

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Failed to update booking status'
        )
      }

      const updatedBooking = response.data.booking
      const updatedBookings = bookings.map((booking) =>
        booking._id === bookingId ? updatedBooking : booking
      )

      setBookings(updatedBookings)
      setFilteredBookings(updatedBookings)
      Alert.alert('Success', `Booking marked as ${newStatus}`)
    } catch (error) {
      console.error('Error updating booking:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update booking status'
      Alert.alert('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#2e7d32'
      case 'pending':
        return '#ef6c00'
      case 'completed':
        return '#1976d2'
      case 'cancelled':
        return '#d32f2f'
      default:
        return '#666'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#2e7d32'
      case 'partial':
        return '#ef6c00'
      case 'unpaid':
        return '#d32f2f'
      case 'refunded':
        return '#1976d2'
      default:
        return '#666'
    }
  }

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      {/* Header */}
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.customerName}>{item.userId?.name}</Text>
          <Text style={styles.bookingId}>Booking #{item._id?.slice(-6)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Trek Details */}
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="trail-sign-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.trekId?.title} ({item.trekId?.location})
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Trek Date: {new Date(item.trekDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-number-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Booking Date: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Duration: {item.trekId?.duration}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.participants} Participants
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Total: ${item.totalPrice?.toFixed(2)} –{' '}
            <Text style={{ color: getPaymentStatusColor(item.paymentStatus) }}>
              {item.paymentStatus.charAt(0).toUpperCase() +
                item.paymentStatus.slice(1)}
            </Text>
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactInfo}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="mail-outline" size={16} color="#FF5722" />
          <Text style={styles.contactButtonText}>{item.userId?.email}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call-outline" size={16} color="#FF5722" />
          <Text style={styles.contactButtonText}>
            {item.userId?.phone || 'N/A'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.bookingActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => {
                console.log('Booking ID:', item._id),
                  updateBookingStatus(item._id, 'confirmed')
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => updateBookingStatus(item._id, 'cancelled')}
            >
              <Ionicons name="close-circle-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateBookingStatus(item._id, 'completed')}
          >
            <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Mark Completed</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => Alert.alert('View Details', 'View booking details')}
        >
          <Ionicons name="eye-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchBookings}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer or trek"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'all' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'pending' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('pending')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'pending' && styles.activeFilterText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'confirmed' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('confirmed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'confirmed' && styles.activeFilterText,
              ]}
            >
              Confirmed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'completed' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'completed' && styles.activeFilterText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'cancelled' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('cancelled')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'cancelled' && styles.activeFilterText,
              ]}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookingsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No bookings found</Text>
          {searchQuery || activeFilter !== 'all' ? (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSearchQuery('')
                setActiveFilter('all')
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    elevation: 1,
  },
  activeFilterButton: {
    backgroundColor: '#FF5722',
  },
  filterButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  bookingsList: {
    padding: 16,
    paddingTop: 8,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingId: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  contactButtonText: {
    marginLeft: 4,
    color: '#FF5722',
    fontSize: 14,
  },
  bookingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  viewButton: {
    backgroundColor: '#607D8B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})

export default CompanyBookingsScreen
