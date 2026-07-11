import axiosClient from "../axiosClient";

export const getDashboardData = async (
  schoolId,
  currSelectedAcademicYear,
  userId,
) => {
  const response = await axiosClient.get(
    `/Dashboard/${schoolId}/${currSelectedAcademicYear}/${userId}`,
  );
  return response.data;
};

export const getLessonPlanDashboardData = async (
  schoolId,
  currSelectedAcademicYear,
) => {
  const response = await axiosClient.get(
    `/Dashboard/${schoolId}/${currSelectedAcademicYear}`,
  );
  return response.data;
};

export const getExportDailyLessonPlanData = async (dailyLessonPlanId) => {
  const response = await axiosClient.get(`/Dashboard/${dailyLessonPlanId}`);
  return response.data;
};

export const getLessonPlanPercentagedData = async (
  stateId,
  districtId,
  schoolId,
  gradeId,
) => {
  const response = await axiosClient.get(
    `/Dashboard/${stateId}/${districtId}/${schoolId}/${gradeId}`,
  );
  return response.data;
};
