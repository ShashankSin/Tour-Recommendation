import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import {
  Building2,
  Mail,
  Lock,
  Phone,
  Globe,
  User,
  Eye,
  EyeOff,
} from 'lucide-react-native'

const CompanySignupScreen = ({ navigation }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(
        'http://10.0.2.2:5000/api/auth/company/register',
        {
          name,
          email,
          password,
          phone,
          website,
        }
      )

      console.log('Signup response:', response.data)

      const userId =
        response.data.userId || response.data.user?._id || response.data._id
      const companyId = response.data.companyId || response.data._id

      navigation.navigate('VerifyOtp', {
        userId,
        email,
        userType: 'company',
        companyId,
      })
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const InputField = ({
    icon: Icon,
    label,
    placeholder,
    value,
    onChangeText,
    required = false,
    ...props
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      <View style={styles.inputWrapper}>
        <Icon size={20} color="#f97316" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {label.includes('Password') && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Building2 size={40} color="#f97316" />
          </View>
          <Text style={styles.title}>Company Registration</Text>
          <Text style={styles.subtitle}>Create your company account</Text>
        </View>

        <View style={styles.form}>
          <InputField
            icon={User}
            label="Company Name"
            placeholder="Enter company name"
            value={name}
            onChangeText={setName}
            required
          />

          <InputField
            icon={Mail}
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          <InputField
            icon={Lock}
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            required
          />

          <InputField
            icon={Phone}
            label="Phone Number"
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <InputField
            icon={Globe}
            label="Website"
            placeholder="Enter website URL"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
          />

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CompanyLogin')}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f97316',
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#f97316',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  termsContainer: {
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  termsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#f97316',
    fontWeight: '600',
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
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6b7280',
    fontSize: 16,
  },
  loginLink: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 4,
  },
})

export default CompanySignupScreen
