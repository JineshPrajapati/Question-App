import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getDropdownData } from "../../../../api/services/utilityService";
import { dropdownConst } from "../../../../lib/dropdownConst";
import { AuthContext } from "../../../../contexts/authContext";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { teacherAcademicInfoFormValidation } from "../../form/validationSchema";

const jsonKey = "TeacherAcademic";

export const AcademicInfo = ({
  handleNextStep,
  handleSubmitForm,
  myDetails: teacherDetails,
  submitingData,
  myDetailsLoading,
  isView,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    {
      const existingData = teacherDetails?.[jsonKey]?.[0] ?? {};

      const initialValues = {
        qualifications: existingData.Qualifications ?? "",
        teachingCredentials: existingData.TeachingCredentials ?? "",
        subjectExpertise: existingData.SubjectExpertise ?? "",
        yearsOfExperience: existingData.YearsOfExperience ?? "",
        professionalDevelopment: existingData.ProfessionalDevelopment ?? "",
        academicAchievements: existingData.AcademicAchievements ?? "",
        currentPosition: existingData.CurrentPosition ?? "",
      };

      setFormInitialValues(initialValues);
      setIsDataReady(true);
    }
  }, [teacherDetails]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: teacherAcademicInfoFormValidation,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        TeacherAcademicId: teacherDetails?.[jsonKey]?.[0]
          ? teacherDetails[jsonKey][0].TeacherAcademicId
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
          <FormLabel htmlFor="qualifications">Qualifications</FormLabel>
          <FormInput
            id="qualifications"
            name="qualifications"
            disabled={isView}
            {...formik.getFieldProps("qualifications")}
          />
          {formik.touched.qualifications && formik.errors.qualifications && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.qualifications}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="subjectExpertise">Subject Expertise</FormLabel>
          <FormInput
            id="subjectExpertise"
            name="subjectExpertise"
            disabled={isView}
            {...formik.getFieldProps("subjectExpertise")}
          />
          {formik.touched.subjectExpertise &&
            formik.errors.subjectExpertise && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.subjectExpertise}
              </div>
            )}
        </div>
        <div>
          <FormLabel htmlFor="currentPosition">Current Position</FormLabel>
          <FormInput
            id="currentPosition"
            name="currentPosition"
            disabled={isView}
            {...formik.getFieldProps("currentPosition")}
          />
          {formik.touched.currentPosition && formik.errors.currentPosition && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.currentPosition}
            </div>
          )}
        </div>
      </div>
      {!isView && (
        <div className="flex w-full justify-end gap-2">
          <button
            type="submit"
            disabled={submitingData}
            className="bg-primary flex gap-2 rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitingData && (
              <LoadingSpinner fullHeight={false} color="white" size={4} />
            )}
            {teacherDetails?.[jsonKey]?.[0] &&
            teacherDetails[jsonKey][0].TeacherAcademicId != 0
              ? "Update & Continue"
              : "Save & Continue"}
          </button>
        </div>
      )}
    </form>
  );
};
