import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AuthContext } from "../../../../contexts/authContext";
import { teacherHealthInfoFormValidation } from "../../form/validationSchema";

const jsonKey = "TeacherHealthInfo";

const healthInfoSchema = Yup.object().shape({
  medicalCondition: Yup.string().required("Medical Condition is required"),
  primaryCarePhysician: Yup.string().required(
    "primary Care Physician is required",
  ),
  healthInsurance: Yup.string().required("Health Insurance is required"),
});

export const HealthInfo = ({
  handleNextStep,
  handleSubmitForm,
  myDetails: teacherDetails,
  submitingData,
  myDetailsLoading,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    // Set initial values
    const existingData = teacherDetails?.[jsonKey]?.[0] ?? {};

    const initialValues = {
      medicalCondition: existingData.MedicalCondition ?? "",
      primaryCarePhysician: existingData.PrimaryCarePhysician ?? "",
      healthInsurance: existingData.HealthInsurance ?? "",
    };

    setFormInitialValues(initialValues);
    setIsDataReady(true);
  }, [teacherDetails]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: teacherHealthInfoFormValidation,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        TeacherHealthInfoId: teacherDetails?.[jsonKey]?.[0]
          ? teacherDetails[jsonKey][0].TeacherHealthInfoId
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
          <FormLabel htmlFor="medicalCondition">Medical Condition</FormLabel>
          <FormInput
            id="medicalCondition"
            name="medicalCondition"
            {...formik.getFieldProps("medicalCondition")}
          />
          {formik.touched.medicalCondition &&
            formik.errors.medicalCondition && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.medicalCondition}
              </div>
            )}
        </div>

        <div>
          <FormLabel htmlFor="primaryCarePhysician">
            Primary Care Physician
          </FormLabel>
          <FormInput
            id="primaryCarePhysician"
            name="primaryCarePhysician"
            {...formik.getFieldProps("primaryCarePhysician")}
          />
          {formik.touched.primaryCarePhysician &&
            formik.errors.primaryCarePhysician && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.primaryCarePhysician}
              </div>
            )}
        </div>

        <div>
          <FormLabel htmlFor="healthInsurance">Health Insurance</FormLabel>
          <FormInput
            id="healthInsurance"
            name="healthInsurance"
            {...formik.getFieldProps("healthInsurance")}
          />
          {formik.touched.healthInsurance && formik.errors.healthInsurance && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.healthInsurance}
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
          teacherDetails[jsonKey][0].TeacherHealthInfoId != 0
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
