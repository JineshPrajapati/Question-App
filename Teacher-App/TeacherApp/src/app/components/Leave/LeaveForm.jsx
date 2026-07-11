import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { FormInput, FormLabel, FormTextarea } from "../form/FormElements";
import { BaseForm } from "../common/BaseForm";
import { useMutation } from "@tanstack/react-query";
import { addLeave, updateLeave } from "../../../api/services/leaveService";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";

const validDate = (label) =>
  Yup.date()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue === "null") return null;
      const date = new Date(originalValue);
      return isNaN(date.getTime()) ? null : date;
    })
    .nullable()
    .typeError(
      `Please enter a valid ${label.toLowerCase()} in YYYY-MM-DD format`,
    )
    .required(`${label} is required`);

export const LeaveFormValidationSchema = Yup.object().shape({
  //   startDate: validDate("Start Date"),
  //   endDate: validDate("End Date"),
  startDate: validDate("Start Date").min(
    new Date(new Date().setHours(0, 0, 0, 0)),
    "Start Date cannot be in the past",
  ),
  endDate: validDate("End Date").min(
    Yup.ref("startDate"),
    "End Date cannot be before Start Date",
  ),
  reason: Yup.string().required("Reason is required"),
});

export const LeaveForm = ({
  leave,
  onSubmit,
  isSubmitting,
  onClose,
  onSuccess,
  isEdit = false,
}) => {
  const { user: currentUser, currSelectedSchool } = useContext(AuthContext);
  const [formInitialValues, setFormInitialValues] = useState(null);

  useEffect(() => {
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d)) return "";
      return d.toISOString().split("T")[0]; // Ensure YYYY-MM-DD format
    };

    setFormInitialValues({
      leaveId: leave?.leaveId || 0,
      reason: leave?.reason || "",
      startDate: formatDate(leave?.startDate),
      endDate: formatDate(leave?.endDate),
    });
  }, [leave]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateLeave(payload) : addLeave(payload),
    onSuccess: () => {
      toast.success(
        isEdit ? "Leave updated successfully" : "Leave created successfully",
      );
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  if (!formInitialValues) return <div>Loading...</div>;

  return (
    <BaseForm
      initialValues={formInitialValues}
      validationSchema={LeaveFormValidationSchema}
      validateOnBlur={true}
      onSubmit={(values) => {
        const payload = {
          ...values,
          createdBy: currentUser.userId,
          schoolId: currSelectedSchool,
        };
        mutation.mutate(payload);
      }}
      onClose={onClose}
      submitButtonText={isEdit ? "Update leave" : "Create leave"}
    >
      {(formik) => (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="startDate">Start Date</FormLabel>
              <FormInput
                id="startDate"
                name="startDate"
                type="date"
                {...formik.getFieldProps("startDate")}
              />
              {formik.touched.startDate && formik.errors.startDate && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.startDate}
                </div>
              )}
            </div>

            <div>
              <FormLabel htmlFor="endDate">End Date</FormLabel>
              <FormInput
                id="endDate"
                name="endDate"
                type="date"
                {...formik.getFieldProps("endDate")}
              />
              {formik.touched.endDate && formik.errors.endDate && (
                <div className="mt-1 text-left text-sm text-red-500">
                  {formik.errors.endDate}
                </div>
              )}
            </div>
          </div>

          <div>
            <FormLabel htmlFor="reason">Reason</FormLabel>
            <FormTextarea
              id="reason"
              name="reason"
              {...formik.getFieldProps("reason")}
            />
            {formik.touched.reason && formik.errors.reason && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.reason}
              </div>
            )}
          </div>
        </>
      )}
    </BaseForm>
  );
};
