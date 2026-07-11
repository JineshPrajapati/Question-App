import React, { useEffect, useState, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AuthContext } from "../../../../contexts/authContext";
import { studentHealthInfoFormValidationSchema } from "../../form/validationSchema";

const jsonKey = "StudentHealthInfo";

// const studentHealthInfochema = Yup.object().shape({
//   medications: Yup.string().required("Medications information is required"),
//   physicianName: Yup.string().required("Physician Name is required"),
//   disabilityInfo: Yup.string().required("Disability Info is required"),
// });

export const StudentHealthInfo = ({
  validateErrors,
  handleSubmitForm,
  myDetails: studentDetails,
  submitingData,
  myDetailsLoading,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    // Set initial values
    const existingData = studentDetails?.[jsonKey]?.[0] ?? {};

    const initialValues = {
      medications: existingData.Medications ?? "",
      physicianName: existingData.PhysicianName ?? "",
      disabilityInfo: existingData.DisabilityInfo ?? "",
    };

    setFormInitialValues(initialValues);
    setIsDataReady(true);
  }, [studentDetails]);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: studentHealthInfoFormValidationSchema,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        StudentHealthInfoId: studentDetails?.[jsonKey]?.[0]
          ? studentDetails[jsonKey][0].StudentHealthInfoId
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
          <FormLabel htmlFor="medications">Medications</FormLabel>
          <FormInput
            id="medications"
            name="medications"
            {...formik.getFieldProps("medications")}
          />
          {formik.touched.medications && formik.errors.medications && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.medications}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="physicianName">Physician Name</FormLabel>
          <FormInput
            id="physicianName"
            name="physicianName"
            {...formik.getFieldProps("physicianName")}
          />
          {formik.touched.physicianName && formik.errors.physicianName && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.physicianName}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="disabilityInfo">Disability Info</FormLabel>
          <FormInput
            id="disabilityInfo"
            name="disabilityInfo"
            {...formik.getFieldProps("disabilityInfo")}
          />
          {formik.touched.disabilityInfo && formik.errors.disabilityInfo && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.disabilityInfo}
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
          studentDetails[jsonKey][0].StudentHealthInfoId != 0
            ? "Update"
            : "Save & Finish"}
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
