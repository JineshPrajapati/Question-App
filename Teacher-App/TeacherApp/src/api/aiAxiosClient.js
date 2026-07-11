import axios from "axios";
import Cookies from "js-cookie";
const aiAxiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_AI_API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const noAuthRoutes = [
  "/Account/Authenticate",
  "/Account/Register",
  "/Account/ForgotPassword",
  "/Account/ResetPassword",
];

aiAxiosClient.interceptors.request.use(
  (config) => {
    if (!noAuthRoutes.includes(config.url)) {
      const token = Cookies.get("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

aiAxiosClient.interceptors.response.use(
  (response) => {
    if (response.data.isSuccess) {
      return response;
    } else {
      if (response.data.data) {
        return response;
      }
      return Promise.reject({
        message: response.data.message || "Something went wrong!",
      });
    }
  },
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      // error.config._retry = true;
      // try {
      //   const { data } = await axios.post(
      //     "http://localhost:5000/api/Account/RefreshToken",
      //     {
      //       refreshToken: Cookies.get("refreshToken"),
      //       userName: Cookies.get("email"),
      //     },
      //     {
      //       headers: {
      //         'Content-Type': 'application/json'
      //       }
      //     }
      //   );
      //   if (data.isSuccess) {
      //     Cookies.set("accessToken", data.data.accessToken, {
      //       secure: true,
      //       sameSite: "Strict",
      //     });
      //     Cookies.set("refreshToken", data.data.refreshToken, {
      //       secure: true,
      //       sameSite: "Strict",
      //     });
      //     error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      //     return aiAxiosClient(error.config);
      //   }
      //   return Promise.reject({message: data.message || "Refresh token failed"});
      // } catch (refreshError) {
      //   Cookies.remove("accessToken");
      //   Cookies.remove("refreshToken");
      //   Cookies.remove("email");
      //   Cookies.remove("userId");
      //   return Promise.reject(refreshError);
      // }
    }
    return Promise.reject(error);
  },
);

export default aiAxiosClient;
