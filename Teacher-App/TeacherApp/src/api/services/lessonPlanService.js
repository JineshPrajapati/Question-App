import axiosClient from "../axiosClient";

export const getLessonPlanList = async ({
    pageNumber = 1,
    pageSize = 10,
    search = null,
    activeOnly = 1,
    sortBy = "LessonPlanId",
    sortDirection = "ASC",
    schoolId= null,
    academicYearId = null,
    userId = null,
    gradeId= null,
    gradeIds = null,
    subjectIds = null,
    teacherIds = null,
}) => {
    const params = new URLSearchParams({
        PageNumber: pageNumber,
        PageSize: pageSize,
        search: search || "",
        ActiveOnly:
            activeOnly == 1 ? 1 : activeOnly == 0 ? 0 : activeOnly == 4 ? 4 : -1,
        SortDirection: sortDirection,
        SortBy: sortBy,
        SchoolId:schoolId,
        AcademicYearId: academicYearId,
        UserId : userId,
        GradeId: gradeId,
        GradeIds :gradeIds || "",
        SubjectIds :subjectIds|| "",
        TeacherIds :teacherIds|| "",
    });
    const response = await axiosClient.get(`/LessonPlan/List?${params.toString()}`);
    return response.data;
};

export const generateLessonPlan = async (payload) => {
    const response = await axiosClient.post("/LessonPlan/GenerateLessonPlan", payload);
    return response.data;
};

export const addLessonPlan = async (payload) => {
    const response = await axiosClient.post("/LessonPlan/Create", payload);
    return response.data;
};


export const getGradeSubject = async (payload) => {
    const response = await axiosClient.post("/LessonPlan/GradeSubject", payload);
    return response.data;
};


export const getPeriodListByLessonFormat = async (payload) => {

    const response = await axiosClient.post("/LessonPlan/getPeriodListByLessonFormat", payload);
    return response.data;
};

export const getWeekNumberForLessonPlan = async (payload) => {

    const response = await axiosClient.post("/LessonPlan/GetWeekNumberForLessonPlan", payload);
    return response.data;
};

export const updateLessonPlan = async (payload) => {
    const response = await axiosClient.post(`/LessonPlan/Update`, payload);
    return response.data;
};

export const getLessonPlanDetail = async (lessonPlanId) => {
    const response = await axiosClient.get(`/LessonPlan/${lessonPlanId}`);
    return response.data;
};

export const deleteLessonPlan = async (payload) => {
    const response = await axiosClient.delete(`/LessonPlan/Delete`, {
        data: payload,
    });
    return response.data;
};

export const UpdateLessonPlanStatus = async (user) => {
    const response = await axiosClient.post(`/LessonPlan/UpdateStatus`, user);
    return response.data;
};


export const askAiChat = async (payload) => {
    const response = await axiosClient.post(`/AiAssistent/SendMessage`, payload);
    return response.data;
};

export const getLessonPlans = async (payload) => {
    const response = await axiosClient.post("/LessonPlan/getLessonPlans", payload);
    return response.data;
};

export const getAvailableLessonPlans = async (payload) => {
  
    const response = await axiosClient.post("/LessonPlan/getAvailableLessonPlans", payload);
    return response.data;
};


