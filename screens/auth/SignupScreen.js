import { useState, useEffect } from 'react'
// 1. Import SQLite service functions
import { createTables, getUsers, insertUser, initDb } from '../../services/sqliteService';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SQLite from 'expo-sqlite'

export default function SignupScreen({ route, navigation }) {
  const [userType, setUserType] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  useEffect(() => {
    async function setupDatabase() {
      await initDb();
      await createTables();
      const users = await getUsers();
      console.log('SQLite Users:', users);
    }
    setupDatabase();
    const fetchLocalUsers = async () => {
      const users = await getUsers();
    };
    fetchLocalUsers();
    if (route?.params?.userType) {
      setUserType(route.params.userType)
      AsyncStorage.setItem('userType', route.params.userType)
        .then(() => console.log('Stored userType:', route.params.userType))
        .catch((err) => console.error('Failed to store userType:', err))
    }
  }, [route?.params?.userType])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password) => {
    //! At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    return passwordRegex.test(password)
  }

  const validateName = (name) => {
    return name.length >= 2 && /^[a-zA-Z\s]*$/.test(name)
  }

  const validateForm = () => {
    let isValid = true
    setError('')
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')

    //! Validate name
    if (!name) {
      setNameError('Name is required')
      isValid = false
    } else if (!validateName(name)) {
      setNameError('Name should only contain letters and spaces')
      isValid = false
    }

    //! Validate email
    if (!email) {
      setEmailError('Email is required')
      isValid = false
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      isValid = false
    }

    //! Validate password
    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (!validatePassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
      )
      isValid = false
    }

    //! Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password')
      isValid = false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      isValid = false
    }

    return isValid
  }

  const handleSignup = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://10.0.2.2:5000/api/auth/registerUser',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, userType }),
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        Alert.alert(
          'Signup Success',
          'Check your email for a verification OTP.'
        )
        await insertUser({ name, email, password, role: userType }, data.otp);;
        navigation.navigate('VerifyOtp', {
          userId: data.userId,
          email,
          userType,
        })
        
      } else {
        setError(data.message || 'Failed to register')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      if (error) Alert.alert('Signup Failed', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/ebc_tk_adventure_2-1624450765.jpeg')}
              style={styles.logo}
            />
            <Text style={styles.title}>
              {userType === 'company'
                ? 'Register Your Company'
                : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {userType === 'company'
                ? 'Sign up to start offering trekking experiences'
                : 'Sign up to discover amazing treks'}
            </Text>
          </View>

          <View style={styles.form}>
            <View>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                placeholder={
                  userType === 'company' ? 'Company Name' : 'Full Name'
                }
                value={name}
                onChangeText={(text) => {
                  setName(text)
                  setNameError('')
                }}
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
            </View>

            <View>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  setEmailError('')
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <View>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  setPasswordError('')
                }}
                secureTextEntry
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <View>
              <TextInput
                style={[
                  styles.input,
                  confirmPasswordError ? styles.inputError : null,
                ]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  setConfirmPasswordError('')
                }}
                secureTextEntry
              />
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <Text>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login', { userType })}
              >
                <Text
                  style={{ color: '#f97316', marginTop: 4, fontWeight: '600' }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    marginTop: 12,
    color: '#ef4444',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
})
