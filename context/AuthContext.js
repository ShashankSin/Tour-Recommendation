import React, { createContext, useState, useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { navigationRef } from '../App'
import { CommonActions } from '@react-navigation/native'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const handleTokenExpiration = async () => {
    await AsyncStorage.removeItem('token')
    setUser(null)
    if (navigationRef.current) {
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'UserType' } }],
        })
      )
    }
  }

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000

        if (decoded.exp && decoded.exp < currentTime) {
          await handleTokenExpiration()
        } else {
          setUser(decoded)
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error)
      await handleTokenExpiration()
    } finally {
      setLoading(false)
    }
  }

  const login = async (token, userType, userData) => {
    try {
      await AsyncStorage.setItem('token', token)
      const decoded = jwtDecode(token)
      setUser({ ...decoded, userType, ...userData })
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await handleTokenExpiration()
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthState,
  }

  if (loading) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
