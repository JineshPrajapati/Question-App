import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  forgotPassword,
  registerUser,
} from "../api/services/authService";
import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";

export const useLogin = () => {
  const { setUserData, setAccessRightsData } = useContext(AuthContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setUserData(data.user || {});
      setAccessRightsData(data.userRights || {});
        queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      throw error; // Re-throw the error to be handled by the component
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      // return data;
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      // throw error; // Re-throw the error to be handled by the component
    },
  });
};

export const useForgotPassword = () => {
  return useMutation(forgotPassword);
};
