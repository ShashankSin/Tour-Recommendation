//! RootNavigator.js
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'

//! Auth Screens
import LoginScreen from '../screens/auth/LoginScreen'
import SignupScreen from '../screens/auth/SignupScreen'
import UserTypeScreen from '../screens/auth/UserTypeScreen'
import AdminLoginScreen from '../screens/auth/AdminLoginScreen'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen'
import CompanyLoginScreen from '../screens/auth/CompanyLoginScreen'
import CompanySignupScreen from '../screens/auth/CompanySignupScreen'

//! User Screens
import HomeScreen from '../screens/user/HomeScreen'
import ExploreScreen from '../screens/user/ExploreScreen'
import WishlistScreen from '../screens/user/WishlistScreen'
import ProfileScreen from '../screens/user/ProfileScreen'
import ItineraryDetailScreen from '../screens/user/ItineraryDetailScreen'
import BookingScreen from '../screens/user/BookingScreen'
import PaymentScreen from '../screens/user/PaymentScreen'
import BudgetPlannerScreen from '../screens/user/BudgetPlannerScreen'
import MyBookingsScreen from '../screens/user/MyBookingsScreen'
import BookingDetailScreen from '../screens/user/BookingDetailsScreen'

//! Company Screens
import CompanyDashboardScreen from '../screens/company/CompanyDashboardScreen'
import CompanyItinerariesScreen from '../screens/company/CompanyItinerariesScreen'
import CompanyBookingsScreen from '../screens/company/CompanyBookingsScreen'
import CompanyProfileScreen from '../screens/company/CompanyProfileScreen'
import CreateItineraryScreen from '../screens/company/CreateItineraryScreen'
import EditItineraryScreen from '../screens/company/EditItineraryScreen'

//! Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen'
import AdminCompaniesScreen from '../screens/admin/AdminCompaniesScreen'
import AdminUsersScreen from '../screens/admin/AdminUsersScreen'
import AdminItinerariesScreen from '../screens/admin/AdminItinerariesScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const UserBottomTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Explore: focused ? 'search' : 'search-outline',
          Wishlist: focused ? 'heart' : 'heart-outline',
          MyBookings: focused ? 'calendar' : 'calendar-outline',
          Profile: focused ? 'person' : 'person-outline',
        }
        return <Ionicons name={icons[route.name]} size={size} color={color} />
      },
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Explore" component={ExploreScreen} />
    <Tab.Screen name="Wishlist" component={WishlistScreen} />
    <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
)

const CompanyBottomTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Dashboard: focused ? 'speedometer' : 'speedometer-outline',
          Itineraries: focused ? 'reader' : 'reader-outline',
          Bookings: focused ? 'clipboard' : 'clipboard-outline',
          Profile: focused ? 'person' : 'person-outline',
        }
        return <Ionicons name={icons[route.name]} size={size} color={color} />
      },
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard" component={CompanyDashboardScreen} />
    <Tab.Screen name="Itineraries" component={CompanyItinerariesScreen} />
    <Tab.Screen name="Bookings" component={CompanyBookingsScreen} />
    <Tab.Screen name="Profile" component={CompanyProfileScreen} />
  </Tab.Navigator>
)

const AdminBottomTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Dashboard: focused ? 'grid' : 'grid-outline',
          Companies: focused ? 'business' : 'business-outline',
          Users: focused ? 'people' : 'people-outline',
          Itineraries: focused ? 'map' : 'map-outline',
        }
        return <Ionicons name={icons[route.name]} size={size} color={color} />
      },
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
    <Tab.Screen name="Companies" component={AdminCompaniesScreen} />
    <Tab.Screen name="Users" component={AdminUsersScreen} />
    <Tab.Screen name="Itineraries" component={AdminItinerariesScreen} />
  </Tab.Navigator>
)

const TabNavigatorWrapper = () => {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case 'company':
      return <CompanyBottomTabs />
    case 'admin':
      return <AdminBottomTabs />
    case 'user':
    default:
      return <UserBottomTabs />
  }
}

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TabNavigator" component={TabNavigatorWrapper} />
    <Stack.Screen name="ItineraryDetail" component={ItineraryDetailScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="BudgetPlanner" component={BudgetPlannerScreen} />
    <Stack.Screen name="CreateItinerary" component={CreateItineraryScreen} />
    <Stack.Screen name="EditItinerary" component={EditItineraryScreen} />
    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
  </Stack.Navigator>
)

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="UserType" component={UserTypeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="CompanyLogin" component={CompanyLoginScreen} />
    <Stack.Screen name="CompanySignup" component={CompanySignupScreen} />
    <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
)

const RootNavigator = () => {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <Stack.Screen name="Main" component={MainStack} />
      )}
    </Stack.Navigator>
  )
}

export default RootNavigator
