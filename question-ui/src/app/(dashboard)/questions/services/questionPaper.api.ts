
import axiosInstance from "@/api/axios";
import { API_ENDPOINTS } from "@/api/endpoints";


export const getDropDowns = async (
standardIds:string,
subjectIds : string,
chepterIds :string,
masterId   :number,

): Promise<any> => {
  const { data } = await axiosInstance.get(`${API_ENDPOINTS.GetCustomDropDown}`, {
    params: {
      StandardIds: standardIds,
      SubjectIds: subjectIds,
      ChepterIds: chepterIds,
      MasterId: masterId,
    },
  });
  return data;
};

export const getQuestionsByTopics = async (
  topicIds: string,
  pageNumber: number = 1,
  pageSize: number = 10
) => {
  const { data } = await axiosInstance.get(
    API_ENDPOINTS.GetQuestions,
    {
      params: {
        TopicIds: topicIds,
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    }
  );

  return data;
};
