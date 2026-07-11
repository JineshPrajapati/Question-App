import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const noAuthRoutes = [
  "/Account/Authenticate",
  "/Account/Register",
  "/Account/ForgotPassword",
  "/Account/ResetPassword",
];

// Function to check if the token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000; // Token is expired if true
  } catch (error) {
    return true;
  }
};

// Function to refresh the token
const refreshToken = async () => {
  try {
    const refreshToken = Cookies.get("refreshToken");
    const userName = Cookies.get("email");

    if (!refreshToken || !userName)
      throw new Error("No refresh token available");

    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/Account/RefreshToken`,
      { refreshToken, userName },
      { headers: { "Content-Type": "application/json" } },
    );

    if (data.isSuccess) {
      // Update tokens in cookies
      Cookies.set("accessToken", data.accessToken, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("refreshToken", data.refreshToken, {
        secure: true,
        sameSite: "Strict",
      });

      return data.accessToken; // Return the new access token
    } else {
      throw new Error("Token refresh failed");
    }
  } catch (error) {
    // Clear cookies and redirect to login if refresh fails
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("email");
    Cookies.remove("userId");

    console.error("Session expired, redirecting to login...");
    window.location.href = "/auth/login"; // Redirect to login
    return null;
  }
};

// Request Interceptor - Handles Token Expiry Before API Call
axiosClient.interceptors.request.use(
  async (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // Let browser handle it
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    if (!noAuthRoutes.includes(config.url)) {
      let token = Cookies.get("accessToken");

      // If token is expired, refresh it
      if (isTokenExpired(token)) {
        token = await refreshToken();
      }

      // If token refresh failed, stop request
      if (!token) {
        return Promise.reject(new Error("Unable to refresh token"));
      }

      // Attach the new token to request
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor - Handles 401 Unauthorized Errors
axiosClient.interceptors.response.use(
  (response) => {
    // Skip interceptor logic if the response is a Blob (e.g., image or file)
    if (response.config.responseType === 'blob') {
      if(response.status == 204) {
        return Promise.reject({
        MSG_CODE: "NO_CONTENT",
        message: "No Chat History Found",
        code: 204
      });
      }
      return response;
    }
    if (response.data?.isSuccess || (response.data?.data)  ) {
      if(response?.data?.data && !response.data.isSuccess) {
         return Promise.reject({
        message: response.data.message || "Something went wrong!",
        data:response?.data?.data
      });
      }else {
      return response;

      }
    } else {
       return Promise.reject({
        message: response.data.message || "Something went wrong!",
      });
    }
  },
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/access-denied";
    }
    return Promise.reject(error);
  }
);
 

export default axiosClient;
