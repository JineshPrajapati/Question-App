import React, { useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Link } from "react-router";
import { toast } from "react-toastify";
import {
  FormLabel,
  FormInput,
  FormError,
  PrimaryButton,
} from "../../../components/form/FormElements";
import { useForgotPassword } from "../../../../hooks/useAuth";
import { forgotPassword } from "../../../../api/services/authService";
import { useMutation } from "@tanstack/react-query";

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});

const initialValues = { email: "" };

export function ForgotPassword() {
  const [showSuccess, setShowSuccess] = useState(false);
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      // setShowSuccessModal(true);
      setShowSuccess(true);
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error(error.message || "Something went wrong");
    },
  });

  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        let payload = {
          email: values.email,
        };
        await forgotPasswordMutation.mutateAsync(payload);
        // toast.success('Password reset instructions sent to your email');
      } catch (error) {
        // setStatus(error.message || 'Failed to process request');
        // toast.error(error.message || 'Failed to process request');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div>
      {showSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Reset password link has been sent successfully to your email!
              </p>
              <div className="mt-2">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-green-600 underline hover:text-green-500"
                >
                  Go to Sign in
                </Link>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
        Forgot Password
      </h2>
      <p className="mt-2 text-center text-sm text-gray-800">
        Remember your password?{" "}
        <Link
          to="/auth/login"
          className="text-primary font-medium hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>

      <div className="mt-6">
        <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
          <div>
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormInput
              id="email"
              type="email"
              autoComplete="email"
              {...formik.getFieldProps("email")}
            />
            <FormError>{formik.touched.email && formik.errors.email}</FormError>
          </div>

          <PrimaryButton
            type="submit"
            loading={forgotPasswordMutation.isPending}
            disabled={forgotPasswordMutation.isPending || !formik.isValid}
            className="w-full"
          >
            {forgotPasswordMutation.isPending
              ? "Sending..."
              : "Send Reset Link"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
