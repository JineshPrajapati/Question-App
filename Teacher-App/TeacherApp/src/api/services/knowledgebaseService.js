import axiosClient from "../axiosClient";

export const getKnowledgebaseList = async ({
  pageNumber = 1,
  pageSize = 10,
  search = null,
  activeOnly = -1,
  sortBy = "KnowledgebaseId",
  sortDirection = "ASC",
  schoolId = null,
  academicYearId = null,
  userId = null,
  gadeId = null,
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
    UserId: userId,
    GradeId: gadeId,
  });

  const response = await axiosClient.get(
    `/Knowledgebase/List?${params.toString()}`,
  );
  return response.data;
};

export const ManageKnowledgebase = async (payload) => {
  return axiosClient.post("/Knowledgebase/Create", payload);
};

export const deleteKnowledgebase = async (payload) => {
  const response = await axiosClient.delete(`/Knowledgebase/Delete`, {
    data: payload,
  });
  return response.data;
};

export const updateKnowledgebaseStatus = async (knowledgebase) => {
  const response = await axiosClient.post(
    `/Knowledgebase/UpdateStatus`,
    knowledgebase,
  );
  return response.data;
};
