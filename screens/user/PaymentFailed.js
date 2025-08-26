import { View,Text } from 'lucide-react-native'
import React from 'react'

const PaymentFailed = () => {
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:20,fontWeight:'bold',color:'red'}}>Payment Failed!</Text>
    </View>
  )
}

export default PaymentFailed