import axiosClient from "../axiosClient";


//Grade and subject related service

export const saveSchoolGrades = async (payload) => {
  const response = await axiosClient.post("/Grade/Create", payload);
  return response.data;
};

// export const AddGradeToMaster = async (payload) => {
//     const response = await axiosClient.post("/Grade/Create", payload);
//   return response.data;
// }

export const deleteGrade = async (payload) => {
  const response = await axiosClient.delete(`/Grade/Delete`,{data: payload});

  return response.data;
};

export const deleteSubject = async (schoolGradeSubjectId) => {
  const response = await axiosClient.delete(`/Grade/Delete/${schoolGradeSubjectId}`);

  return response.data;
};

export const AddSubjectMaster = async (payload) => {
    const response = await axiosClient.post("/Grade/AddSubjectMaster", payload);
  return response.data;
}

export const AddSubjectToGrade = async (payload) => {
  const response = await axiosClient.post("/Grade/AddGradeSubject", payload);
  return response.data;
};

export const getGradeMaster = async (currSelectedSchool,currSelectedAcademicYear) => {
  const params = new URLSearchParams({ SchoolId : currSelectedSchool,  AcademicyearId : currSelectedAcademicYear });
  const response = await axiosClient.get(
    `/Grade/List?${params.toString()}`,
  );
  return response.data;
};

// Holiday related Service

export const getHolidayList = async (schoolId,currSelectedAcademicYear,userId) => {
  const response = await axiosClient.get(`/Holiday/List/${schoolId}/${currSelectedAcademicYear}/${userId}`);
  return response.data;
};

export const AddHoliday = async (payload) => {
  const response = await axiosClient.post("/Holiday/Create", payload);
  return response.data;
};

export const UpdateHoliday = async (payload) => {
  const response = await axiosClient.post("/Holiday/Update", payload);
  return response.data;
};

export const deleteHoliday = async (holidayId,createdBy) => {
  const response = await axiosClient.delete(`/Holiday/${holidayId}/${createdBy}`);
  return response.data;
};

//subject related services
export const getSchoolSubject = async (schoolId) => {
  const params = new URLSearchParams({ SchoolId: schoolId });
  const response = await axiosClient.get(
    `/Subject/list?${params.toString()}`,
  );
  return response.data;
};

export const AddSubjectToSchool = async (payload) => {
    const response = await axiosClient.post("/Subject/Create", payload);
  return response.data;
}

export const deleteSubjectFromSchool = async (schoolSubjectId) => {
  const response = await axiosClient.delete(`/Subject/Delete/${schoolSubjectId}`);
  return response.data;
};