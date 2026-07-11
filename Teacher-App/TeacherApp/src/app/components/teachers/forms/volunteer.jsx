import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getDropdownData } from "../../../../api/services/utilityService";
import { dropdownConst } from "../../../../lib/dropdownConst";
import { AuthContext } from "../../../../contexts/authContext";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { teacherVolunteerFormValidation } from "../../form/validationSchema";

const jsonKey = "TeacherVolunteer";

const volunteerSchema = Yup.object().shape({
  activityName: Yup.string().required("Activityn Name is required"),
  organizationName: Yup.string().required("Organization Name is required"),
  role: Yup.string().required("Role is required"),
  durationMonths: Yup.string()
    .required("Duration Months is required")
    .matches(/^\d+$/, "Duration Months must be digits only"),
  impact: Yup.string().required("Impact is required"),
});

export const Volunteer = ({
  handleNextStep,
  handleSubmitForm,
  myDetails: teacherDetails,
  submitingData,
  myDetailsLoading,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  const { data: dropdownData, isLoading: dropdownLoading } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () => getDropdownData(`${dropdownConst.TEACHER_VOLUNTEER_ROLE}`),
  });

  useEffect(() => {
    if (dropdownData?.isSuccess) {
      const roles = dropdownData.options.filter(
        (option) => option.optionGroup === dropdownConst.TEACHER_VOLUNTEER_ROLE,
      );

      setRoles(roles);

      const roleId =
        roles
          .find((role) => role.optionLabel === teacherDetails?.userType)
          ?.optionValue?.toString() || "";

      // Set initial values
      const existingData = teacherDetails?.[jsonKey]?.[0] ?? {};

      const initialValues = {
        activityName: existingData.ActivityName ?? "",
        organizationName: existingData.OrganizationName ?? "",
        role: existingData.Role ?? "",
        durationMonths: existingData.DurationMonths ?? "",
        impact: existingData.Impact ?? "",
      };

      setFormInitialValues(initialValues);
      setIsDataReady(true);
    }
  }, [dropdownData, teacherDetails]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: teacherVolunteerFormValidation,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        TeacherVolunteerId: teacherDetails?.[jsonKey]?.[0]
          ? teacherDetails[jsonKey][0].TeacherVolunteerId
          : 0,
        SchoolId: currSelectedSchool,
      };
      handleSubmitForm(updatedValues, jsonKey);
    },
  });

  if (!isDataReady || myDetailsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form
      className="flex max-h-full flex-col gap-2 overflow-hidden"
      onSubmit={formik.handleSubmit}
    >
      <div className="grid h-full flex-1 grid-cols-1 gap-6 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <FormLabel htmlFor="activityName">Activity Name</FormLabel>
          <FormInput
            id="activityName"
            name="activityName"
            {...formik.getFieldProps("activityName")}
          />
          {formik.touched.activityName && formik.errors.activityName && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.activityName}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="organizationName">Organization Name</FormLabel>
          <FormInput
            id="organizationName"
            name="organizationName"
            {...formik.getFieldProps("organizationName")}
          />
          {formik.touched.organizationName &&
            formik.errors.organizationName && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.organizationName}
              </div>
            )}
        </div>

        <div>
          <FormLabel htmlFor="role">Role</FormLabel>
          <FormSelect
            id="role"
            name="role"
            options={[
              { optionValue: "", optionLabel: "Choose an option" },
              ...roles,
            ]}
            {...formik.getFieldProps("role")}
          />
          {formik.touched.role && formik.errors.role && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.role}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="durationMonths">Duration Months</FormLabel>
          <FormInput
            id="durationMonths"
            name="durationMonths"
            {...formik.getFieldProps("durationMonths")}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {formik.touched.durationMonths && formik.errors.durationMonths && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.durationMonths}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="impact">Impact</FormLabel>
          <FormInput
            id="impact"
            name="impact"
            {...formik.getFieldProps("impact")}
          />
          {formik.touched.impact && formik.errors.impact && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.impact}
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full justify-end gap-2">
        {/* <button
                    type="submit"
                    className="rounded bg-primary px-4 py-2 text-white"
                  >
                    Submit
                  </button> */}
        <button
          type="submit"
          disabled={submitingData}
          className="bg-primary flex gap-2 rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitingData && (
            <LoadingSpinner fullHeight={false} color="white" size={4} />
          )}
          {teacherDetails?.[jsonKey]?.[0] &&
          teacherDetails[jsonKey][0].TeacherVolunteerId != 0
            ? "Update & Continue"
            : "Save & Continue"}
        </button>
        {/* <button
                    onClick={handleNextStep}
                    className="bg-primary rounded px-4 py-2 text-white"
                  >
                    Next
                  </button> */}
      </div>
    </form>
  );
};
