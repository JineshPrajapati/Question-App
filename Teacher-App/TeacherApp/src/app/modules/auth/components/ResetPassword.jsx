import React, { useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import {
  FormLabel,
  FormInput,
  FormError,
  PrimaryButton,
} from "../../../components/form/FormElements";
import { useRegister } from "../../../../hooks/useAuth";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
// import { registerUser } from '../../../../api/services/authService'
import { SuccessModal } from "../../../components/ui/SuccessModal";
import { resetPassword } from "../../../../api/services/authService";

const resetPassSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Minimum 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Password confirmation is required"),
});

const initialValues = {
  password: "",
  confirmPassword: "",
};

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const fixedToken = token ? token.replace(/ /g, "+") : "";
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const resetPassMutation = useMutation({
    mutationFn: resetPassword,
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
    validationSchema: resetPassSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        password: values.password,
        email: email,
        token: fixedToken,
      };
      try {
        await resetPassMutation.mutateAsync(payload);
      } catch (error) {
        setSubmitting(false);
        toast.error(error.message || "Password reset failed");
      }
    },
  });

  return (
    <div>
      <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
        Set New Password
      </h2>
      <p className="mt-2 text-center text-sm text-gray-800">
        Enter a new password for <span className="text-primary">{email}</span>
      </p>

      <div className="mt-6">
        <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
          {formik.status && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{formik.status}</div>
            </div>
          )}

          <FormLabel htmlFor="password">Password</FormLabel>
          <FormInput
            id="password"
            type="password"
            {...formik.getFieldProps("password")}
          />
          <FormError>
            {formik.touched.password && formik.errors.password}
          </FormError>

          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          <FormInput
            id="confirmPassword"
            type="password"
            {...formik.getFieldProps("confirmPassword")}
          />
          <FormError>
            {formik.touched.confirmPassword && formik.errors.confirmPassword}
          </FormError>

          <PrimaryButton
            type="submit"
            loading={resetPassMutation.isPending}
            disabled={resetPassMutation.isPending || !formik.isValid}
            className="w-full"
          >
            {resetPassMutation.isPending ? "Reseting Password..." : "Submit"}
          </PrimaryButton>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/auth/login");
        }}
        title="Reset Successfully"
        message="Your password reset succeessfully. Now you can signin."
      />
    </div>
  );
}
