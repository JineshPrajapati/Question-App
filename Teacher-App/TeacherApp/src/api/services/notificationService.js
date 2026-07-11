import axiosClient from "../axiosClient";

export const getNotification = async (userId,schoolId) => {
  const response = await axiosClient.get(`/Notification/GetNotification/${userId}/${schoolId}`);
  return response.data;
};