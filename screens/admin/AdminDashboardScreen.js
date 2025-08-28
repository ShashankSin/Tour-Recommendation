import { useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CommonActions } from '@react-navigation/native'
import { useAuth } from '../../context/AuthContext'
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  LogOut,
  Settings,
  Bell,
  Crown,
} from 'lucide-react-native'


function AdminDashboardScreen({ navigation }) {
  const { logout } = useAuth()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const headerScale = useRef(new Animated.Value(0.9)).current
  const statsSlide = useRef(new Animated.Value(100)).current
  const floatingAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Example: Fetch admins from SQLite
    const fetchLocalAdmins = async () => {
      const admins = await getAdmins();
      // You can use admins[0] or set state as needed
    };
    fetchLocalAdmins();
    // Animation logic
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
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(statsSlide, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  


  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      iconColor: '#ea580c',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Companies',
      value: '156',
      change: '+8%',
      icon: Building2,
      iconColor: '#dc2626',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+23%',
      icon: DollarSign,
      iconColor: '#f59e0b',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Growth',
      value: '18.2%',
      change: '+5%',
      icon: TrendingUp,
      iconColor: '#ec4899',
      bgColor: 'bg-pink-100',
    },
  ]


  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
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
            Alert.alert('Error', 'Failed to logout. Please try again.')
          }
        },
      },
    ])
  }

  const AnimatedStatCard = ({ stat, index }) => {
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
        toValue: 0.95,
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
        className="w-1/2 px-3 mb-6"
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
          className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="w-16 h-16 bg-orange-50 rounded-2xl items-center justify-center shadow-lg">
              <stat.icon size={28} color={stat.iconColor} />
            </View>
            <View className={`px-4 py-2 ${stat.bgColor} rounded-full`}>
              <Text className="text-orange-700 text-sm font-bold">
                {stat.change}
              </Text>
            </View>
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {stat.value}
          </Text>
          <Text className="text-gray-600 text-lg font-medium">
            {stat.title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const AnimatedActivityItem = ({ activity, index }) => {
    const itemAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start()
    }, [])

    const getActivityIcon = (type) => {
      switch (type) {
        case 'user':
          return Users
        case 'company':
          return Building2
        case 'payment':
          return DollarSign
        default:
          return Activity
      }
    }

    const getActivityColor = (type) => {
      switch (type) {
        case 'user':
          return { bg: 'bg-orange-100', icon: '#ea580c' }
        case 'company':
          return { bg: 'bg-red-100', icon: '#dc2626' }
        case 'payment':
          return { bg: 'bg-yellow-100', icon: '#f59e0b' }
        default:
          return { bg: 'bg-gray-100', icon: '#6b7280' }
      }
    }

    const ActivityIcon = getActivityIcon(activity.type)
    const colors = getActivityColor(activity.type)

  }

  const floatingY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  })

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="flex-1 bg-orange-50">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Animated Header */}
          <Animated.View
            className="bg-orange-500 px-6 pt-8 pb-12 rounded-b-[40px] shadow-2xl"
            style={{
              opacity: fadeAnim,
              transform: [{ scale: headerScale }],
            }}
          >
            {/* Floating Elements */}
            <Animated.View
              className="absolute top-16 right-8 w-5 h-5 bg-white/30 rounded-full"
              style={{ transform: [{ translateY: floatingY }] }}
            />
            <Animated.View
              className="absolute top-32 left-8 w-4 h-4 bg-yellow-300/40 rounded-full"
              style={{ transform: [{ translateY: floatingY }] }}
            />

            <View className="flex-row items-center justify-between">
              <Animated.View
                className="flex-1"
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Crown size={32} color="#fbbf24" />
                  <Text className="text-white text-xl opacity-90 ml-4">
                    Admin Portal
                  </Text>
                </View>
                <Text className="text-white text-3xl font-bold mb-2">
                  Dashboard
                </Text>
                <Text className="text-white opacity-90 text-lg">
                  Welcome back, Admin
                </Text>
              </Animated.View>

              {/* Header Actions */}
              <View className="flex-row space-x-4">
                <TouchableOpacity className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl items-center justify-center mr-3">
                  <Bell size={26} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl items-center justify-center mr-3">
                  <Settings size={26} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl items-center justify-center"
                  onPress={handleLogout}
                >
                  <LogOut size={26} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <View className="px-6 py-8 -mt-6">
            <Animated.Text
              className="text-2xl font-bold text-gray-900 mb-8"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              Overview
            </Animated.Text>
            <View className="flex-row flex-wrap -mx-3">
              {stats.map((stat, index) => (
                <AnimatedStatCard key={index} stat={stat} index={index} />
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <Animated.View
            className="px-6 pb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: statsSlide }],
            }}
          >
            <Text className="text-2xl font-bold text-gray-900 mb-8">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap justify-between">
              <TouchableOpacity
                className="flex bg-orange-500 rounded-3xl p-5 items-center shadow-xl"
                onPress={() => navigation?.navigate('Users')}
              >
                <View className="p-4 bg-white/20 rounded-2xl items-center justify-center mb-6">
                  <Users size={32} color="white" />
                </View>
                <Text className="text-white font-bold text-xl mb-2">
                  Manage Users
                </Text>
                <Text className="text-white/80 text-base text-center">
                  View all users
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex bg-red-500 rounded-3xl p-8 items-center shadow-xl"
                onPress={() => navigation?.navigate('Companies')}
              >
                <View className="p-4 bg-white/20 rounded-2xl items-center justify-center mb-6">
                  <Building2 size={32} color="white" />
                </View>
                <Text className="text-white font-bold text-xl mb-2">
                  View Companies
                </Text>
                <Text className="text-white/80 text-base text-center">
                  Manage companies
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Recent Activity */}
          <Animated.View
            className="px-6 pb-10"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: statsSlide }],
            }}
          >
            
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )

}
export default AdminDashboardScreen
