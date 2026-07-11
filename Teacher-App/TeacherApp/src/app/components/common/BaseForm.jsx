import React from "react";
import { useFormik } from "formik";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { PrimaryButton } from "../form/FormElements";

export const BaseForm = ({
  initialValues,
  validationSchema,
  onSubmit,
  onSuccess,
  onClose,
  children,
  submitButtonText = "Submit",
  showSubmitButton = true,
}) => {
  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
      };
      return onSubmit(payload);
    },
    // onSuccess: () => {
    //   toast.success('Successfully saved!');
    //   onSuccess?.();
    // },
    // onError: (error) => {
    //   toast.error(error.message || 'An error occurred');
    // },
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        await mutation.mutateAsync(values);
      } catch (error) {
        // Error is handled by mutation
      }
    },
  });

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="h-full space-y-4 overflow-auto p-4 pb-16"
      >
        {typeof children === "function" ? children(formik) : children}
        {showSubmitButton && (
          <div className="absolute bottom-0 left-0 flex w-full justify-center py-2 pr-8 pl-4">
            {/* <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button> */}

            <PrimaryButton
              type="submit"
              loading={mutation.isPending}
              disabled={mutation.isPending || !formik.isValid}
            >
              {mutation.isPending ? "Saving..." : submitButtonText}
            </PrimaryButton>
          </div>
        )}
      </form>
    </>
  );
};
