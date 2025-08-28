import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Admin Screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminCompaniesScreen from "../screens/admin/AdminCompaniesScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminItinerariesScreen from "../screens/admin/AdminItinerariesScreen";

const Tab = createBottomTabNavigator();

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Dashboard: focused ? "grid" : "grid-outline",
          Companies: focused ? "business" : "business-outline",
          Users: focused ? "people" : "people-outline",
          Itineraries: focused ? "map" : "map-outline",
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#10b981",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
    <Tab.Screen name="Companies" component={AdminCompaniesScreen} />
    <Tab.Screen name="Users" component={AdminUsersScreen} />
    <Tab.Screen name="Itineraries" component={AdminItinerariesScreen} />
  </Tab.Navigator>
);

export default AdminTabs;
