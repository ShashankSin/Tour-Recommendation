import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
function PaymentScreen({ navigation, route }) {
  const [selectedMethod, setSelectedMethod] = useState('khalti')
  const [isLoading, setIsLoading] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [loadingBooking, setLoadingBooking] = useState(true)

  // Get data from route params
  const { bookingId, amount, userId, token } = route.params || {}

  const paymentMethods = [
    {
      id: 'khalti',
      name: 'Khalti',
      icon: 'card-outline',
      color: '#5C2D91',
      description: 'Pay with Khalti Digital Wallet',
    },
    {
      id: 'esewa',
      name: 'eSewa',
      icon: 'wallet-outline',
      color: '#60BB46',
      description: 'Pay with eSewa Digital Wallet',
    },
  ]

  //! Fetch booking details from backend
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if(!bookingId || !token) {
        setLoadingBooking(false)
        return
      }

      try {
        const response = await axios.get(
          `http://10.0.2.2:5000/api/booking/user/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )


        if (response.data.success) {
          setBookingData(response.data.booking)
        } else {
        }
      } catch (error) {
        console.error(' Error fetching booking details:', error)
        console.error(' Error response:', error.response?.data)
        Alert.alert('Error', 'Failed to load booking details')
      } finally {
        setLoadingBooking(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId, token])

  const handleKhaltiPayment = async (userId, amount, bookingId, navigation) => {
  setIsLoading(true)

  try {
    // Step 1: Call backend to initiate payment
    const response = await axios.post('http://10.0.2.2:5000/api/payment/initiate', {
      userId,
      amount,
      bookingId,
    })

    if (response.data.success) {
      const { payment, token } = response.data

      const khaltiUrl = payment.payment_url || null

      if (!khaltiUrl) {
        Alert.alert('Payment Error', 'No payment URL returned from backend')
        setIsLoading(false)
        return
      }

      // Open Khalti URL in WebView or browser
      navigation.navigate('KhaltiPaymentWebView', { paymentUrl: khaltiUrl, token })
    } else {
      Alert.alert('Payment Error', response.data.message || 'Failed to initiate payment')
    }
  } catch (error) {
    console.error('Error initiating Khalti payment:', error.response?.data || error.message)
    Alert.alert('Payment Error', 'Failed to initiate Khalti payment')
  } finally {
    setIsLoading(false)
  }
  }

  const handleEsewaPayment = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('http://10.0.2.2:5000/api/payment/Esewa', {
      userId,
      amount,
      bookingId,
      paymentMethod:'esewa',
    })
    if(response.data.success){
      const { esewaUrl,paymentData } = response.data
      // Open in browser
      navigation.navigate('EsewaPaymentWebView', { esewaUrl, paymentData})
    }
      setIsLoading(false)
    } catch (error) {
      Alert.alert('Payment Error', 'Failed to process eSewa payment')
      setIsLoading(false)
    }
  }

  const handlePayment = () => {
    if (selectedMethod === 'khalti') {
      handleKhaltiPayment(userId, amount, bookingId, navigation)
    } else if (selectedMethod === 'esewa') {
      handleEsewaPayment(userId, amount, bookingId,'esewa', navigation)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loadingBooking) {
    return (
      <SafeAreaView className="flex-1 bg-orange-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="mt-4 text-gray-600">Loading booking details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="px-4 py-6 bg-orange-500">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white ml-4">Payment</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Booking Summary */}
        <View className="m-4 p-4 bg-white rounded-xl shadow">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Booking Summary
          </Text>

          {bookingData ? (
            <>
              <View className="mb-3">
                <Text className="text-gray-600 text-sm">Booking ID</Text>
                <Text className="text-gray-800 font-medium">
                  {bookingData._id}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-gray-600 text-sm">Customer Name</Text>
                <Text className="text-gray-800 font-medium">
                  {bookingData.customerName}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-gray-600 text-sm">Email</Text>
                <Text className="text-gray-800 font-medium">
                  {bookingData.customerEmail}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-gray-600 text-sm">Phone</Text>
                <Text className="text-gray-800 font-medium">
                  {bookingData.customerPhone || 'N/A'}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-gray-600 text-sm">Trip Dates</Text>
                <Text className="text-gray-800 font-medium">
                  {formatDate(bookingData.startDate)} -{' '}
                  {formatDate(bookingData.endDate)}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-gray-600 text-sm">Participants</Text>
                <Text className="text-gray-800 font-medium">
                  {bookingData.participants} people
                </Text>
              </View>

              {bookingData.specialRequests && (
                <View className="mb-3">
                  <Text className="text-gray-600 text-sm">
                    Special Requests
                  </Text>
                  <Text className="text-gray-800 font-medium">
                    {bookingData.specialRequests}
                  </Text>
                </View>
              )}

              <View className="border-t border-gray-100 my-3" />

              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Base Price</Text>
                <Text className="text-gray-800">
                  NPR {bookingData.totalPrice}
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Service Fee</Text>
                <Text className="text-gray-800">NPR 0</Text>
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="font-bold text-gray-800">Total Amount</Text>
                <Text className="font-bold text-orange-500">
                  NPR {bookingData.totalPrice}
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Total Amount</Text>
              <Text className="text-gray-800">NPR {amount || 0}</Text>
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Select Payment Method
          </Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row items-center p-4 mb-3 rounded-lg border ${
                selectedMethod === method.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  selectedMethod === method.id ? 'bg-orange-100' : 'bg-gray-100'
                }`}
                style={{
                  backgroundColor:
                    selectedMethod === method.id
                      ? method.color + '20'
                      : '#f3f4f6',
                }}
              >
                <Ionicons
                  name={method.icon}
                  size={24}
                  color={
                    selectedMethod === method.id ? method.color : '#6b7280'
                  }
                />
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className={`font-bold text-lg ${
                    selectedMethod === method.id
                      ? 'text-orange-500'
                      : 'text-gray-800'
                  }`}
                >
                  {method.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {method.description}
                </Text>
              </View>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color="#f97316" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method Details */}
        {selectedMethod === 'khalti' && (
          <View className="mx-4 mb-6 p-4 bg-white rounded-xl shadow">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Khalti Payment Details
            </Text>

            <View className="bg-purple-50 p-3 rounded-lg mb-3">
              <Text className="text-purple-800 text-sm">
                • Fast and secure digital payments
              </Text>
              <Text className="text-purple-800 text-sm">
                • Instant payment confirmation
              </Text>
              <Text className="text-purple-800 text-sm">
                • No additional fees
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={16} color="#5C2D91" />
              <Text className="ml-2 text-purple-700 text-sm">
                Secure payment powered by Khalti
              </Text>
            </View>
          </View>
        )}

        {selectedMethod === 'esewa' && (
          <View className="mx-4 mb-6 p-4 bg-white rounded-xl shadow">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              eSewa Payment Details
            </Text>

            <View className="bg-green-50 p-3 rounded-lg mb-3">
              <Text className="text-green-800 text-sm">
                • Nepal's leading digital wallet
              </Text>
              <Text className="text-green-800 text-sm">
                • Instant payment processing
              </Text>
              <Text className="text-green-800 text-sm">
                • Secure and reliable
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={16} color="#60BB46" />
              <Text className="ml-2 text-green-700 text-sm">
                Secure payment powered by eSewa
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className={`py-4 rounded-lg items-center ${
            isLoading ? 'bg-gray-400' : 'bg-orange-500'
          }`}
          onPress={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Processing...
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg">
              Pay NPR {bookingData?.totalPrice || amount || 0}
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-center text-gray-500 text-xs mt-2">
          By proceeding, you agree to our terms and conditions
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default PaymentScreen
