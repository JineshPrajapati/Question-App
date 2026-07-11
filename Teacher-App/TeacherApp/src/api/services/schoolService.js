import axiosClient from "../axiosClient";

export const getSchoolsList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = 1,
  sortBy = "SchoolId",
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
  const response = await axiosClient.get(`/School/List?${params.toString()}`);
  return response.data;
};



export const addSchool = async (payload) => {
    const response = await axiosClient.post("/School/Create", payload);
    return response.data;
};


export const updateSchool = async (payload) => {
  const response = await axiosClient.put(`/School/Update`, payload);
  return response.data;
};

export const getSchoolDetail = async (schoolId) => {
    const response = await axiosClient.get(`/School/${schoolId}`);
    return response.data;
};

export const deleteSchool = async (payload) => {
  const response = await axiosClient.delete(`/School/Delete`, {
    data: payload,
  });
  return response.data;
};

export const UpdateSchoolStatus = async (user) => {
  const response = await axiosClient.post(`/School/UpdateStatus`, user);
  return response.data;
};


export const getSchoolHolidays = async (schoolId) => {
    const response = await axiosClient.get(`/School/holidays?${schoolId.toString()}`);
    return response.data;
};
export const getSchoolHoliday = async (Id) => {
    const response = await axiosClient.get(`/School/holiday?${Id.toString()}`);
    return response.data;
};