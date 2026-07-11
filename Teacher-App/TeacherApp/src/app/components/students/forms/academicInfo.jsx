import React, { useEffect, useState, useContext } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { getDropdownData } from "../../../../api/services/utilityService";
import { dropdownConst } from "../../../../lib/dropdownConst";
import { AuthContext } from "../../../../contexts/authContext";
import {
  studentGuardianFormValidationSchema,
  keyPressOnlyAlphabets,
} from "../../form/validationSchema";
import { Radio } from "lucide-react";

const jsonKey = "StudentGuardian";

export const AcademicInfo = ({
  handleSubmitForm,
  myDetails: gurdianInfo,
  submitingData,
  myDetailsLoading,
  isEdit = false,
  isView,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [relationships, setRelationships] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(null);

  const { data: dropdownData } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () => getDropdownData(`${dropdownConst.RELATIONSHIP}`),
  });

  useEffect(() => {
    const relationships = dropdownData.options.filter(
      (option) => option.optionGroup === dropdownConst.RELATIONSHIP,
    );
    setRelationships(relationships);

    const initialValues = {
      guardians: gurdianInfo?.[jsonKey]?.length
        ? gurdianInfo[jsonKey].map((g) => ({
            userId: g.UserId ?? 0,
            firstName: g.FirstName ?? "",
            lastName: g.LastName ?? "",
            guardianRelationship: g.GuardianRelationship
              ? g.GuardianRelationship.toString()
              : "",
            emailAddress: g.EmailAddress ?? "",
            guardianPhoneNumber: g.GuardianPhoneNumber ?? "",
            StudentGuardianId: g.StudentGuardianId ?? 0,
            primaryGuardianIndex: g.primaryGuardianIndex ?? false,
          }))
        : [
            {
              userId: 0,
              firstName: "",
              lastName: "",
              guardianRelationship: "",
              emailAddress: "",
              guardianPhoneNumber: "",
              StudentGuardianId: 0,
              primaryGuardianIndex: false,
            },
          ],
    };
    const defaultPrimaryIndex =
      gurdianInfo?.[jsonKey]?.length > 0
        ? gurdianInfo[jsonKey].findIndex(
            (g) =>
              g.primaryGuardianIndex === 0 ||
              g.primaryGuardianIndex === undefined,
          )
        : 0;
    setFormInitialValues({
      ...initialValues,
      primaryGuardianIndex:
        defaultPrimaryIndex === -1 ? 0 : defaultPrimaryIndex,
    });
    //setFormInitialValues(initialValues);
    setIsDataReady(true);
  }, [dropdownData, gurdianInfo]);

  const validationSchema = Yup.object({
    guardians: Yup.array().of(studentGuardianFormValidationSchema),
  });

  const formik = useFormik({
    initialValues: formInitialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        [jsonKey]: values.guardians.map((g) => ({
          ...g,
          SchoolId: currSelectedSchool,
        })),
      };

      handleSubmitForm(payload, jsonKey);
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
    <FormikProvider value={formik}>
      <form
        className="flex max-h-full flex-col gap-2"
        onSubmit={formik.handleSubmit}
      >
        <FieldArray name="guardians">
          {({ push, remove }) => (
            <>
              {formik?.values?.guardians.length > 0 &&
                formik.values.guardians.map((_, index) => (
                  <div
                    key={index}
                    className="relative mb-4 rounded-md border border-gray-400 bg-gray-50 p-4"
                  >
                    <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <FormLabel htmlFor={`guardians.${index}.firstName`}>
                          First Name
                        </FormLabel>
                        <FormInput
                          {...formik.getFieldProps(
                            `guardians.${index}.firstName`,
                          )}
                          disabled={isView}
                          onKeyPress={keyPressOnlyAlphabets}
                        />
                        {formik.touched.guardians?.[index]?.firstName &&
                          formik.errors.guardians?.[index]?.firstName && (
                            <div className="text-left text-sm text-red-500">
                              {formik.errors.guardians[index].firstName}
                            </div>
                          )}
                      </div>

                      <div>
                        <FormLabel htmlFor={`guardians.${index}.lastName`}>
                          Last Name
                        </FormLabel>
                        <FormInput
                          {...formik.getFieldProps(
                            `guardians.${index}.lastName`,
                          )}
                          disabled={isView}
                          onKeyPress={keyPressOnlyAlphabets}
                        />
                        {formik.touched.guardians?.[index]?.lastName &&
                          formik.errors.guardians?.[index]?.lastName && (
                            <div className="text-left text-sm text-red-500">
                              {formik.errors.guardians[index].lastName}
                            </div>
                          )}
                      </div>

                      <div>
                        <FormLabel htmlFor="guardianRelationship">
                          Contact Relationship
                        </FormLabel>
                        <FormSelect
                          id={`guardians.${index}.guardianRelationship`}
                          name={`guardians.${index}.guardianRelationship`}
                          disabled={isView}
                          options={[
                            {
                              optionValue: "",
                              optionLabel: "Choose an option",
                            },
                            ...relationships,
                          ]}
                          {...formik.getFieldProps(
                            `guardians.${index}.guardianRelationship`,
                          )}
                        />
                        {formik.touched.guardians?.[index]
                          ?.guardianRelationship &&
                          formik.errors.guardians?.[index]
                            ?.guardianRelationship && (
                            <div className="text-left text-sm text-red-500">
                              {
                                formik.errors.guardians[index]
                                  .guardianRelationship
                              }
                            </div>
                          )}
                      </div>
                      <div>
                        <FormLabel htmlFor={`guardians.${index}.emailAddress`}>
                          Email
                        </FormLabel>
                        <FormInput
                          disabled={
                            formik.values.guardians[index].StudentGuardianId !==
                              0 || isView
                          }
                          {...formik.getFieldProps(
                            `guardians.${index}.emailAddress`,
                          )}
                        />

                        {formik.touched.guardians?.[index]?.emailAddress &&
                          formik.errors.guardians?.[index]?.emailAddress && (
                            <div className="text-left text-sm text-red-500">
                              {formik.errors.guardians[index].emailAddress}
                            </div>
                          )}
                      </div>
                      <div>
                        <FormLabel
                          htmlFor={`guardians.${index}.guardianPhoneNumber`}
                        >
                          Phone Number
                        </FormLabel>
                        <FormInput
                          {...formik.getFieldProps(
                            `guardians.${index}.guardianPhoneNumber`,
                          )}
                          disabled={isView}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            formik.setFieldValue(
                              `guardians.${index}.guardianPhoneNumber`,
                              val,
                            );
                          }}
                        />
                        {formik.touched.guardians?.[index]
                          ?.guardianPhoneNumber &&
                          formik.errors.guardians?.[index]
                            ?.guardianPhoneNumber && (
                            <div className="text-left text-sm text-red-500">
                              {
                                formik.errors.guardians[index]
                                  .guardianPhoneNumber
                              }
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="absolute top-1 left-2 flex items-center">
                      <input
                        type="radio"
                        name="primaryGuardianIndex"
                        value={index}
                        checked={
                          formik.values.guardians[index].primaryGuardianIndex
                        }
                        disabled={isView}
                        onChange={() => {
                          formik.values.guardians.forEach((_, i) => {
                            formik.setFieldValue(
                              `guardians.${i}.primaryGuardianIndex`,
                              i === index,
                            );
                          });
                        }}
                      />
                      <span className="ml-2 text-sm">Default</span>
                    </div>
                    {!isView && formik.values.guardians.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 text-sm text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

              {!isView && (
                <button
                  type="button"
                  onClick={() =>
                    push({
                      UserId: 0,
                      firstName: "",
                      lastName: "",
                      guardianRelationship: "",
                      emailAddress: "",
                      guardianPhoneNumber: "",
                      StudentGuardianId: 0,
                    })
                  }
                  className="w-60 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  +Add Another Contact
                </button>
              )}
            </>
          )}
        </FieldArray>
        {!isView && (
          <div className="flex w-full justify-end">
            <button
              type="submit"
              disabled={submitingData}
              className="bg-primary flex gap-2 rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitingData && (
                <LoadingSpinner fullHeight={false} color="white" size={4} />
              )}
              Save & Finish
            </button>
          </div>
        )}
      </form>
    </FormikProvider>
  );
};

//v050akww

{
  /* <div>
          <FormLabel htmlFor="gradeLevel">Grade Level</FormLabel>
          <FormInput
            id="gradeLevel"
            name="gradeLevel"
            {...formik.getFieldProps("gradeLevel")}
          />
          {formik.touched.gradeLevel && formik.errors.gradeLevel && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.gradeLevel}
            </div>
          )}
        </div>
        <div>
          <FormLabel htmlFor="major">Major</FormLabel>
          <FormInput
            id="major"
            name="major"
            {...formik.getFieldProps("major")}
          />
          {formik.touched.major && formik.errors.major && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.major}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="enrollmentStatus">Enrollment Status</FormLabel>
          <FormSelect
            id="enrollmentStatus"
            name="enrollmentStatus"
            options={[
              { optionValue: "", optionLabel: "Choose an option" },
              ...enrollmentStatuses,
            ]}
            {...formik.getFieldProps("enrollmentStatus")}
          />
          {formik.touched.enrollmentStatus &&
            formik.errors.enrollmentStatus && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.enrollmentStatus}
              </div>
            )}
        </div> */
}
{
  /* 
        <div>
          <FormLabel htmlFor="enrollmentStatus">Enrollment Status</FormLabel>
          <FormInput
            id="enrollmentStatus"
            name="enrollmentStatus"
            {...formik.getFieldProps("enrollmentStatus")}
          />
          {formik.touched.enrollmentStatus &&
            formik.errors.enrollmentStatus && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.enrollmentStatus}
              </div>
            )}
        </div> */
}
{
  /* <div>
          <FormLabel htmlFor="academicStanding">Academic Standing</FormLabel>
          <FormInput
            id="academicStanding"
            name="academicStanding"
            {...formik.getFieldProps("academicStanding")}
          />
          {formik.touched.academicStanding &&
            formik.errors.academicStanding && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.academicStanding}
              </div>
            )}
        </div>

        <div>
          <FormLabel htmlFor="expectedGraduation">
            Expected Graduation
          </FormLabel>
          <FormInput
            id="expectedGraduation"
            type="date"
            name="expectedGraduation"
            {...formik.getFieldProps("expectedGraduation")}
            placeholder="MM-DD-YYYY"
          />
          {formik.touched.expectedGraduation &&
            formik.errors.expectedGraduation && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.expectedGraduation}
              </div>
            )}
        </div>
        <div>
          <FormLabel htmlFor="transcript">Transcript</FormLabel>
          <FormInput
            id="transcript"
            name="transcript"
            {...formik.getFieldProps("transcript")}
          />
          {formik.touched.transcript && formik.errors.transcript && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.transcript}
            </div>
          )}
        </div> */
}
