import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../../context/AuthContext'
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function LoginScreen({ route, navigation }) {
  const { userType = 'user' } = route.params || {}
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    let isValid = true
    setError('')
    setEmailError('')
    setPasswordError('')

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
    }

    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://10.0.2.2:5000/api/auth/loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        //! Use the login function from AuthContext
        await login(data.token, userType, {
          id: data.userId,
          name: data.name,
          email: data.email,
          role: userType,
        })
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      if (error) Alert.alert('Login Failed', error)
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
              {userType === 'company' ? 'Company Login' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {userType === 'company'
                ? 'Sign in to manage your treks'
                : 'Sign in to continue your adventure'}
            </Text>
          </View>

          <View style={styles.form}>
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

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <Text>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup', { userType })}
              >
                <Text
                  style={{ color: '#f97316', marginTop: 4, fontWeight: '600' }}
                >
                  Sign Up
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
    justifyContent: 'center',
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

export default LoginScreen
