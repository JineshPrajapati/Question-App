import { promises } from "dns";
import axiosInstance from "./axios";
import { API_ENDPOINTS } from "./endpoints";

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  // add other fields returned from API if any
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post(API_ENDPOINTS.LOGIN, payload, {
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
    },
  });
  return data;
};



////grade

export interface OptionList {
  optionGroup: string;
  optionLabel: string;
  optionValue: string;
  displayOrder?: number; // optional because int? in C#
}

export interface DropDownOptionsEntity {
  isSuccess: boolean;
  message: string;
  options: OptionList[];
}

export const getStandardSubject = async (
): Promise<DropDownOptionsEntity> => {
  const { data } = await axiosInstance.get<DropDownOptionsEntity>(
    `${API_ENDPOINTS.OPTIONS}`
  );
  return data;
};

// Get values from dropdownmaster based on optiongroup
export const getDropDownConst = async (
  optionGroup: string
): Promise<DropDownOptionsEntity> => {
  const { data } = await axiosInstance.get<DropDownOptionsEntity>(
    `${API_ENDPOINTS.GetDropDownConst}/${optionGroup}`
  );

  return data;
};

// chapters
export const getStandards = async (
  userId: string,
  standardId: number,
  subjectId: number,
  mediumId: number,
  masterId: number
): Promise<any> => {
  const { data } = await axiosInstance.get(`${API_ENDPOINTS.GetDropdownData}`, {
    params: {
      UserId: userId,
      MasterId: masterId,
      StandardId: standardId,
      SubjectId: subjectId,
      MediumId:mediumId
    },
  });
  return data;
};

//topics
export const getTopics = async (
  userId: string,
  standardId: number,
  subjectId: number,
  chapterId: number,
): Promise<any> => {
  const { data } = await axiosInstance.get(`${API_ENDPOINTS.GetDropdownData}`, {
    params: {
      UserId: userId,
      MasterId: 2,
      StandardId: standardId,
      SubjectId: subjectId,
      chapterId: chapterId
    },
  });
  return data;
};

export const addQuestion = async (
  file: File,
  medium: number,
  stream: number,
  standard: number,
  subject: number,
  chapter: number,
  topic: number
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);            // matches IFormFile file
  formData.append("medium", medium.toString());
  formData.append("stream", stream.toString());
  formData.append("standard", standard.toString());
  formData.append("subject", subject.toString());
  formData.append("chapter", chapter.toString());
  formData.append("topic", topic.toString());

  const { data } = await axiosInstance.post(
    `${API_ENDPOINTS.AddQuestion}`,        // e.g., "/api/Question/Create"
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

