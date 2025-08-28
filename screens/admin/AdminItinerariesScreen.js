import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import {
  Search,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Mountain,
  TrendingUp,
} from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { CommonActions } from '@react-navigation/native'
import { useAuth } from '../../context/AuthContext'

const { width } = Dimensions.get('window')

const AdminItinerariesScreen = () => {
  const [itineraries, setItineraries] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const headerScale = useRef(new Animated.Value(0.9)).current
  const searchScale = useRef(new Animated.Value(0.95)).current
  const floatingAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const navigation = useNavigation()
  const { logout } = useAuth()

 useEffect(() => {
     // Staggered animations
    Animated.stagger(150, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(searchScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    // Continuous floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start()
    fetchItineraries()
  }, [])

  //! Fetch all treks
  const fetchItineraries = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`http://10.0.2.2:5000/api/trek/allitinerary`)
      const data = res.data.treks
      if (!Array.isArray(data)) throw new Error('Itineraries must be an array')
      setItineraries(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load itineraries. Please try again.')
      setItineraries([])
    } finally {
      setLoading(false)
    }
  }

  //! Update isApproved field
  const updateApproval = async (itineraryId, approve) => {
    try {
      console.log(
        `Setting itinerary to ${approve ? 'approved' : 'pending'} with ID:`,
        itineraryId
      )

      const token = await AsyncStorage.getItem('token')
      if (!token) {
        Alert.alert(
          'Error',
          'Authorization token is missing. Please log in again.'
        )
        await logout()
        return
      }

      const decoded = jwtDecode(token)
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        Alert.alert('Session Expired', 'Please log in again.')
        await logout()
        return
      }

      if (decoded.role !== 'admin') {
        Alert.alert('Unauthorized', 'Only admin can approve itineraries')
        return
      }
      setItineraries((prev) =>
        prev.map((item) =>
          item._id === itineraryId ? { ...item, isApproved: approve } : item
        )
      )

      const endpoint = approve ? 'approve' : 'reject'
      const response = await axios.put(
        `http://10.0.2.2:5000/api/trek/${endpoint}/${itineraryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to update approval status'
        )
      }

      Alert.alert(
        'Success',
        `Itinerary ${approve ? 'approved' : 'set to pending'} successfully`
      )
    } catch (err) {
      console.error('Error updating approval status:', err)

      setItineraries((prev) =>
        prev.map((item) =>
          item._id === itineraryId ? { ...item, isApproved: !approve } : item
        )
      )

      if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.', [
          {
            text: 'OK',
            onPress: async () => {
              await logout()
            },
          },
        ])
      } else {
        Alert.alert(
          'Error',
          err.response?.data?.message || 'Failed to update approval status'
        )
      }
    }
  }

  const filteredItineraries = itineraries.filter((item) => {
    const txt = searchQuery.toLowerCase()
    const matches =
      item.title?.toLowerCase().includes(txt) ||
      item.location?.toLowerCase().includes(txt)
    if (!matches) return false
    if (filter === 'all') return true
    if (filter === 'approved') return item.isApproved === true
    if (filter === 'pending') return item.isApproved === false
    return true
  })

  const AnimatedItineraryCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current
    const cardScale = useRef(new Animated.Value(1)).current

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start()
    }, [])

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            { scale: cardScale },
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          className="bg-white rounded-3xl mb-8 shadow-xl border border-orange-100 overflow-hidden"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View className="relative">
            <Image
              source={{
                uri:
                  item.images?.[0] ||
                  'https://via.placeholder.com/300x200/FF7A00/FFFFFF?text=Trek',
              }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            <View className="absolute top-4 right-4">
              <View
                className={`px-4 py-2 rounded-full ${
                  item.isApproved ? 'bg-green-500' : 'bg-yellow-500'
                } shadow-lg`}
              >
                <Text className="text-white text-sm font-bold">
                  {item.isApproved ? 'Approved' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>

          <View className="p-6">
            {/* Title */}
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              {item.title}
            </Text>

            {/* Details */}
            <View className="space-y-6 mb-6">
              <View className="flex-row items-center">
                <MapPin size={20} color="#6B7280" />
                <Text className="text-gray-600 text-base ml-4">
                  {item.location}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Calendar size={20} color="#6B7280" />
                <Text className="text-gray-600 text-base ml-4">
                  {item.updatedAt?new Date(item.updatedAt).toLocaleDateString():'Date not available'}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Clock size={20} color="#6B7280" />
                <Text className="text-gray-600 text-base ml-4">
                  {item.duration} days
                </Text>
              </View>
            </View>

            <View className="bg-orange-50 rounded-2xl p-5 mb-6">
              <Text className="text-orange-800 font-semibold mb-3 text-lg">
                Category: {item.category}
              </Text>
              <Text className="text-gray-600 text-base leading-6">
                {item.description?.slice(0, 100)}...
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-3xl font-bold text-orange-600">
                ${item.price}
              </Text>
              <Text className="text-gray-500 text-lg">
                {item.duration} days
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row justify-end space-x-4">
              {!item.isApproved ? (
                <TouchableOpacity
                  className="bg-green-500 rounded-2xl px-8 py-4 flex-row items-center shadow-lg"
                  onPress={() => {
                    console.log('Approving itinerary with ID:', item._id)
                    updateApproval(item._id, true)
                  }}
                >
                  <CheckCircle size={22} color="white" />
                  <Text className="text-white font-bold ml-3 text-lg">
                    Approve
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-yellow-500 rounded-2xl px-8 py-4 flex-row items-center shadow-lg"
                  onPress={() => {
                    console.log(
                      'Setting itinerary to pending with ID:',
                      item._id
                    )
                    updateApproval(item._id, false)
                  }}
                >
                  <XCircle size={22} color="white" />
                  <Text className="text-white font-bold ml-3 text-lg">
                    Set Pending
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const AnimatedFilterButton = ({ type, isActive, onPress, index }) => {
    const buttonAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start()
    }, [])

    return (
      <Animated.View
        style={{
          opacity: buttonAnim,
          transform: [
            {
              translateY: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          className={`mr-4 mb-4 px-8 py-4 rounded-2xl shadow-lg ${
            isActive ? 'bg-orange-500' : 'bg-white border border-orange-200'
          }`}
          onPress={onPress}
        >
          <Text
            className={`font-semibold text-lg capitalize ${
              isActive ? 'text-white' : 'text-gray-700'
            }`}
          >
            {type}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const floatingY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  })

  if (loading && !itineraries.length) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-orange-50">
        <Animated.View
          className="bg-white rounded-3xl p-10 shadow-2xl items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          >
            <ActivityIndicator size="large" color="#ea580c" />
          </Animated.View>
          <Text className="text-gray-600 mt-6 font-semibold text-xl">
            Loading itineraries...
          </Text>
        </Animated.View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="flex-1 bg-orange-50">
        <StatusBar style="dark" />

        {/* Animated Header */}
        <Animated.View
          className="bg-orange-500 px-6 pt-8 pb-8 rounded-b-[40px] shadow-2xl"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: headerScale }],
          }}
        >
          {/* Floating Elements */}
          <Animated.View
            className="absolute top-16 right-8 w-4 h-4 bg-white/30 rounded-full"
            style={{ transform: [{ translateY: floatingY }] }}
          />
          <Animated.View
            className="absolute top-32 left-8 w-3 h-3 bg-yellow-300/40 rounded-full"
            style={{ transform: [{ translateY: floatingY }] }}
          />

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="flex-row items-center mb-3">
              <Mountain size={32} color="white" />
              <Text className="text-white text-xl opacity-90 ml-4">
                Trek Management
              </Text>
            </View>
            <Text className="text-white text-3xl font-bold mb-2">
              Itineraries
            </Text>
            <Text className="text-white opacity-90 text-lg">
              Manage and approve trek itineraries
            </Text>
          </Animated.View>

          {/* Search Bar */}
          <Animated.View
            className="mt-8"
            style={{
              opacity: fadeAnim,
              transform: [{ scale: searchScale }],
            }}
          >
            <View className="bg-white/95 backdrop-blur-xl rounded-3xl px-3 py-3 shadow-xl border border-orange-200 flex-row items-center">
              <Search size={24} color="#ea580c" />
              <TextInput
                className="flex-1 ml-4 text-gray-900 text-lg"
                placeholder="Search by title or location..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Filters */}
        <View className="px-6 py-8 -mt-4">
          <View className="flex-row flex-wrap">
            {['all', 'approved', 'pending'].map((type, index) => (
              <AnimatedFilterButton
                key={type}
                type={type}
                isActive={filter === type}
                onPress={() => setFilter(type)}
                index={index}
              />
            ))}
          </View>
        </View>

        {/* Error */}
        {error && (
          <Animated.View
            className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-3xl p-6"
            style={{ opacity: fadeAnim }}
          >
            <Text className="text-red-600 text-lg font-semibold mb-4">
              {error}
            </Text>
            <TouchableOpacity
              className="bg-orange-500 rounded-2xl px-8 py-4 self-end shadow-lg"
              onPress={fetchItineraries}
            >
              <Text className="text-white font-bold text-lg">Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* List */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center mb-8">
            <TrendingUp size={28} color="#ea580c" />
            <Text className="text-2xl font-bold text-gray-800 ml-4">
              All Itineraries
            </Text>
            <Animated.View
              className="ml-4"
              style={{
                transform: [
                  {
                    rotate: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <Sparkles size={24} color="#f97316" />
            </Animated.View>
          </View>

          {filteredItineraries.length ? (
            filteredItineraries.map((item, idx) => (
              <AnimatedItineraryCard
                key={item._id || idx}
                item={item}
                index={idx}
              />
            ))
          ) : (
            <Animated.View
              className="items-center py-16"
              style={{ opacity: fadeAnim }}
            >
              <Mountain size={64} color="#d1d5db" />
              <Text className="text-center text-gray-500 mt-6 text-xl font-semibold">
                No itineraries found
              </Text>
              <Text className="text-center text-gray-400 mt-3 text-lg">
                Try adjusting your search or filter criteria
              </Text>
            </Animated.View>
          )}

          <View className="h-10" />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default AdminItinerariesScreen
