import axiosClient from "../axiosClient";

export const getChatHistory = async (senderid,receiverId) => {
  const response = await axiosClient.get(`/ChatMessage/GetChatByUserId/${senderid}/${receiverId}`);
  return response.data;
};

export const getChatByGrade = async (senderid,receiverId) => {
  const response = await axiosClient.get(`/ChatMessage/GetChatByGrade/${senderid}/${receiverId}`);
  return response.data;
};
export const sendMessage = async (payload) => {
  const response = await axiosClient.post("/ChatMessage/SendMessage", payload);
  return response.data;
};

export const exportChatHistory = async (userId,chatUserId) => {
  const response = await axiosClient.get(`/ChatMessage/download-chat-pdf/${userId}/${chatUserId}`, {
    responseType: "blob", // crucial for binary data like Excel
  });
  return response;
};

export const updateUnReadMessage = async(userId, chatUserId) =>{
  const response = await axiosClient.post(`/ChatMessage/UpdateIsReadMessage/${userId}/${chatUserId}`)
  return response.data;
};


// export const saveCallHistory = async (payload) => {
//   const response = await axiosClient.post("/ChatMessage/SaveCallHistory", payload);
//   return response.data;
// };