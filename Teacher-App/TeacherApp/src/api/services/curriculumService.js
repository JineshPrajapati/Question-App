import axiosClient from "../axiosClient";

export const getCurriculumList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = -1,
  sortBy = "KnowledgebaseId",
  sortDirection = "ASC",
  schoolId = null,
  academicYearId = null,
  gradeId = null,
}) => {
  const params = new URLSearchParams({
    PageNumber: pageNumber,
    PageSize: pageSize,
    search: search || "",
    ActiveOnly: activeOnly == 1 ? 1 : activeOnly == 0 ? 0 : -1,
    SortDirection: sortDirection,
    SortBy: sortBy,
    SchoolId: schoolId,
    AcademicYearId: academicYearId,
    GradeId: gradeId,
  });

  const response = await axiosClient.get(
    `/Curriculum/List?${params.toString()}`,
  );

  return response.data;
};

export const manageCurriculum = async (payload) => {
    return axiosClient.post("/Curriculum/Create", payload);
};

export const deleteCurriculum = async (payload) => {
    const response = await axiosClient.delete(`/Curriculum/Delete`, {
    data: payload,
  });
  return response.data;
};

// export const updateKnowledgebaseStatus = async (knowledgebase) => {
//   const response = await axiosClient.post(
//     `/LessonPlanning/UpdateStatus`,
//     knowledgebase,
//   );
//   return response.data;
// };
