import { useMutation } from "@tanstack/react-query";
import { login as loginApi } from "@/api/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export const useLogin = () => {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // ✅ Store token
      localStorage.setItem("token", data.token);

      console.log("UserResponse: ", data);

      // ✅ Update auth context
      if (data?.user) {
        login(data.user);
      }

      // ✅ Redirect to home
      router.push("/");
    },
    onError: (error) => {
      console.error("Login failed:", error.message);
    },
  });
};
