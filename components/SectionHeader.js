import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

const SectionHeader = ({ title, onSeeAll }) => {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-xl font-bold text-gray-800">{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text className="text-emerald-600 font-semibold">See All</Text>
      </TouchableOpacity>
    </View>
  )
}

export default SectionHeader
