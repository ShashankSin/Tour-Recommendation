import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

// Change this based on your environment
const SERVER_BASE_URL = 'http://10.0.2.2:5000'

const TrekCard = ({ trek, onPress }) => {
  const [imageErrors, setImageErrors] = useState({})

  const handleImageError = (imageIndex) => {
    setImageErrors((prev) => ({ ...prev, [imageIndex]: true }))
  }

  const renderImages = () => {
    const hasImages = trek.images && trek.images.length > 0
    const fallbackImage = 'https://via.placeholder.com/800x600?text=No+Image'

    if (!hasImages) {
      return (
        <Image
          source={{ uri: fallbackImage }}
          className="w-full h-40"
          resizeMode="cover"
        />
      )
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        className="w-full h-40"
      >
        {trek.images.map((image, index) => {
          const imageUrl = imageErrors?.[index]
            ? fallbackImage
            : image?.startsWith('http')
            ? image
            : `${SERVER_BASE_URL}/uploads/${image}`

          console.log('Image URL:', imageUrl)

          return (
            <View key={index} className="w-72 h-40">
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => handleImageError(index)}
              />
              {trek.images.length > 1 && (
                <View className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-1">
                  <Text className="text-white text-xs font-medium">
                    {index + 1}/{trek.images.length}
                  </Text>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>
    )
  }

  return (
    <TouchableOpacity
      className="mr-4 bg-white rounded-xl shadow-sm overflow-hidden w-72"
      onPress={onPress}
    >
      {renderImages()}

      <View className="p-3">
        <Text className="text-lg font-bold text-gray-800 mb-1">
          {trek.title}
        </Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={16} color="#10b981" />
          <Text className="text-gray-600 ml-1">{trek.location}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#10b981" />
            <Text className="text-gray-600 ml-1">{trek.duration} days</Text>
          </View>
          <View className="flex-row items-center bg-emerald-100 px-2 py-1 rounded-full">
            <Ionicons name="star" size={14} color="#10b981" />
            <Text className="text-emerald-600 ml-1 font-medium">
              {trek.rating ? trek.rating.toFixed(1) : '0.0'}
            </Text>
          </View>
        </View>
        <View className="mt-2 flex-row justify-between items-center">
          <Text className="text-emerald-600 font-bold text-lg">
            NPR {trek.price}
          </Text>
          <View className="bg-emerald-500 px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-medium">
              {trek.difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default TrekCard
