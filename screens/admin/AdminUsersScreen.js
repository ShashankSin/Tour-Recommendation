import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Users,
  UserCheck,
  Sparkles,
  Crown,
} from 'lucide-react-native'

const { width } = Dimensions.get('window')

function AdminUsersScreen() {
  const [searchQuery, setSearchQuery] = useState('')

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const headerScale = useRef(new Animated.Value(0.9)).current
  const searchScale = useRef(new Animated.Value(0.95)).current
  const floatingAnim = useRef(new Animated.Value(0)).current

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
  }, [])

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      status: 'Active',
      role: 'User',
      joinDate: '2024-01-15',
      avatar: 'JD',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 987-6543',
      location: 'Los Angeles, CA',
      status: 'Active',
      role: 'Admin',
      joinDate: '2024-01-10',
      avatar: 'JS',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, IL',
      status: 'Inactive',
      role: 'User',
      joinDate: '2024-01-08',
      avatar: 'MJ',
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1 (555) 321-0987',
      location: 'Miami, FL',
      status: 'Active',
      role: 'Moderator',
      joinDate: '2024-01-12',
      avatar: 'SW',
    },
  ]

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-orange-100 text-orange-800'
      case 'Moderator':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvatarColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-orange-500'
      case 'Moderator':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const AnimatedUserCard = ({ user, index }) => {
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
          className="bg-white rounded-3xl p-6 mb-6 shadow-xl border border-orange-100"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-row flex-1">
              {/* Avatar */}
              <View className="relative mr-5">
                <View
                  className={`w-18 h-18 ${getAvatarColor(
                    user.role
                  )} rounded-2xl items-center justify-center shadow-lg`}
                >
                  <Text className="text-white font-bold text-xl">
                    {user.avatar}
                  </Text>
                </View>
                {user.role === 'Admin' && (
                  <View className="absolute -top-1 -right-1">
                    <Crown size={18} color="#fbbf24" />
                  </View>
                )}
              </View>

              {/* User Info */}
              <View className="flex-1">
                <View className="flex-row items-center mb-3">
                  <Text className="text-xl font-bold text-gray-900 mr-4">
                    {user.name}
                  </Text>
                  <View
                    className={`px-4 py-2 rounded-full ${getStatusColor(
                      user.status
                    )}`}
                  >
                    <Text className="text-sm font-semibold">{user.status}</Text>
                  </View>
                </View>

                <View
                  className={`self-start px-4 py-2 rounded-full mb-5 ${getRoleColor(
                    user.role
                  )}`}
                >
                  <Text className="text-sm font-semibold">{user.role}</Text>
                </View>

                <View className="space-y-4">
                  <View className="flex-row items-center">
                    <Mail size={18} color="#6B7280" />
                    <Text
                      className="text-gray-600 text-base ml-4"
                      numberOfLines={1}
                    >
                      {user.email}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Phone size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-base ml-4">
                      {user.phone}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-base ml-4">
                      {user.location}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-500 text-sm mt-5 font-medium">
                  Joined {user.joinDate}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity className="p-4 bg-orange-50 rounded-2xl">
              <MoreVertical size={22} color="#ea580c" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const floatingY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  })

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="flex-1 bg-orange-50">
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
              <Users size={32} color="white" />
              <Text className="text-white text-xl opacity-90 ml-4">
                User Management
              </Text>
            </View>
            <Text className="text-white text-3xl font-bold mb-2">Users</Text>
            <Text className="text-white opacity-90 text-lg">
              {filteredUsers.length} total users
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Search and Filter */}
        <Animated.View
          className="px-6 py-8 -mt-4"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: searchScale }],
          }}
        >
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl px-6 py-5 shadow-xl border border-orange-200 flex-row items-center">
              <Search size={24} color="#ea580c" />
              <TextInput
                className="flex-1 ml-4 text-gray-900 text-lg"
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <TouchableOpacity className="bg-white/95 backdrop-blur-xl rounded-3xl px-6 py-5 shadow-xl border border-orange-200">
              <Filter size={24} color="#ea580c" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Users List */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center mb-8">
            <UserCheck size={28} color="#ea580c" />
            <Text className="text-2xl font-bold text-gray-800 ml-4">
              All Users
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

          {filteredUsers.map((user, index) => (
            <AnimatedUserCard key={user.id} user={user} index={index} />
          ))}

          <View className="h-10" />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default AdminUsersScreen
