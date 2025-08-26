import React from "react";
import { WebView } from "react-native-webview";
import { View, ActivityIndicator,SafeAreaView } from "react-native";

function EsewaPaymentWebView({ route }) {
  const { esewaUrl, paymentData } = route.params;
  console.log('eSewa Payment Data:', paymentData); // Debugging line
  const htmlForm = `
    <html>
      <body onload="document.forms[0].submit()">
        <form action="${esewaUrl}" method="POST">
          ${Object.entries(paymentData).map(
            ([key, value]) => `<input type="hidden" name="${key}" value="${paymentData[key]}" />`
          ).join('')}
        </form>
      </body>
    </html>
  `;

  return (
    <SafeAreaView className="flex-1">
      <View className="px-6 py-8 flex-1">
        <WebView
        originWhitelist={['*']}
        source={{ html: htmlForm }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      />
      </View>
    </SafeAreaView>
  );
}
export default EsewaPaymentWebView;