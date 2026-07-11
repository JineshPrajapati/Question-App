import axiosClient from "../axiosClient";

export const getUsersList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = 1,
  sortBy = "UserId",
  sortDirection = "ASC",
  userId = null,
  schoolId = null,
  academicyearId = currSelectedAcademicYear,
}) => {
  const params = new URLSearchParams({
    PageNumber: pageNumber,
    PageSize: pageSize,
    search: search || "",
    ActiveOnly:
    activeOnly == 1 ? 1 : activeOnly == 0 ? 0 : activeOnly == 4 ? 4 : -1,
    SortDirection: sortDirection,
    SortBy: sortBy,
    UserId:userId,
    SchoolId: schoolId,
    AcademicyearId: academicyearId
  });
  const response = await axiosClient.get(`/User/List?${params.toString()}`);
  return response.data;
};

export const addUser = async (payload) => {
  const response = await axiosClient.post("/User/Create", payload);
  return response.data;
};

export const updateUser = async (payload) => {
  const response = await axiosClient.put(`/User/Update`, payload);
  return response.data;
};

export const activateUser = async (payload) => {
  const response = await axiosClient.post("/Account/VerifyUser", payload);
  return response.data;
};

export const updateProfilePicture = async (payload) => {
  const response = await axiosClient.put("/Account/ProfilePicture", payload);
  return response.data;
};

export const deleteUser = async (payload) => {
  const response = await axiosClient.delete(`/User/Delete`, { data: payload });
  return response.data;
};

export const UpdateUserStatus = async (user) => {
  const response = await axiosClient.post(`/User/UpdateStatus`, user);
  return response.data;
};

export const rejactPendingApprovals = async (payload) => {
  const response = await axiosClient.delete(`/Account/DeletePendingApproval`, {
    data: payload,
  });
  return response.data;
};
