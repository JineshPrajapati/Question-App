import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";

//No NEED THIS PAGE

export const StudentGuardian = ({ validateErrors, handleSubmitForm }) => {
  const studentGuardianSchema = Yup.object().shape({
    guardianName: Yup.string().required("Guardian Name is required"),
    guardianRelationship: Yup.string().required("Relationship is required"),
    guardianPhoneNumber: Yup.string()
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits")
      .required("Phone Number is required"),
  });

  const formik = useFormik({
    initialValues: {
      guardianName: "",
      guardianRelationship: "",
      guardianPhoneNumber: "",
    },
    validationSchema: studentGuardianSchema,
    onSubmit: handleSubmitForm,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <FormLabel htmlFor="guardianName">Guardian Name</FormLabel>
          <FormInput
            id="guardianName"
            name="guardianName"
            {...formik.getFieldProps("guardianName")}
          />
          {formik.touched.guardianName && formik.errors.guardianName && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.guardianName}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="guardianRelationship">Relationship</FormLabel>
          <FormInput
            id="guardianRelationship"
            name="guardianRelationship"
            {...formik.getFieldProps("guardianRelationship")}
          />
          {formik.touched.guardianRelationship &&
            formik.errors.guardianRelationship && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.guardianRelationship}
              </div>
            )}
        </div>

        <div>
          <FormLabel htmlFor="guardianPhoneNumber">Phone Number</FormLabel>
          <FormInput
            id="guardianPhoneNumber"
            name="guardianPhoneNumber"
            {...formik.getFieldProps("guardianPhoneNumber")}
          />
          {formik.touched.guardianPhoneNumber &&
            formik.errors.guardianPhoneNumber && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.guardianPhoneNumber}
              </div>
            )}
        </div>
      </div>

      {/* <div className="mt-6">
        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-white"
        >
          Submit
        </button>
      </div> */}
    </form>
  );
};
