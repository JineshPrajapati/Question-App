import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getDropdownData } from "../../../../api/services/utilityService";
import { dropdownConst } from "../../../../lib/dropdownConst";
import { AuthContext } from "../../../../contexts/authContext";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import {
  studentPersonalInfoFormValidationSchema,
  keyPressAddress,
  keyPressOnlyAlphabets,
  keyPressOnlyAlphabetsWithSpace,
  keyPressZipCode,
} from "../../form/validationSchema";
import { getSchoolGradeList } from "../../../../api/services/dropDownMasterService";

const jsonKey = "Students";

export const PersonalInfoForm = ({
  // personalInfo,
  handleNextStep,
  myDetails: personalInfo,
  validateErrors,
  handleSubmitForm,
  submitingData,
  myDetailsLoading,
  isView,
}) => {
  const {
    user: userData,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const [relationships, setRelationships] = useState([]);
  // const [guardianRelationships, setGuardianRelationships] = useState([]);
  const [grades, setGrades] = useState([]);

  const [isDataReady, setIsDataReady] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);

  const { data: dropdownData, isLoading: dropdownLoading } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () => getDropdownData(`${dropdownConst.RELATIONSHIP}`),
  });

  const { data: gradeData, isLoading: gradeLoading } = useQuery({
    queryKey: ["gradeData", userData.userId],
    queryFn: () =>
      getSchoolGradeList(
        userData.userId,
        currSelectedSchool,
        currSelectedAcademicYear,
      ),
  });

  const genderType = [
    { id: "M", label: "Male" },
    { id: "F", label: "Female" },
    { id: "O", label: "Other" },
  ];

  useEffect(() => {
    if (dropdownData?.isSuccess && gradeData?.isSuccess) {
      const relationships = dropdownData.options.filter(
        (option) => option.optionGroup === dropdownConst.RELATIONSHIP,
      );

      setRelationships(relationships);

      const relationshipId =
        relationships
          .find(
            (relationship) =>
              relationship.optionLabel === personalInfo?.userType,
          )
          ?.optionValue?.toString() || "";

      const grades = Array.isArray(gradeData.data?.data)
        ? gradeData.data.data.map((grade) => ({
            gradeId: grade.value,
            grade: grade.label,
          }))
        : [];

      setGrades(grades);

      // Set initial values
      const existingData = personalInfo?.[jsonKey]?.[0] ?? {};
      const initialValues = {
        studentNumber: existingData.StudentNumber ?? "",
        firstName: existingData.FirstName ?? "",
        lastName: existingData.LastName ?? "",
        dateOfBirth: existingData.DateOfBirth ?? "",
        gender: existingData.Gender ?? "",
        phoneNumber: existingData.PhoneNumber ?? "",
        emailAddress: existingData.EmailAddress ?? "",
        address: existingData.Address ?? "",
        city: existingData.City ?? "",
        state: existingData.State ?? "",
        pincode: existingData.Pincode ?? "",
        emergencyContactName: existingData.EmergencyContactName ?? "",
        relationship: existingData.Relationship ?? "",
        emergencyContactNumber: existingData.EmergencyContactNumber ?? "",
        nationality: existingData.Nationality ?? "",
        guardianName: existingData.GuardianName ?? "",
        guardianRelationship: existingData.GuardianRelationship ?? "",
        guardianPhoneNumber: existingData.GuardianPhoneNumber ?? "",
        gradeId: existingData.GradeId ?? "",
      };

      setFormInitialValues(initialValues);
      setIsDataReady(true);
    }
  }, [dropdownData, personalInfo, gradeData]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: studentPersonalInfoFormValidationSchema,
    // onSubmit: handleSubmitForm,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        StudentId: personalInfo?.[jsonKey]?.[0]
          ? personalInfo[jsonKey][0].StudentId
          : 0,
        StudentGuardianId: personalInfo?.[jsonKey]?.[0]
          ? personalInfo[jsonKey][0].StudentGuardianId
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
          <FormLabel htmlFor="studentNumber">Student Number</FormLabel>
          <FormInput
            id="studentNumber"
            name="studentNumber"
            disabled={isView}
            {...formik.getFieldProps("studentNumber")}
            onKeyPress={keyPressAddress}
          />
          {formik.touched.studentNumber && formik.errors.studentNumber && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.studentNumber}
            </div>
          )}
        </div>
        <div>
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <FormInput
            id="firstName"
            name="firstName"
            disabled={isView}
            {...formik.getFieldProps("firstName")}
            onKeyPress={keyPressOnlyAlphabets}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.firstName}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="lastName">Last Name</FormLabel>
          <FormInput
            id="lastName"
            name="lastName"
            disabled={isView}
            {...formik.getFieldProps("lastName")}
            onKeyPress={keyPressOnlyAlphabets}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.lastName}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
          <FormInput
            id="dateOfBirth"
            type="date"
            name="dateOfBirth"
            disabled={isView}
            {...formik.getFieldProps("dateOfBirth")}
            placeholder="MM-DD-YYYY"
            max={new Date().toISOString().split("T")[0]}
          />
          {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.dateOfBirth}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="gender">Gender</FormLabel>
          <FormSelect
            id="gender"
            name="gender"
            valueKey="id"
            labelKey="label"
            disabled={isView}
            options={[{ id: "", label: "Choose an option" }, ...genderType]}
            {...formik.getFieldProps("gender")}
          />
          {formik.touched.gender && formik.errors.gender && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.gender}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
          <FormInput
            id="phoneNumber"
            name="phoneNumber"
            disabled={isView}
            {...formik.getFieldProps("phoneNumber")}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              formik.setFieldValue("phoneNumber", val);
            }}
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.phoneNumber}
            </div>
          )}
        </div>
        <div>
          <FormLabel htmlFor="emailAddress">Email</FormLabel>
          <FormInput
            // disabled={isEdit}
            id="emailAddress"
            type="email"
            name="emailAddress"
            disabled={isView}
            {...formik.getFieldProps("emailAddress")}
          />
          {formik.touched.emailAddress && formik.errors.emailAddress && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.emailAddress}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="address">Address</FormLabel>
          <FormInput
            id="address"
            name="address"
            disabled={isView}
            {...formik.getFieldProps("address")}
            onKeyPress={keyPressAddress}
          />
          {formik.touched.address && formik.errors.address && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.address}
            </div>
          )}
        </div>
        <div>
          <FormLabel htmlFor="city">City</FormLabel>
          <FormInput
            id="city"
            name="city"
            disabled={isView}
            {...formik.getFieldProps("city")}
            onKeyPress={keyPressOnlyAlphabetsWithSpace}
          />
          {formik.touched.city && formik.errors.city && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.city}
            </div>
          )}
        </div>
        <div>
          <FormLabel htmlFor="state">State</FormLabel>
          <FormInput
            id="state"
            name="state"
            disabled={isView}
            {...formik.getFieldProps("state")}
            onKeyPress={keyPressOnlyAlphabetsWithSpace}
          />
          {formik.touched.state && formik.errors.state && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.state}
            </div>
          )}
        </div>
        <div>
          <FormLabel htmlFor="pincode">Zipcode</FormLabel>
          <FormInput
            id="pincode"
            name="pincode"
            disabled={isView}
            {...formik.getFieldProps("pincode")}
            onKeyPress={keyPressZipCode}
          />
          {formik.touched.pincode && formik.errors.pincode && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.pincode}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="nationality">Nationality</FormLabel>
          <FormInput
            id="nationality"
            name="nationality"
            disabled={isView}
            {...formik.getFieldProps("nationality")}
            onKeyPress={keyPressOnlyAlphabetsWithSpace}
          />
          {formik.touched.nationality && formik.errors.nationality && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.nationality}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="emergencyContactName">
            Emergency Contact Name
          </FormLabel>
          <FormInput
            id="emergencyContactName"
            name="emergencyContactName"
            disabled={isView}
            {...formik.getFieldProps("emergencyContactName")}
            onKeyPress={keyPressOnlyAlphabetsWithSpace}
          />
          {formik.touched.emergencyContactName &&
            formik.errors.emergencyContactName && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.emergencyContactName}
              </div>
            )}
        </div>

        <div>
          <FormLabel htmlFor="relationship">Relationship</FormLabel>
          <FormSelect
            id="relationship"
            name="relationship"
            disabled={isView}
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
        </div>

        <div>
          <FormLabel htmlFor="emergencyContactNumber">
            Emergency Contact Number
          </FormLabel>
          <FormInput
            id="emergencyContactNumber"
            name="emergencyContactNumber"
            disabled={isView}
            {...formik.getFieldProps("emergencyContactNumber")}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              formik.setFieldValue("emergencyContactNumber", val);
            }}
          />
          {formik.touched.emergencyContactNumber &&
            formik.errors.emergencyContactNumber && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.emergencyContactNumber}
              </div>
            )}
        </div>
        <div>
          <FormLabel htmlFor="gradeId">Grade</FormLabel>
          <FormSelect
            id="gradeId"
            name="gradeId"
            valueKey="gradeId"
            labelKey="grade"
            disabled={isView}
            options={[{ gradeId: "", grade: "Choose an option" }, ...grades]}
            {...formik.getFieldProps("gradeId")}
          />
          {formik.touched.gradeId && formik.errors.gradeId && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.gradeId}
            </div>
          )}
        </div>
      </div>
      {!isView && (
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
            {personalInfo?.[jsonKey]?.[0] &&
            personalInfo[jsonKey][0].StudentId != 0
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
      )}
    </form>
  );
};
