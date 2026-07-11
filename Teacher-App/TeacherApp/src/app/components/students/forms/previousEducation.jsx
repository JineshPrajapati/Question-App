import React, { useEffect, useState, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AuthContext } from "../../../../contexts/authContext";
import { studentPreviousEducationFormValidationSchema } from "../../form/validationSchema";
const jsonKey = "StudentPreviousEducation";

// const previousEducationSchema = Yup.object().shape({
//   schoolName: Yup.string().required("School Name is required"),
//   degreeEarned: Yup.string().required("Degree Earned is required"),
//   completionYear: Yup.number()
//     .typeError("Completion Year must be a number")
//     .min(1900, "Year must be valid")
//     .max(new Date().getFullYear(), "Year cannot be in the future")
//     .required("Completion Year is required"),
// });

export const PreviousEducation = ({
  validateErrors,
  handleSubmitForm,
  myDetails: studentDetails,
  submitingData,
  myDetailsLoading,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: studentPreviousEducationFormValidationSchema,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        completionYear: Number(values.completionYear), // Ensure it's sent as a number
        StudentPreviousEducationId: studentDetails?.[jsonKey]?.[0]
          ? studentDetails[jsonKey][0].StudentPreviousEducationId
          : 0,
        SchoolId: currSelectedSchool,
      };
      handleSubmitForm(updatedValues, jsonKey);
    },
  });
  useEffect(() => {
    // Set initial values
    const existingData = studentDetails?.[jsonKey]?.[0] ?? {};

    const initialValues = {
      schoolName: existingData.SchoolName ?? "",
      degreeEarned: existingData.DegreeEarned ?? "",
      completionYear: existingData.CompletionYear ?? "",
    };

    setFormInitialValues(initialValues);
    setIsDataReady(true);
  }, [studentDetails]);
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
          <FormLabel htmlFor="schoolName">School Name</FormLabel>
          <FormInput
            id="schoolName"
            name="schoolName"
            {...formik.getFieldProps("schoolName")}
          />
          {formik.touched.schoolName && formik.errors.schoolName && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.schoolName}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="degreeEarned">Degree Earned</FormLabel>
          <FormInput
            id="degreeEarned"
            name="degreeEarned"
            {...formik.getFieldProps("degreeEarned")}
          />
          {formik.touched.degreeEarned && formik.errors.degreeEarned && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.degreeEarned}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="completionYear">Completion Year</FormLabel>
          <FormInput
            id="completionYear"
            name="completionYear"
            {...formik.getFieldProps("completionYear")}
          />
          {formik.touched.completionYear && formik.errors.completionYear && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.completionYear}
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
          {studentDetails?.[jsonKey]?.[0] &&
          studentDetails[jsonKey][0].StudentPreviousEducationId != 0
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
