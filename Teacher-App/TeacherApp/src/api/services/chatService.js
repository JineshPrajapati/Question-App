import aiAxiosClient from "../aiAxiosClient";
import axiosClient from "../axiosClient";

export const queryOpenAI = async (params) => {
  const { data } = await aiAxiosClient.post("/openai/query_openai", params);
  return data;
};
export const listThreads = async (params) => {
  const { data } = await axiosClient.post("/Thread/List", params);
  return data;
};
export const listMessages = async (threadId) => {
  const { data } = await axiosClient.get(`/Thread/Get/${threadId}`);
  return data;
};
export const deleteThread = async (params) => {
  const { data } = await axiosClient.delete("/Thread/Delete", { data: params });
  return data;
};
export const archiveThread = async (params) => {
  const { data } = await axiosClient.delete("/Thread/Archive", {
    data: params,
  });
  return data;
};
export const getDefaultQuestions = async () => {
  const response = await axiosClient.get("/DefaultQuestion/Get/7&1");
  return response;
};
export const renameThread = async (params) => {
  const { data } = await axiosClient.post("/Thread/Edit", params);
  return data;
};
