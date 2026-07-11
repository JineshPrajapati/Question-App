import axiosClient from "../axiosClient";



export const getAiAssistenHistory = async (payload) => {
    const response = await axiosClient.post("/AiAssistent/GetAiAssistenHistory", payload);
    return response.data;
};


export const sendMessage = async (payload) => {
    const response = await axiosClient.post("/AiAssistent/SendMessage", payload);
    return response.data;
};


export const newChatMessage = async (payload) => {
    const response = await axiosClient.post(`/AiAssistent/NewChatMessage`, payload);
    return response.data;
};


export const getUserAiChatThreadHistory = async (payload) => {
    const response = await axiosClient.post("/AiAssistent/getUserAiChatThreadHistory", payload);
    return response.data;
};

