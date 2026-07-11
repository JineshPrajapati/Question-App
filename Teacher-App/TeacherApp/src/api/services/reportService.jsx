import axiosClient from "../axiosClient";

export const generateStudentPteReport = async (
  studentId,
  note,
  conferenceType,
  gradeId,
  academicYearId,
) => {
  const response = await axiosClient.get("/Report/GetPTEReport", {
    params: {
      studentId,
      note,
      conferenceType,
      gradeId,
      academicYearId,
    },
    responseType: "blob",
  });
  return response;
};
