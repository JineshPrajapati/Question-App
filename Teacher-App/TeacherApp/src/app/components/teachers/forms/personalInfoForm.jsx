import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FormInput,
  FormLabel,
  FormSelect,
  MultiSelect,
} from "../../form/FormElements";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AuthContext } from "../../../../contexts/authContext";
import {
  teacherPersonalInfoFormValidation,
  keyPressOnlyAlphabets,
  keyPressAddress,
} from "../../form/validationSchema";
import { getLocationDropdown } from "../../../../api/services/dropDownMasterService";

const jsonKey = "Users";

export const PersonalInfoForm = ({
  personalInfo,
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
  const genderType = [
    { id: "M", label: "Male" },
    { id: "F", label: "Female" },
    { id: "O", label: "Other" },
  ];
  const existingData = teacherDetails?.[jsonKey]?.[0] ?? {};
  const [preferredSchoolId, setPreferredSchoolId] = useState("");
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [selectedSchoolAddress, setSelectedSchoolAddress] = useState(null);
  useEffect(() => {
    {
      // Set initial values
      const initialValues = {
        firstName: existingData.FirstName ?? "",
        lastName: existingData.LastName ?? "",
        dateOfBirth: existingData.DateofBirth ?? "",
        gender: existingData.Gender ?? "",
        phoneNumber: existingData.PhoneNumber ?? "",
        emailAddress: existingData.EmailAddress ?? "",
        UserType: 1,
      };
      if (existingData.Address) {
        try {
          const parsed = Array.isArray(existingData.Address)
            ? existingData.Address
            : JSON.parse(existingData.Address);

          const options = parsed.map((addr, index) => ({
            value: index.toString(),
            label: addr.Name, // ✅ School Name
            ...addr,
          }));
          setSchoolOptions(options);

          // Auto-select if only one
          if (options.length === 1) {
            setPreferredSchoolId(options[0].value);
            setSelectedSchoolAddress(options[0]);
          }
        } catch (err) {
          console.error("Invalid Address JSON:", err);
        }
      }

      setFormInitialValues(initialValues);
      setIsDataReady(true);
    }
  }, [teacherDetails]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: teacherPersonalInfoFormValidation,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        UserId: teacherDetails?.[jsonKey]?.[0]
          ? teacherDetails[jsonKey][0].UserId
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
          <FormLabel htmlFor="gender">Gender</FormLabel>
          <FormSelect
            id="gender"
            name="gender"
            valueKey="id"
            labelKey="label"
            options={[{ id: "", label: "Choose an option" }, ...genderType]}
            disabled={isView}
            {...formik.getFieldProps("gender")}
          />
          {formik.touched.gender && formik.errors.gender && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.gender}
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

        {isView && (
          <>
            <div>
              <FormLabel htmlFor="preferredSchool">Preferred School</FormLabel>
              <FormSelect
                id="preferredSchool"
                name="preferredSchool"
                valueKey="value"
                labelKey="label"
                options={[
                  { value: "", label: "Choose a School" },
                  ...schoolOptions,
                ]}
                value={preferredSchoolId}
                onChange={(e) => {
                  const val = e.target.value;
                  setPreferredSchoolId(val);
                  const selected = schoolOptions.find((s) => s.value === val);
                  setSelectedSchoolAddress(selected || null);
                }}
              />
            </div>

            {selectedSchoolAddress && (
              <>
                <div>
                  <FormLabel>Address</FormLabel>
                  <FormInput value={selectedSchoolAddress.Address} disabled />
                </div>
                <div>
                  <FormLabel>State</FormLabel>
                  <FormInput value={selectedSchoolAddress.StateName} disabled />
                </div>
                <div>
                  <FormLabel>District</FormLabel>
                  <FormInput
                    value={selectedSchoolAddress.DistrictName}
                    disabled
                  />
                </div>
                <div>
                  <FormLabel>City</FormLabel>
                  <FormInput value={selectedSchoolAddress.CityName} disabled />
                </div>
                <div>
                  <FormLabel>Zip Code</FormLabel>
                  <FormInput value={selectedSchoolAddress.ZipCode} disabled />
                </div>
              </>
            )}
          </>
        )}
      </div>
      {!isView && (
        <div className="flex w-full justify-end gap-2">
          <button
            type="submit"
            // disabled={submitingData}
            className="bg-primary flex gap-2 rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitingData && (
              <LoadingSpinner fullHeight={false} color="white" size={4} />
            )}
            {teacherDetails?.[jsonKey]?.[0] &&
            teacherDetails[jsonKey][0].UserId != 0
              ? "Update & Continue"
              : "Save & Continue"}
          </button>
        </div>
      )}
    </form>
  );
};
