import { useMutation } from '@tanstack/react-query';
import authService from '../api/services/authService';

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      return await authService.login(credentials.email, credentials.password);
    },
    onError: (error) => {
      console.error('Login error:', error);
    }
  });
};

// Add other auth-related queries/mutations here
export const useRegister = () => {
  return useMutation({
    mutationFn: (userData) => authService.register(userData),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
  });
};
