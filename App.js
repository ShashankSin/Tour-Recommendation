import React from 'react'
import { NavigationContainer, CommonActions } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RootNavigator from './navigation/AppNavigator'
import { AuthProvider } from './context/AuthContext'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {jwtDecode} from 'jwt-decode'
import './global.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const navigationRef = React.createRef()

// 🔹 Handle token expiration: clear storage + reset navigation
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

// 🔹 Axios global config
axios.defaults.baseURL = 'http://10.0.2.2:5000/api'
axios.defaults.timeout = 10000
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 🔹 Request interceptor → attach token
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
  (error) => Promise.reject(error)
)

// 🔹 Response interceptor → catch 401 and network errors
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

// 🔹 TanStack Query client with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // retry once if failed
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 min fresh data
      onError: (error) => {
        console.error('Query Error:', error.message)
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation Error:', error.message)
      },
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef}>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </SafeAreaProvider>
        </AuthProvider>
      </NavigationContainer>
    </QueryClientProvider>
  )
}
