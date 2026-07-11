import axiosClient from "../axiosClient";

export const getLeavesList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = 1,
  sortBy = "LeaveId",
  sortDirection = "ASC",
  schoolId = null,
  userId = null,
  academicyearId = null
}) => {
  const params = new URLSearchParams({
    PageNumber: pageNumber,
    PageSize: pageSize,
    search: search || "",
    ActiveOnly:
      activeOnly == 1 ? 1 : activeOnly == 0 ? 0 : activeOnly == 4 ? 4 : -1,
    SortDirection: sortDirection,
    SortBy: sortBy,
    SchoolId: schoolId,
    UserId:userId,
    AcademicyearId: academicyearId
  });
  const response = await axiosClient.get(`/Leave/List?${params.toString()}`);
  return response.data;
};

export const addLeave = async (payload) => {
    const response = await axiosClient.post("/Leave/Create", payload);
    return response.data;
};

export const updateLeave = async (payload) => {
  const response = await axiosClient.put(`/Leave/Update`, payload);
  return response.data;
};

export const deleteLeave = async (payload) => {
  const response = await axiosClient.delete(`/Leave/Delete`, {
    data: payload,
  });
  return response.data;
};