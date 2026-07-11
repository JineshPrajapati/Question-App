/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "react-toastify";
import {
  FormLabel,
  FormInput,
  FormError,
  PrimaryButton,
} from "../../../components/form/FormElements";
import { useLogin } from "../../../../hooks/useAuth";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  rememberMe: Yup.boolean(),
});

const initialValues = {
  email: "",
  password: "",
  rememberMe: true,
};

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        let payload = {
          username: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        };

        if (values.rememberMe) {
          // localStorage.setItem("rememberEmail", values.email);
          // localStorage.setItem("rememberPassword", values.password);
          localStorage.setItem("rememberMe", "true");
        } else {
          // localStorage.removeItem("rememberEmail");
          // localStorage.removeItem("rememberPassword");
          localStorage.removeItem("rememberMe");
        }

        await loginMutation.mutateAsync(payload);
        const from = "/";
        navigate(from, { replace: true });
      } catch (error) {
        // setStatus  (error.response.data.error || 'Login failed. Please try again.');
        toast.error(error.message || "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // useEffect(() => {
  //   // const savedEmail = localStorage.getItem("rememberEmail");
  //   // const savedPassword = localStorage.getItem("rememberPassword");
  //   const remember = localStorage.getItem("rememberMe") === "true";

  //   formik.setValues({
  //     // email: savedEmail || "",
  //     // password: savedPassword || "",
  //     rememberMe: remember,
  //   });
  // }, []);

  // console.log(import.meta.env, "env");
  return (
    <div>
      <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-800">
        New Here?{" "}
        <Link
          to="/auth/signup"
          className="text-primary font-medium hover:text-indigo-500"
        >
          Create an Account
        </Link>
      </p>

      <div className="mt-6">
        <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
          {formik.status && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{formik.status}</div>
            </div>
          )}

          <div className="w-full">
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormInput
              id="email"
              type="email"
              autoComplete="email"
              {...formik.getFieldProps("email")}
            />
            <FormError>{formik.touched.email && formik.errors.email}</FormError>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <FormLabel htmlFor="password">Password</FormLabel>
              <Link
                to="/auth/forgot-password"
                className="text-primary text-sm font-medium hover:text-indigo-500"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <FormInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...formik.getFieldProps("password")}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <FormError>
              {formik.touched.password && formik.errors.password}
            </FormError>
          </div>
{/* 
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={formik.values.rememberMe}
              onChange={(e) =>
                formik.setFieldValue("rememberMe", e.target.checked)
              }
              className="text-primary h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </label>
          </div> */}

          <PrimaryButton
            type="submit"
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending || !formik.isValid}
            className="w-full mt-5"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
