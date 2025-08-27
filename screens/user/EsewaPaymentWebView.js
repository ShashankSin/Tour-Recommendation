import React, { useRef } from "react";
import { WebView } from "react-native-webview";
import { View, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import { decode as atob } from "base-64";

function EsewaPaymentWebView({ route, navigation }) {
  const { esewaUrl, paymentData, token, bookingId } = route.params;
  const verified = useRef(false);
  const decoded = jwtDecode(token);

  const htmlForm = `
    <html>
      <body onload="document.forms[0].submit()">
        <form action="${esewaUrl}" method="POST">
          ${Object.entries(paymentData)
            .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
            .join("")}
        </form>
      </body>
    </html>
  `;

  const handlePaymentVerification = async (url) => {
    if (verified.current) return;
    verified.current = true;

    try {
      const queryString = url.split("?")[1];
      const urlParams = new URLSearchParams(queryString);

      const encodedData = urlParams.get("data"); // key is 'data'
      if (!encodedData) {
        console.error("Payment data missing");
        return;
      }

      // Decode base64
      const decodedString = atob(encodedData);
      console.log("Decoded Payment Data:", decodedString);
      const paymentData = JSON.parse(decodedString);
      console.log("Parsed Payment Data:", paymentData);

      const transaction_uuid = paymentData.transaction_uuid;
      console.log("Transaction UUID:", transaction_uuid);
      if (!transaction_uuid) throw new Error("transaction_uuid not found in response");

      // Send to backend for verification
      const response = await axios.post("http://10.0.2.2:5000/api/payment/verifyEsewa", {
        bookingId,
        transaction_uuid,
        paymentData,
      });

      if (response?.data?.success) {
        navigation.replace("PaymentSuccess", {
          bookingId,
          booking: response.data.booking,
        });
      } else {
        Alert.alert("Payment Failed", "Your payment could not be verified.");
        navigation.replace("PaymentFailure");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      Alert.alert(
        "Payment Verification Failed",
        "There was an error verifying your payment. Please try again."
      );
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlForm }}
          startInLoadingState
          onShouldStartLoadWithRequest={(request) => {
            // Intercept success/failure URLs
            if (
              request.url.includes("/api/payment/verifyEsewa") ||
              request.url.includes("/api/payment/failureEsewa")
            ) {
              handlePaymentVerification(request.url);
              return false; // prevent WebView from navigating
            }
            return true; // allow other URLs
          }}
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default EsewaPaymentWebView;
