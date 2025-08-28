import { useState, useEffect } from 'react'

import {
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import TrekCard from '../../components/TrekCard'
import {
  Mountain,
  TrendingUp,
  MapPin,
  Compass,
  Sun,
  Star,
  AlertCircle,
} from 'lucide-react-native'

axios.defaults.baseURL = 'http://10.0.2.2:5000/api'
axios.defaults.timeout = 10000

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [trendingTreks, setTrendingTreks] = useState([])
  const [popularDestinations, setPopularDestinations] = useState([])
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [allTreks, setAllTreks] = useState([])

  // 3. useEffect to create tables and fetch treks from SQLite
  useEffect(() => {

    // Example: Fetch treks from SQLite
    const fetchTreks = async () => {
      const treks = await getTreks();
      setAllTreks(treks);
    };
    fetchTreks();
  }, []);
  const [hasUserActivity, setHasUserActivity] = useState(false)

  const fetchUserData = async (token) => {
    try {
      //! Fetch user bookings
      const bookingsResponse = await axios.get('/booking/user/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (bookingsResponse.data.success) {
        setBookings(bookingsResponse.data.bookings || [])
      }
    } catch (error) {
      setBookings([])
    }

   try {
    //! Fetch user reviews
        const reviewsResponse = await axios.get('/review/trek/all', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (reviewsResponse.data.success) {

          const userReviews = reviewsResponse.data.reviews.filter((review) => {
          const reviewUserId = typeof review.userId === 'string' ? review.userId : review.userId?._id;


        // Compare as strings
        return reviewUserId?.toString() === user.id?.toString();
      });

        setReviews(userReviews);
      }
    } catch (error) {
      setReviews([]);
    }


    try {
      //! Fetch user wishlist
      const wishlistResponse = await axios.get('/wishlist/get', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (wishlistResponse.data.success) {
        setWishlistItems(wishlistResponse.data.wishlist.treks || [])
      }
    } catch (error) {
      setWishlistItems([])
    }
  }

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token || !user) {
        setLoading(false)
        return
      }

      //! Fetch user data (bookings, reviews, wishlist)
      await fetchUserData(token)

      //! Fetch all treks
      let treks = []
      let fetchedFromAPI = false
      try {
        const allTreksResponse = await axios.get('/trek/allitinerary')
        if (allTreksResponse.data.success) {
          treks = allTreksResponse.data.treks || []
          setAllTreks(treks)
          await AsyncStorage.setItem('cachedTreks', JSON.stringify(treks))
          fetchedFromAPI = true
        }
      } catch (error) {
        const cachedTreks = await AsyncStorage.getItem('cachedTreks')
        if (cachedTreks) {
          treks = JSON.parse(cachedTreks)
          setAllTreks(treks)
        } else {
          setAllTreks([])
        }
      }

      //! Fetch recommendations
      try {
        const recommendationsResponse = await axios.get(
          `/recommendations?userId=${user.id}&type=recommendations&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (recommendationsResponse.data.success) {
          setRecommendations(recommendationsResponse.data.data || [])
        } else {
          //! Fallback to highest rated treks
          const highestRated = [...treks]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)
          setRecommendations(highestRated)
        }
      } catch (error) {
        //! Fallback to highest rated treks
        const highestRated = [...treks]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5)
        setRecommendations(highestRated)
      }

      //! Fetch trending treks
      try {
        const trendingResponse = await axios.get('/trek/trending', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (trendingResponse.data.success) {
          setTrendingTreks(trendingResponse.data.treks || [])
        } else {
          //! Fallback to most reviewed treks
          const mostReviewed = [...treks]
            .sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
            .slice(0, 5)
          setTrendingTreks(mostReviewed)
        }
      } catch (error) {
        //! Fallback to most reviewed treks
        const mostReviewed = [...treks]
          .sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
          .slice(0, 5)
        setTrendingTreks(mostReviewed)
      }

      //! Fetch popular destinations
      try {
        const popularResponse = await axios.get('/trek/popular', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (popularResponse.data.success) {
          setPopularDestinations(popularResponse.data.treks || [])
        } else {
          //! Fallback to most booked treks
          const mostBooked = [...treks]
            .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
            .slice(0, 5)
          setPopularDestinations(mostBooked)
        }
      } catch (error) {
        //! Fallback to most booked treks
        const mostBooked = [...treks]
          .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
          .slice(0, 5)
        setPopularDestinations(mostBooked)
      }
    } catch (error) {
      const cachedTreks = await AsyncStorage.getItem('cachedTreks')
      let treks = []
      if (cachedTreks) {
        treks = JSON.parse(cachedTreks)
        setAllTreks(treks)
      } else {
        setAllTreks([])
      }
      const highestRated = [...treks]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5)
      setRecommendations(highestRated)
      setTrendingTreks(highestRated)
      setPopularDestinations(highestRated)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  useEffect(() => {
    const hasActivity =
      bookings.length > 0 || reviews.length > 0 || wishlistItems.length > 0
    setHasUserActivity(hasActivity)
  }, [bookings, reviews, wishlistItems])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
            <ActivityIndicator size="large" color="#ea580c" />
            <Text className="text-gray-800 mt-4 font-semibold text-lg">
              Loading adventures...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center w-full">
            <Mountain size={64} color="#ea580c" />
            <Text className="text-2xl font-bold text-gray-800 mt-4">
              Welcome to TrekApp
            </Text>
            <Text className="text-gray-600 text-center mt-2 text-lg">
              Please log in to discover amazing treks
            </Text>
            <TouchableOpacity
              className="bg-orange-500 rounded-2xl px-8 py-4 mt-6 shadow-lg"
              onPress={() =>
                navigation.navigate('Auth', { screen: 'UserType' })
              }
            >
              <Text className="text-white font-bold text-lg">Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  const renderTrekCard = ({ item: trek }) => {
    if (!trek || !trek._id) return null
    return (
      <TrekCard
        trek={trek}
        onPress={() =>
          navigation.navigate('ItineraryDetail', {
            itineraryId: trek._id,
          })
        }
      />
    )
  }

  const SectionHeader = ({ section, onSeeAll, icon: Icon }) => (
    <View className="flex-row items-center justify-between px-6 mb-4">
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-orange-500 rounded-2xl items-center justify-center mr-3 shadow-lg">
          <Icon size={22} color="white" />
        </View>
        <Text className="text-xl font-bold text-gray-800">{section}</Text>
      </View>
      <TouchableOpacity onPress={onSeeAll}>
        <Text className="text-orange-600 font-semibold text-lg">See All</Text>
      </TouchableOpacity>
    </View>
  )

  const renderSection = ({ section, data, onSeeAll, icon: Icon }) => (
    <View className="my-8">
      <SectionHeader section={section} onSeeAll={onSeeAll} icon={Icon} />
      <FlatList
        data={data}
        renderItem={renderTrekCard}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  )

  const renderAllTreks = () => (
    <View className="my-8">
      <SectionHeader
        section="All Treks"
        onSeeAll={() => navigation.navigate('Explore')}
        icon={Mountain}
      />
      <FlatList
        data={allTreks}
        renderItem={renderTrekCard}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  )

  const sections = [
    {
      data: recommendations,
      title: 'Recommended for You',
      icon: Compass,
      onSeeAll: () => navigation.navigate('Explore', { filter: 'recommended' }),
    },
    {
      data: trendingTreks,
      title: 'Trending Now',
      icon: TrendingUp,
      onSeeAll: () => navigation.navigate('Explore', { filter: 'trending' }),
    },
    {
      data: popularDestinations,
      title: 'Popular Destinations',
      icon: MapPin,
      onSeeAll: () => navigation.navigate('Explore', { filter: 'popular' }),
    },
  ].filter((section) => section.data && section.data.length > 0)

  const renderContent = () => (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-orange-500 px-6 pt-16 pb-8 rounded-b-[40px] shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Sun size={24} color="white" />
              <Text className="text-white text-lg ml-2 font-medium">
                Good morning!
              </Text>
            </View>
            <Text className="text-white text-3xl font-bold mt-1">
              {user?.name || 'Traveler'}
            </Text>
            <Text className="text-white mt-2 text-lg">
              Ready for your next adventure?
            </Text>
          </View>
          <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
            <Mountain size={28} color="white" />
          </View>
        </View>
      </View>

      {/* Quick Stats - Only show if user has activity */}
      {hasUserActivity && (
        <View className="flex-row mx-6 -mt-8 mb-6">
          <View className="flex-1 bg-white rounded-3xl p-5 mr-3 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Star size={20} color="#ea580c" />
              <Text className="text-gray-700 text-sm ml-2 font-medium">
                Completed
              </Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800">
              {bookings.length}
            </Text>
            <Text className="text-gray-600 text-sm">Treks</Text>
          </View>
          <View className="flex-1 bg-white rounded-3xl p-5 ml-3 shadow-lg border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Mountain size={20} color="#f97316" />
              <Text className="text-gray-700 text-sm ml-2 font-medium">
                Rating
              </Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800">
              {reviews.length > 0
                ? (
                    reviews.reduce((acc, review) => acc + review.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : '0.0'}
            </Text>
            <Text className="text-gray-600 text-sm">Average</Text>
          </View>
        </View>
      )}

      {/* Show all treks if no user activity, otherwise show curated sections */}
      {!hasUserActivity
        ? renderAllTreks()
        : sections.map((section) => (
            <View key={section.title} className="mt-8">
              {renderSection({
                section: section.title,
                data: section.data,
                onSeeAll: section.onSeeAll,
                icon: section.icon,
              })}
            </View>
          ))}

      {/* Show all treks section at the bottom if user has activity */}
      {hasUserActivity && allTreks.length > 0 && (
        <View className="my-8">
          <SectionHeader
            section="All Available Treks"
            onSeeAll={() => navigation.navigate('Explore')}
            icon={Mountain}
          />
          <FlatList
            data={allTreks.slice(0, 10)} // Show first 10 treks
            renderItem={renderTrekCard}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={renderContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

export default HomeScreen
