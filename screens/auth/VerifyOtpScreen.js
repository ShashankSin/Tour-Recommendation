import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'

export default function VerifyOtpScreen({ route, navigation }) {
  const { userId, email, userType, companyId } = route.params || {}
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP')
      return
    }

    if (!userId) {
      Alert.alert('Error', 'Missing user information')
      return
    }

    setLoading(true)
    try {
      //! Determine the verification endpoint based on user type
      const endpoint =
        userType === 'company'
          ? 'http://10.0.2.2:5000/api/auth/company/verify-account'
          : 'http://10.0.2.2:5000/api/auth/verify-account'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userType === 'company' ? companyId || userId : userId,
          otp: otp.trim(),
          userType,
        }),
      })

      const data = await response.json()
      console.log('Verification response:', data)

      if (response.ok && data.success) {
        Alert.alert(
          'Success',
          data.message || 'Your account has been verified!'
        )

        //! Handle navigation based on user type
        if (data.role === 'company' || userType === 'company') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'CompanyTabs' }],
          })
        } else if (data.role === 'admin') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminTabs' }],
          })
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserTabs' }],
          })
        }
      } else if (data.message?.includes('already verified')) {
        Alert.alert('Already Verified', 'Please login to access your account.')
        navigation.navigate(userType === 'company' ? 'CompanyLogin' : 'Login')
      } else {
        Alert.alert('Verification Failed', data.message || 'Try again later.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      const endpoint =
        userType === 'company'
          ? 'http://10.0.2.2:5000/api/auth/company/resend-otp'
          : 'http://10.0.2.2:5000/api/auth/resend-otp'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userType === 'company' ? companyId || userId : userId,
          email,
        }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        Alert.alert('Success', 'New OTP has been sent to your email!')
      } else {
        Alert.alert('Error', data.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      Alert.alert('Error', 'Failed to resend OTP')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Account</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendOtp}
        disabled={loading}
      >
        <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    width: '100%',
    padding: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  resendButton: {
    alignSelf: 'center',
  },
  resendText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
})
