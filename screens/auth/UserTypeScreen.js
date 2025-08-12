import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

const UserTypeScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="dark" />
      <View className="flex-1 px-6 py-8">
        <View className="items-center mb-8">
          <Image
            source={{ uri: 'https://placeholder.svg?height=120&width=120' }}
            className="w-32 h-32 mb-4"
          />
          <Text className="text-3xl font-bold text-gray-800">Trek Guide</Text>
          <Text className="text-base text-gray-600 text-center mt-2">
            Choose how you want to use the application
          </Text>
        </View>

        <View className="flex-1 justify-center space-y-6">
          <TouchableOpacity
            className="bg-primary p-6 rounded-xl shadow-md"
            onPress={() => navigation.navigate('Login', { userType: 'user' })}
          >
            <Text className="text-white text-xl font-semibold text-center">
              Continue as Traveler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-secondary p-6 rounded-xl shadow-md my-4"
            onPress={() =>
              navigation.navigate('CompanyLogin', { userType: 'company' })
            }
          >
            <Text className="text-white text-xl font-semibold text-center">
              Continue as Company
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-800 p-6 rounded-xl shadow-md"
            onPress={() =>
              navigation.navigate('AdminLogin', { userType: 'admin' })
            }
          >
            <Text className="text-white text-xl font-semibold text-center">
              Admin Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default UserTypeScreen
