import axiosClient from "../axiosClient";

export const getTeachersList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = 1,
  sortBy = "TeacherId",
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
  const response = await axiosClient.get(`/Teacher/List?${params.toString()}`);
  return response.data;
};

export const addTeacher = async (payload) => {
  const response = await axiosClient.post("/Teacher/Create", payload);
  return response.data;
};

export const updateTeacher = async (payload) => {
  const response = await axiosClient.put(`/Teacher/Update`, payload);
  return response.data;
};

export const getTeacherDetail = async (teacherId,schoolId,academicyearId) => {
  const response = await axiosClient.get(`/Teacher/${teacherId}/${schoolId}/${academicyearId}`);
  return response.data;
};

export const deleteTeacher = async (payload) => {
  const response = await axiosClient.delete(`/Teacher/Delete`, {
    data: payload,
  });
  return response.data;
};

export const UpdateTeacherStatus = async (user) => {
  const response = await axiosClient.post(`/Teacher/UpdateStatus`, user);
  return response.data;
};

export const getTeachers = async (payload) => {
    const response = await axiosClient.post(`/Teacher/TeachersList`, payload);
    return response.data;
};
