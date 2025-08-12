import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

function WishlistScreen({ navigation }) {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  const handleBooking = async (itineraryId) => {
    const token = await AsyncStorage.getItem('token')
    console.log('Token:', token)
    console.log('Trek ID:', itineraryId)
    navigation.navigate('Booking', { trekId: itineraryId })
  }

  const fetchWishlist = async () => {
    try {
      setLoading(true)

      const token = await AsyncStorage.getItem('token')
      if (!token) {
        Alert.alert('Error', 'User not authenticated')
        return
      }

      const decoded = jwtDecode(token)
      console.log('✅ Decoded token:', decoded)

      const response = await axios.get(
        'http://10.0.2.2:5000/api/wishlist/get',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('✅ Wishlist API Response:', response.data)

      if (response.data.success) {
        const treks = response.data.wishlist.treks
        console.log('📦 Wishlist Items:', treks)
        setWishlistItems(treks)
      } else {
        Alert.alert('Error', 'Failed to fetch wishlist')
      }
    } catch (error) {
      console.error('❌ Wishlist fetch error:', error.message)
      Alert.alert('Error', 'Something went wrong while fetching wishlist.')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Wishlist screen focused - refreshing data')
      fetchWishlist()
    }, [])
  )

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="px-4 py-6 bg-orange-500">
        <Text className="text-2xl font-bold text-white">Wishlist</Text>
        <Text className="text-white opacity-80">Your saved destinations</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {wishlistItems.length > 0 ? (
            wishlistItems.map((item) => (
              <TouchableOpacity
                key={item._id}
                className="bg-white rounded-xl overflow-hidden mb-4 shadow"
                onPress={() =>
                  navigation.navigate('ItineraryDetail', {
                    itineraryId: item._id,
                  })
                }
              >
                <Image
                  source={{ uri: item.images?.[0] }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                <View className="absolute top-2 right-2">
                  <TouchableOpacity className="bg-white rounded-full p-2">
                    <Ionicons name="heart" size={24} color="#f97316" />
                  </TouchableOpacity>
                </View>
                <View className="p-4">
                  <Text className="text-lg font-bold text-gray-800">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#9ca3af"
                    />
                    <Text className="ml-1 text-gray-500">{item.location}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-orange-500 font-bold">
                      ₹{item.price}
                    </Text>
                    <TouchableOpacity
                      className="bg-orange-500 px-4 py-2 rounded-lg"
                      onPress={() => handleBooking(item._id)}
                    >
                      <Text className="text-white font-medium">Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-16">
              <Ionicons name="heart-outline" size={64} color="#d1d5db" />
              <Text className="text-gray-400 text-lg mt-4">
                Your wishlist is empty
              </Text>
              <TouchableOpacity
                className="mt-4 bg-orange-500 px-6 py-3 rounded-lg"
                onPress={() => navigation.navigate('Explore')}
              >
                <Text className="text-white font-medium">
                  Explore Destinations
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default WishlistScreen
