import axiosClient from "../axiosClient";

export const getStudentsList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = 1,
  sortBy = "StudentId",
  sortDirection = "ASC",
  schoolId = null,
  academicYearId = null,
  userId = null
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
    AcademicYearId : academicYearId,
    UserId : userId
  });
  const response = await axiosClient.get(`/Student/List?${params.toString()}`);
  return response.data;
};

export const addStudent = async (payload) => {
  const response = await axiosClient.post("/Student/Create", payload);
  return response.data;
};

export const updateStudent = async (payload) => {
  const response = await axiosClient.put(`/Student/Update`, payload);
  return response.data;
};

export const getStudentDetail = async (studentId,academicYearId) => {
  debugger;
  const response = await axiosClient.get(`/Student/${studentId}/${academicYearId}`);
  return response.data;
};

export const deleteStudent = async (payload) => {
  const response = await axiosClient.delete(`/Student/Delete`, {
    data: payload,
  });
  return response.data;
};

export const UpdateStudentStatus = async (user) => {
  const response = await axiosClient.post(`/Student/UpdateStatus`, user);
  return response.data;
};

export const addBulkStudent = async (formData,schoolId,gradeId,academicYearId,userId) => {
  const response = await axiosClient.post(`/ElaMath/BulkAddStudent/${schoolId}/${gradeId}/${academicYearId}/${userId}`, formData);
  return response.data;
};

export const addScore = async (formData,schoolId,gradeId,academicYearId) => {
  const response = await axiosClient.post(`/ElaMath/Create/${schoolId}/${gradeId}/${academicYearId}`, formData);
  return response.data;
};


/// MyStudent related Services

// export const getMyStudentDetail = async (guardianId) => {
//   const response = await axiosClient.get(`/MyStudent/${guardianId}`);
//   return response.data;
// };
export const getMyStudentsList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = 1,
  sortBy = "StudentId",
  sortDirection = "ASC",
  schoolId = null,
  userId = null,
  academicyearId = null,

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
    AcademicyearId : academicyearId
  });
  const response = await axiosClient.get(`/MyStudent/List?${params.toString()}`);
  return response.data;
};
