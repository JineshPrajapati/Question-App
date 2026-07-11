import axios from "axios";

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
// baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,

const TOKEN_KEY = "auth_token";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 seconds
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.clear();
          window.location.href = "/auth/login";
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("API error:", error.response.data);
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error("Network error");
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    } else {
      console.error("Request error:", error.message);
      return Promise.reject({ message: "Request failed. Please try again." });
    }
  },
);

export default apiClient;
