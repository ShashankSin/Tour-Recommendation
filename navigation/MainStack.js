import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";

import UserTabs from "./UserTabs";
import CompanyTabs from "./CompanyTabs";
import AdminTabs from "./AdminTabs";

// User Screens
import ItineraryDetailScreen from "../screens/user/ItineraryDetailScreen";
import BookingScreen from "../screens/user/BookingScreen";
import PaymentScreen from "../screens/user/PaymentScreen";
import BudgetPlannerScreen from "../screens/user/BudgetPlannerScreen";
import MyBookingsScreen from "../screens/user/MyBookingsScreen";
import BookingDetailScreen from "../screens/user/BookingDetailsScreen";
import EsewaPaymentWebView from "../screens/user/EsewaPaymentWebView";
import KhaltiPaymentWebView from "../screens/user/KhaltiPaymentWebView";
import PaymentSuccess from "../screens/user/PaymentSuccess";
import PaymentFailed from "../screens/user/PaymentFailed";

// Company Screens
import CreateItineraryScreen from "../screens/company/CreateItineraryScreen";
import EditItineraryScreen from "../screens/company/EditItineraryScreen";

const Stack = createNativeStackNavigator();

const TabNavigatorWrapper = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "company":
      return <CompanyTabs />;
    case "admin":
      return <AdminTabs />;
    case "user":
    default:
      return <UserTabs />;
  }
};

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TabNavigator" component={TabNavigatorWrapper} />
    <Stack.Screen name="ItineraryDetail" component={ItineraryDetailScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="BudgetPlanner" component={BudgetPlannerScreen} />
    <Stack.Screen name="CreateItinerary" component={CreateItineraryScreen} />
    <Stack.Screen name="EditItinerary" component={EditItineraryScreen} />
    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
    <Stack.Screen name="EsewaPaymentWebView" component={EsewaPaymentWebView} />
    <Stack.Screen name="KhaltiPaymentWebView" component={KhaltiPaymentWebView} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
    <Stack.Screen name="PaymentFailure" component={PaymentFailed} />
  </Stack.Navigator>
);

export default MainStack;
