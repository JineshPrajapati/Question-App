import axiosClient from "../axiosClient";

export const getRolesList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = -1,
  sortBy = "RoleId",
  sortDirection = "ASC",
  schoolId = null,
  userId = null,
  academicyearId= null
}) => {
  const params = new URLSearchParams({
    PageNumber: pageNumber,
    PageSize: pageSize,
    search: search || "",
    ActiveOnly: activeOnly == 1 ? 1 : activeOnly == 0 ? 0 : -1,
    SortDirection: sortDirection,
    SortBy: sortBy,
    SchoolId: schoolId,
    UserId:userId,
    AcademicyearId: academicyearId
  });

  const response = await axiosClient.get(`/Role/List?${params.toString()}`);

  return response.data;
};

export const getRoleDetail = async (payload) => {
  const response = await axiosClient.get(`/Role/${payload}`);
  return response.data;
};

export const getAccessRightsByRole = async (payload) => {
  const response = await axiosClient.get("/Role/" + payload);
  return response.data;
};

export const createRole = async (payload) => {
  const response = await axiosClient.post("/Role/Create", payload);
  return response.data;
};

export const updateRole = async (payload) => {
  const response = await axiosClient.put("/Role/Update", payload);
  return response.data;
};

export const deleteRole = async (payload) => {
  const response = await axiosClient.delete(`/Role/Delete`, { data: payload });
  return response.data;
};

export const updateRoleStatus = async (Role) => {
  const response = await axiosClient.post(`/Role/UpdateStatus`, Role);
  return response.data;
};
