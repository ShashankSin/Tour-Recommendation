import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// User Screens
import HomeScreen from "../screens/user/HomeScreen";
import ExploreScreen from "../screens/user/ExploreScreen";
import WishlistScreen from "../screens/user/WishlistScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import MyBookingsScreen from "../screens/user/MyBookingsScreen";

const Tab = createBottomTabNavigator();

const UserTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? "home" : "home-outline",
          Explore: focused ? "search" : "search-outline",
          Wishlist: focused ? "heart" : "heart-outline",
          MyBookings: focused ? "calendar" : "calendar-outline",
          Profile: focused ? "person" : "person-outline",
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#10b981",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Explore" component={ExploreScreen} />
    <Tab.Screen name="Wishlist" component={WishlistScreen} />
    <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default UserTabs;
