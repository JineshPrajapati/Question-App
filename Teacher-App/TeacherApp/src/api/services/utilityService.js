import axiosClient from "../axiosClient";

export const getDropdownData = async (options) => {
  const response = await axiosClient.get(`/options/${options}`);
  return response.data;
};
