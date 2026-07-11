import axiosClient from "../axiosClient";

export const getUserDropdownList = async (userId, masterId) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: masterId });
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};

export const getRoleDropdownList = async (userId,currSelectedSchool) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: 7,SchoolId:currSelectedSchool });
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};

export const getSchoolDropdownList = async (userId) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: 8 });
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};


export const getSchoolWiseGradeDropdown = async (userId,currSelectedSchool) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: 9 ,SchoolId:currSelectedSchool});
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};

export const getSubjectDropdown = async (userId) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: 10 });
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};

export const getLocationDropdown = async (stateCode, districtId) => {
  const params = new URLSearchParams({
    StateCode: stateCode || "",
    DistrictId: districtId,
  });
  const response = await axiosClient.get(
    `/options/LocationDropdown?${params.toString()}`,
  );
  return response.data;
};

export const getStudentDropdown = async (schoolId, gradeId, userIdentityId , userTypeId) => {
  const params = new URLSearchParams({
    GradeId: gradeId,
    SchoolId: schoolId,
    UserIdentityId:userIdentityId,
    UserTypeId : userTypeId
  });
  const response = await axiosClient.get(`/options/StudentListByGrade?${params.toString()}`,);
  return response.data;
};


export const getGradeMaster = async (userId,currSelectedSchool) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: 11,SchoolId:currSelectedSchool });
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};

export const getSchoolGradeList = async (userId,currSelectedSchool,currSelectedAcademicYear) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: 12,SchoolId:currSelectedSchool, AcademicYearId : currSelectedAcademicYear });
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};

export const getTeachersGradeList = async (userId,currSelectedSchool,currSelectedAcademicYear) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: 15,SchoolId:currSelectedSchool, AcademicYearId : currSelectedAcademicYear });
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};

export const getSchoolGradeSubject = async (gradeId) => {
  const params = new URLSearchParams({ SchoolGradeId: gradeId });
  const response = await axiosClient.get(
    `/options/SubjectMaster?${params.toString()}`,
  );
  return response.data;
};



export const getAcademicYearsDropdownList = async (userId) => {
  const params = new URLSearchParams({ UserId: userId, MasterId: 13 });
  const response = await axiosClient.get(
    `/options/Dropdown?${params.toString()}`,
  );
  return response.data;
};

export const getGradeSubject = async (userId,currSelectedSchool,currSelectedAcademicYear) => {
  const params = new URLSearchParams({ UserId: userId,SchoolId:currSelectedSchool, AcademicYearId : currSelectedAcademicYear, GradeId :0 });
  const response = await axiosClient.get(
    `/options/GradeSubject?${params.toString()}`,
  );
  return response.data;
};