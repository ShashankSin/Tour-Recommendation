import React, { useRef } from "react";
import { WebView } from "react-native-webview";
import {ActivityIndicator, Alert } from "react-native";
import {jwtDecode} from 'jwt-decode';
import axios from "axios";

const KhaltiPaymentWebView = ({ route, navigation }) => {
  const { paymentUrl, token } = route.params; 
    const decoded = jwtDecode(token);
    const verified=useRef(false);

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;
    if (url.includes("/api/payment/verify")) {
      if(verified.current) return; // Prevent multiple calls   
        verified.current=true;
      const pidxMatch = url.match(/[?&]pidx=([^&]+)/);
      const pidx = pidxMatch ? pidxMatch[1] : null;
      if (!pidx) {
            Alert.alert("Payment Error")
            navigation.goBack()
            return
      }
        try{
            const response= await axios.post('http://10.0.2.2:5000/api/payment/verify',{
                pidx,
                bookingId:decoded.bookingId
            })
            if(response.data.success){
                navigation.replace("PaymentSuccess",{
                    bookingId:decoded.bookingId,
                    booking:response.data.booking
                });
            }else{
                Alert.alert("Payment Failed","Your payment could not be verified.");
                navigation.replace("PaymentFailure");

            }
        }catch (error) {
            console.error("Error verifying payment:", error);
            Alert.alert("Payment Verification Failed", "There was an error verifying your payment. Please try again.");
            navigation.goBack();   
        }

  }
}
  return (
    <WebView
      source={{ uri: paymentUrl }}
      startInLoadingState={true}
      renderLoading={()=>
        <ActivityIndicator
          color="#009b88"
          size="large"
        />
      }
      onNavigationStateChange={handleNavigationStateChange}
    />
  );
}

export default KhaltiPaymentWebView;