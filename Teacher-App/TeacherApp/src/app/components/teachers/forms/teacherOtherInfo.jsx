import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getDropdownData } from "../../../../api/services/utilityService";
import { dropdownConst } from "../../../../lib/dropdownConst";
import { AuthContext } from "../../../../contexts/authContext";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { teacherOtherInfoFormValidation } from "../../form/validationSchema";

const jsonKey = "Teacher";

export const TeacherOtherInfo = ({
  teacherOtherInfo,
  handleNextStep,
  handleSubmitForm,
  myDetails: teacherDetails,
  submitingData,
  myDetailsLoading,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [relationships, setRelationships] = useState([]);

  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  const { data: dropdownData, isLoading: dropdownLoading } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () => getDropdownData(`${dropdownConst.RELATIONSHIP}`),
  });

  useEffect(() => {
    if (dropdownData?.isSuccess) {
      const relationships = dropdownData.options.filter(
        (option) => option.optionGroup === dropdownConst.RELATIONSHIP,
      );

      setRelationships(relationships);

      const relationshipId =
        relationships
          .find(
            (relationship) =>
              relationship.optionLabel === teacherDetails?.userType,
          )
          ?.optionValue?.toString() || "";

      // Set initial values
      const existingData = teacherDetails?.[jsonKey]?.[0] ?? {};

      const initialValues = {
        relationship: existingData.Relationship ?? "",
        nationality: existingData.Nationality ?? "",
        currentPosition: existingData.CurrentPosition ?? "",
        previousExperience: existingData.PreviousExperience ?? "",
      };

      setFormInitialValues(initialValues);
      setIsDataReady(true);
    }
  }, [dropdownData, teacherDetails]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: teacherOtherInfoFormValidation,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        TeacherId: teacherDetails?.[jsonKey]?.[0]
          ? teacherDetails[jsonKey][0].TeacherId
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
        {/* <div>
          <FormLabel htmlFor="relationship">Relationship</FormLabel>
          <FormSelect
            id="relationship"
            name="relationship"
            options={[
              { optionValue: "", optionLabel: "Choose an option" },
              ...relationships,
            ]}
            {...formik.getFieldProps("relationship")}
          />
          {formik.touched.relationship && formik.errors.relationship && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.relationship}
            </div>
          )}
        </div> */}
        <div>
          <FormLabel htmlFor="nationality">Nationality</FormLabel>
          <FormInput
            id="nationality"
            name="nationality"
            {...formik.getFieldProps("nationality")}
            onKeyPress={(e) => {
              const regex = /^[A-Za-z ]$/;
              if (!regex.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {formik.touched.nationality && formik.errors.nationality && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.nationality}
            </div>
          )}
        </div>
        <div>
          <FormLabel htmlFor="currentPosition">Current Position</FormLabel>
          <FormInput
            id="currentPosition"
            name="currentPosition"
            {...formik.getFieldProps("currentPosition")}
          />
          {formik.touched.currentPosition && formik.errors.currentPosition && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.currentPosition}
            </div>
          )}
        </div>
        {/* <div>
          <FormLabel htmlFor="previousExperience">
            Previous Experience
          </FormLabel>
          <FormInput
            id="previousExperience"
            name="previousExperience"
            {...formik.getFieldProps("previousExperience")}
          />
          {formik.touched.previousExperience &&
            formik.errors.previousExperience && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.previousExperience}
              </div>
            )}
        </div> */}
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
          teacherDetails[jsonKey][0].TeacherId != 0
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
