import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";
import { navigationRef } from "../App";
import { CommonActions } from "@react-navigation/native";
import handleTokenExpiration from "../../Tour-Recommendation/utils/handleTokenExpiration";

const axiosInstance = axios.create({
  baseURL: "http://10.0.2.2:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          await handleTokenExpiration();
          throw new Error("Token expired");
        }

        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error("Network Error:", error);
      if (error.code === "ECONNABORTED") {
        throw new Error("Request timed out. Please check your connection.");
      }
      throw new Error("Network error. Please check your connection.");
    }

    if (error.response?.status === 401) {
      await handleTokenExpiration();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
