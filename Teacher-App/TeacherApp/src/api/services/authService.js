import axiosClient from "../axiosClient";
import Cookies from "js-cookie";

export const loginUser = async (credentials) => {
  const { data } = await axiosClient.post("/Account/Authenticate", credentials);
  Cookies.set("accessToken", data.accessToken, {
    // secure: true,
    sameSite: "Strict",
  });
  Cookies.set("refreshToken", data.refreshToken, {
    // secure: true,
    sameSite: "Strict",
  });
  Cookies.set("email", data.user.emailAddress, {
    // secure: true,
    sameSite: "Strict",
  });
  Cookies.set("userId", data.user.userId, {
    // secure: true,
    sameSite: "Strict",
  });
  return data;
};

export const registerUser = async (userData) => {
  return axiosClient.post("/Account/Register", userData);
};

export const forgotPassword = async (payload) => {
  return axiosClient.post("/Account/ForgotPassword", payload);
};

export const resetPassword = async (payload) => {
  return axiosClient.post("/Account/ResetPassword", payload);
};

export const getUserDetailById = async (userId) => {
  const { data } = await axiosClient.get(`/User/${userId}`);
  return data;
};

export const updateUserProfile = async (userProfile) => {
  const { data } = await axiosClient.put("/Account/UpdateProfile", userProfile);
  return data;
};

export const getAccessRightsData = async (schoolId, userId) => {
  const { data } = await axiosClient.post(`/Account/GetAccessRights`, {
    userId,
    schoolId,
  });
  return data;
};
