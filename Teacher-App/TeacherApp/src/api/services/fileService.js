import axiosClient from "../axiosClient";
import Cookies from "js-cookie";

export const getImageUrl = async (
  fileId = null, 
  download = false,
  filePath = null) => {
  if (!fileId && !filePath) return null; // Return null if no fileId is provided
  try {

    const url = !filePath 
    ? `${import.meta.env.VITE_API_BASE_URL}/api/File/DownloadFile/${fileId}?download=${download}`
    : `${import.meta.env.VITE_API_BASE_URL}/api/File/DownloadFileByPath?filePath=${filePath}&download=${download}`;
    
    const token = Cookies.get("accessToken");
    // API call to get the image URL
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // const response = await fetch(`http://localhost:5000/api/File/DownloadFile/${fileId}?download=${download}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // const response = await axiosClient.get(`/File/DownloadFile/${fileId}`, {
    //   responseType: "blob", // Important for handling image files
    // });
    return URL.createObjectURL(await response.blob());
    // Create an object URL for the image
    //return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error fetching user image:", error);
    return null;
  }
};
