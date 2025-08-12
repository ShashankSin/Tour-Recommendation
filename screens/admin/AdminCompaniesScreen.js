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
  Building2,
  Users,
  MapPin,
  Calendar,
  Star,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native'

const { width } = Dimensions.get('window')

function AdminCompaniesScreen() {
  const [searchQuery, setSearchQuery] = useState('')

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const headerScale = useRef(new Animated.Value(0.9)).current
  const searchScale = useRef(new Animated.Value(0.95)).current
  const floatingAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
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

  const companies = [
    {
      id: 1,
      name: 'Acme Corporation',
      industry: 'Technology',
      employees: 250,
      location: 'San Francisco, CA',
      status: 'Verified',
      joinDate: '2024-01-15',
      rating: 4.8,
      logo: 'AC',
    },
    {
      id: 2,
      name: 'Tech Solutions Inc',
      industry: 'Software',
      employees: 120,
      location: 'Austin, TX',
      status: 'Pending',
      joinDate: '2024-01-20',
      rating: 4.5,
      logo: 'TS',
    },
    {
      id: 3,
      name: 'Global Dynamics',
      industry: 'Manufacturing',
      employees: 500,
      location: 'Detroit, MI',
      status: 'Verified',
      joinDate: '2024-01-10',
      rating: 4.2,
      logo: 'GD',
    },
    {
      id: 4,
      name: 'Innovation Labs',
      industry: 'Research',
      employees: 75,
      location: 'Boston, MA',
      status: 'Rejected',
      joinDate: '2024-01-18',
      rating: 3.9,
      logo: 'IL',
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIndustryColor = (industry) => {
    switch (industry) {
      case 'Technology':
        return 'bg-orange-100 text-orange-800'
      case 'Software':
        return 'bg-red-100 text-red-800'
      case 'Manufacturing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Research':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const AnimatedCompanyCard = ({ company, index }) => {
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
              {/* Company Logo */}
              <View className="w-18 h-18 bg-orange-500 rounded-2xl items-center justify-center mr-5 shadow-lg">
                <Text className="text-white font-bold text-xl">
                  {company.logo}
                </Text>
              </View>

              {/* Company Info */}
              <View className="flex-1">
                <View className="flex-row items-center mb-4">
                  <Text className="text-xl font-bold text-gray-900 mr-4">
                    {company.name}
                  </Text>
                  <View
                    className={`px-4 py-2 rounded-full ${getStatusColor(
                      company.status
                    )}`}
                  >
                    <Text className="text-sm font-semibold">
                      {company.status}
                    </Text>
                  </View>
                </View>

                <View
                  className={`self-start px-4 py-2 rounded-full mb-5 ${getIndustryColor(
                    company.industry
                  )}`}
                >
                  <Text className="text-sm font-semibold">
                    {company.industry}
                  </Text>
                </View>

                <View className="space-y-4">
                  <View className="flex-row items-center">
                    <Users size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-base ml-4">
                      {company.employees} employees
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-base ml-4">
                      {company.location}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Star size={18} color="#F59E0B" />
                    <Text className="text-gray-600 text-base ml-4">
                      {company.rating} rating
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Calendar size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-base ml-4">
                      Joined {company.joinDate}
                    </Text>
                  </View>
                </View>
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
              <Building2 size={32} color="white" />
              <Text className="text-white text-xl opacity-90 ml-4">
                Company Management
              </Text>
            </View>
            <Text className="text-white text-3xl font-bold mb-2">
              Companies
            </Text>
            <Text className="text-white opacity-90 text-lg">
              {companies.length} registered companies
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
                placeholder="Search companies..."
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

        {/* Companies List */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center mb-8">
            <TrendingUp size={28} color="#ea580c" />
            <Text className="text-2xl font-bold text-gray-800 ml-4">
              All Companies
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

          {companies.map((company, index) => (
            <AnimatedCompanyCard
              key={company.id}
              company={company}
              index={index}
            />
          ))}

          <View className="h-10" />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default AdminCompaniesScreen
