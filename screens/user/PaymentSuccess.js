import axios from 'axios';
import React, {useState,useEffect} from 'react'
import { View, Text,SafeAreaView } from 'react-native'
const PaymentSuccess = ({route,navigation}) => {
  const {bookingId,booking} = route.params || {}
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
      setIsLoading(false);
      // const FetchBookingDetails=async()=>{
      //     try{
      //         const response=await axios.get(`http://10.0.2.2:5000/api/booking/user/${bookingId}`);
      //         if(response.data.success){
      //             console.log("Fetched Booking Details:", response.data.bookings);
      //         }else{
      //             console.log("Failed to fetch booking details");
      //         }
      //     }catch(error){
      //         console.error("Error fetching booking details:",error);
      //     }finally{
      //         setIsLoading(false);
      //     }
      //   }  
      //   fetchBookingDetails();
    },bookingId);
  console.log("Payment Success Screen - Booking ID:", bookingId); // Debugging log
  console.log("Payment Success Screen - Booking Details:", booking); // Debugging log
  return (
    <SafeAreaView className='flex-1 justify-center items-center p-4 bg-white'>
      <Text style={{fontSize:24,fontWeight:'bold',color:'green'}}>Payment Successful!</Text>
      <Text style={{fontSize:18,marginTop:10}}>Booking ID: {bookingId}</Text>
      <Text style={{fontSize:16,marginTop:10}}>Thank you for your payment. Your booking has been confirmed.</Text>
    </SafeAreaView>
  )
}

export default PaymentSuccess