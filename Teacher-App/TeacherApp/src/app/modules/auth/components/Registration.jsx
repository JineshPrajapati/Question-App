import React, { useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router";
import {
  FormLabel,
  FormInput,
  FormError,
  PrimaryButton,
} from "../../../components/form/FormElements";
import { useRegister } from "../../../../hooks/useAuth";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../../../api/services/authService";
import { SuccessModal } from "../../../components/ui/SuccessModal";

const registrationSchema = Yup.object().shape({
  // fullName: Yup.string().required("Full Name is required"),
  firstName: Yup.string()
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/, "only alphabets allowed")
    .required("First Name is required"),
  lastName: Yup.string()
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/, "only alphabets allowed")
    .required("Last Name is required"),
  email: Yup.string().email("Wrong email format").required("Email is required"),
  password: Yup.string()
    .min(8, "Minimum 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Password confirmation is required"),
  acceptTerms: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions",
  ),
});

const initialValues = {
  // fullName:'',
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export function Registration() {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed");
    },
  });

  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        // fullName: values.fullName,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };
      try {
        await registerMutation.mutateAsync(payload);
      } catch (error) {
        setSubmitting(false);
        // toast.error(error.message || 'Registration failed')
      }
    },
  });

  return (
    <div>
      <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
        Create an Account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-800">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-primary font-medium hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>

      <div className="mt-6">
        <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
          {formik.status && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{formik.status}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <FormLabel htmlFor="firstName">First Name</FormLabel>
              <FormInput
                id="firstName"
                type="firstName"
                autoComplete="firstName"
                {...formik.getFieldProps("firstName")}
                onKeyPress={(e) => {
                  const regex = /^[A-Za-z]$/; // only alphabets, no spaces
                  if (!regex.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />
              <FormError>
                {formik.touched.firstName && formik.errors.firstName}
              </FormError>
            </div>
            <div className="space-y-1">
              <FormLabel htmlFor="lastName">Last Name</FormLabel>
              <FormInput
                id="lastName"
                type="lastName"
                autoComplete="lastName"
                {...formik.getFieldProps("lastName")}
                onKeyPress={(e) => {
                  const regex = /^[A-Za-z]$/; // only alphabets, no spaces
                  if (!regex.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />
              <FormError>
                {formik.touched.lastName && formik.errors.lastName}
              </FormError>
            </div>
          </div>

          <div className="space-y-1">
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormInput
              id="email"
              type="email"
              autoComplete="email"
              {...formik.getFieldProps("email")}
            />
            <FormError>{formik.touched.email && formik.errors.email}</FormError>
          </div>

          <div className="space-y-1">
            <FormLabel htmlFor="password">Password</FormLabel>
            <FormInput
              id="password"
              type="password"
              {...formik.getFieldProps("password")}
            />
            <FormError>
              {formik.touched.password && formik.errors.password}
            </FormError>
          </div>

          <div className="space-y-1">
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
            <FormInput
              id="confirmPassword"
              type="password"
              {...formik.getFieldProps("confirmPassword")}
            />
            <FormError>
              {formik.touched.confirmPassword && formik.errors.confirmPassword}
            </FormError>
          </div>

          <div className="flex items-center">
            <input
              id="acceptTerms"
              type="checkbox"
              {...formik.getFieldProps("acceptTerms")}
              className="text-primary h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="acceptTerms"
              className="ml-2 block text-sm text-gray-900"
            >
              I accept the{" "}
              <Link
                target="_blank"
                to="/terms-conditions"
                className="text-primary hover:text-primary-dark"
              >
                Terms and Conditions
              </Link>
            </label>
          </div>
          <FormError>
            {formik.touched.acceptTerms && formik.errors.acceptTerms}
          </FormError>

          <PrimaryButton
            type="submit"
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending || !formik.isValid}
            className="w-full"
          >
            {registerMutation.isPending
              ? "Creating Account..."
              : "Create Account"}
          </PrimaryButton>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/auth/login");
        }}
        title="Registration Successful!"
        message="Your account has been created successfully. Please login to continue."
      />
    </div>
  );
}
