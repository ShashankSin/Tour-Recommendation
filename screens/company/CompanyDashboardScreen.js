import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LineChart } from 'react-native-chart-kit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

function CompanyDashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalTreks: 0,
      totalBookings: 0,
      totalRevenue: 0,
      pendingBookings: 0,
    },
    recentBookings: [],
    popularTreks: [],
    monthlyRevenue: [],
    companyProfile: null,
  })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        throw new Error('Authentication token not found')
      }

      // Validate token and role
      const decoded = jwtDecode(token)
      if (!decoded || !decoded.id || decoded.role !== 'company') {
        throw new Error('Invalid authentication token')
      }

      // Set default headers for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.defaults.headers.common['Content-Type'] = 'application/json'

      const response = await axios.get(
        'http://10.0.2.2:5000/api/dashboard/company'
      )

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Failed to fetch dashboard data'
        )
      }

      const { company, stats, recentBookings, popularTreks, monthlyRevenue } =
        response.data.data

      setDashboardData({
        stats,
        recentBookings,
        popularTreks,
        monthlyRevenue,
        companyProfile: company,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch dashboard data'
      Alert.alert('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const renderStatCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity style={styles.bookingItem}>
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingCustomer}>{item.customerName}</Text>
        <Text style={styles.bookingTrek}>{item.trekName}</Text>
        <Text style={styles.bookingDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.bookingMeta}>
        <Text style={styles.bookingAmount}>NPR {item.amount}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'confirmed' ? '#e6f7e6' : '#fff3e0',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === 'confirmed' ? '#2e7d32' : '#ef6c00' },
            ]}
          >
            {item.status === 'confirmed' ? 'Confirmed' : 'Pending'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderPopularTrek = ({ item }) => (
    <TouchableOpacity style={styles.popularTrekCard}>
      <Image source={{ uri: item.image }} style={styles.popularTrekImage} />
      <View style={styles.popularTrekOverlay}>
        <Text style={styles.popularTrekName}>{item.name}</Text>
        <Text style={styles.popularTrekBookings}>{item.bookings} bookings</Text>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Company Dashboard</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchDashboardData}
        >
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          {renderStatCard(
            'Total Treks',
            dashboardData.stats.totalTreks,
            'trail-sign',
            '#4CAF50',
            () => navigation.navigate('Itineraries')
          )}
          {renderStatCard(
            'Active Bookings',
            dashboardData.stats.totalBookings,
            'calendar',
            '#2196F3',
            () => navigation.navigate('Bookings')
          )}
          {renderStatCard(
            'Revenue',
            `$${dashboardData.stats.totalRevenue}`,
            'cash',
            '#FF9800',
            null
          )}
          {renderStatCard(
            'Pending Approvals',
            dashboardData.stats.pendingBookings,
            'hourglass',
            '#F44336',
            () => navigation.navigate('Bookings', { filter: 'pending' })
          )}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Monthly Revenue</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  data: [1200, 1800, 1500, 2500, 3200, 4250],
                },
              ],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#FF5722',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CompanyBookings')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {dashboardData.recentBookings.length > 0 ? (
            <FlatList
              data={dashboardData.recentBookings}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No recent bookings</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Treks</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CompanyItineraries')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {dashboardData.popularTreks.length > 0 ? (
            <FlatList
              data={dashboardData.popularTreks}
              renderItem={renderPopularTrek}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularTreksContainer}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trail-sign-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No treks available</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statContent: {},
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#FF5722',
    fontWeight: '500',
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bookingDetails: {
    flex: 1,
  },
  bookingCustomer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  bookingTrek: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookingDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  bookingMeta: {
    alignItems: 'flex-end',
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
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
  popularTreksContainer: {
    paddingVertical: 8,
  },
  popularTrekCard: {
    width: 180,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  popularTrekImage: {
    width: '100%',
    height: '100%',
  },
  popularTrekOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  popularTrekName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  popularTrekBookings: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
})

export default CompanyDashboardScreen
