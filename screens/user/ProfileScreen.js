import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../../context/AuthContext'
import { CommonActions } from '@react-navigation/native'
import {
  Calendar,
  MapPin,
  Settings,
  Edit3,
  LogOut,
  LogIn,
  Shield,
  Award,
  Camera,
  Star,
} from 'lucide-react-native'

function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    memberSince: '',
    tripsCompleted: 0,
  })

  const { logout } = useAuth()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        return
      }

      const decoded = jwtDecode(token)
      console.log('🔐 Decoded Token:', decoded)

      const response = await fetch('http://10.0.2.2:5000/api/user/userData', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const userData = await response.json()
      console.log('📥 User Data:', userData)

      if (userData.success && userData.usersData) {
        setUser((prevUser) => ({
          ...prevUser,
          id: decoded.id || '',
          name: userData.usersData.name || '',
          email: userData.usersData.email || '',
          avatar: userData.usersData.avatar || prevUser.avatar,
          memberSince: userData.usersData.createdAt
            ? new Date(userData.usersData.createdAt).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })
            : '',
          tripsCompleted: userData.usersData.tripsCompleted || 0,
        }))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      Alert.alert('Error', 'Failed to load profile data')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'UserType' }],
        })
      )
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const MenuButton = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    bgColor = 'bg-white',
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`${bgColor} rounded-3xl p-5 mb-4 shadow-lg border border-gray-100`}
    >
      <View className="flex-row items-center">
        <View className="w-14 h-14 bg-orange-500 rounded-2xl items-center justify-center mr-4 shadow-md">
          <Icon size={26} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">{title}</Text>
          {subtitle && (
            <Text className="text-gray-600 text-sm mt-1">{subtitle}</Text>
          )}
        </View>
        <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
          <Text className="text-orange-600 text-lg font-bold">›</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-orange-500 px-6 pt-8 pb-16 rounded-b-[40px] shadow-lg">
          <View className="items-center">
            <View className="relative mb-4">
              <Image
                source={{ uri: user.avatar }}
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg">
                <Camera size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-3xl font-bold text-white mt-2">
              {user.name || 'Guest User'}
            </Text>
            <Text className="text-white mt-1 text-lg">
              {user.email || 'guest@example.com'}
            </Text>

            {/* Achievement Badge */}
            <View className="bg-white/20 rounded-full px-6 py-3 mt-4 border border-white/30">
              <View className="flex-row items-center">
                <Star size={16} color="#fbbf24" />
                <Text className="text-white text-sm font-semibold ml-2">
                  Adventure Explorer
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 -mt-10">
          {/* Stats Cards */}
          <View className="flex-row mb-8">
            <View className="flex-1 bg-white rounded-3xl p-6 mr-3 shadow-lg border border-gray-100">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center">
                  <MapPin size={20} color="#ea580c" />
                </View>
                <Text className="text-gray-700 text-sm ml-3 font-medium">
                  Trips
                </Text>
              </View>
              <Text className="text-3xl font-bold text-gray-800">
                {user.tripsCompleted}
              </Text>
              <Text className="text-gray-600 text-sm">Completed</Text>
            </View>

            <View className="flex-1 bg-white rounded-3xl p-6 ml-3 shadow-lg border border-gray-100">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center">
                  <Calendar size={20} color="#f97316" />
                </View>
                <Text className="text-gray-700 text-sm ml-3 font-medium">
                  Member
                </Text>
              </View>
              <Text className="text-lg font-bold text-gray-800">
                {user.memberSince || 'New'}
              </Text>
              <Text className="text-gray-600 text-sm">Since</Text>
            </View>
          </View>

          {/* Account Section */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-6">
              Account
            </Text>

            <MenuButton
              icon={Edit3}
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => navigation.navigate('EditProfile')}
            />

            <MenuButton
              icon={Settings}
              title="Settings"
              subtitle="Preferences and privacy"
              onPress={() => navigation.navigate('Settings')}
            />

            <MenuButton
              icon={Shield}
              title="Privacy & Security"
              subtitle="Manage your account security"
              onPress={() => navigation.navigate('Privacy')}
            />

            <MenuButton
              icon={Award}
              title="Achievements"
              subtitle="View your trekking milestones"
              onPress={() => navigation.navigate('Achievements')}
            />
          </View>

          {/* Action Section */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-6">
              Actions
            </Text>

            {user.id ? (
              <MenuButton
                icon={LogOut}
                title="Sign Out"
                subtitle="Log out of your account"
                onPress={handleLogout}
                bgColor="bg-red-50"
              />
            ) : (
              <MenuButton
                icon={LogIn}
                title="Sign In"
                subtitle="Access your account"
                onPress={() => navigation.navigate('Login')}
                bgColor="bg-orange-50"
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
