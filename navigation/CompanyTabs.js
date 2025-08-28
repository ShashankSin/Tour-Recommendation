import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Company Screens
import CompanyDashboardScreen from "../screens/company/CompanyDashboardScreen";
import CompanyItinerariesScreen from "../screens/company/CompanyItinerariesScreen";
import CompanyBookingsScreen from "../screens/company/CompanyBookingsScreen";
import CompanyProfileScreen from "../screens/company/CompanyProfileScreen";

const Tab = createBottomTabNavigator();

const CompanyTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Dashboard: focused ? "speedometer" : "speedometer-outline",
          Itineraries: focused ? "reader" : "reader-outline",
          Bookings: focused ? "clipboard" : "clipboard-outline",
          Profile: focused ? "person" : "person-outline",
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#10b981",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Dashboard" component={CompanyDashboardScreen} />
    <Tab.Screen name="Itineraries" component={CompanyItinerariesScreen} />
    <Tab.Screen name="Bookings" component={CompanyBookingsScreen} />
    <Tab.Screen name="Profile" component={CompanyProfileScreen} />
  </Tab.Navigator>
);

export default CompanyTabs;
