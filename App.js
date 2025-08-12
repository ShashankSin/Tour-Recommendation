import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RootNavigator from './navigation/AppNavigator'
import { AuthProvider } from './context/AuthContext'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import { CommonActions } from '@react-navigation/native'
import './global.css'

export const navigationRef = React.createRef()

const handleTokenExpiration = async () => {
  await AsyncStorage.removeItem('token')
  if (navigationRef.current) {
    navigationRef.current.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'UserType' } }],
      })
    )
  }
}

axios.defaults.baseURL = 'http://192.168.1.69:5000/api'
axios.defaults.timeout = 10000
axios.defaults.headers.common['Content-Type'] = 'application/json'

axios.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000

        if (decoded.exp && decoded.exp < currentTime) {
          await handleTokenExpiration()
          throw new Error('Token expired')
        }

        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    } catch (error) {
      return Promise.reject(error)
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error('Network Error:', error)
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection.')
      }
      throw new Error('Network error. Please check your connection.')
    }

    if (error.response?.status === 401) {
      await handleTokenExpiration()
    }

    return Promise.reject(error)
  }
)

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </NavigationContainer>
  )
}
