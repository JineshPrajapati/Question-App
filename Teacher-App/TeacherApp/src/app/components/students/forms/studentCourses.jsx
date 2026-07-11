import React, { useEffect, useState, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AuthContext } from "../../../../contexts/authContext";
import { studentCoursesFormValidationSchema } from "../../form/validationSchema";

const jsonKey = "StudentCourse";

export const StudentCourses = ({
  validateErrors,
  handleSubmitForm,
  myDetails: courseInfo,
  submitingData,
  myDetailsLoading,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: studentCoursesFormValidationSchema,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        StudentCoursesId: courseInfo?.[jsonKey]?.[0]
          ? courseInfo[jsonKey][0].StudentCoursesId
          : 0,
        SchoolId: currSelectedSchool,
      };
      handleSubmitForm(updatedValues, jsonKey);
    },
  });
  useEffect(() => {
    // Set initial values
    const existingData = courseInfo?.[jsonKey]?.[0] ?? {};

    const initialValues = {
      courseCode: existingData.CourseCode ?? "",
      courseName: existingData.CourseName ?? "",
    };

    setFormInitialValues(initialValues);
    setIsDataReady(true);
  }, [courseInfo]);
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
          <FormLabel htmlFor="courseCode">Course Code</FormLabel>
          <FormInput
            id="courseCode"
            name="courseCode"
            {...formik.getFieldProps("courseCode")}
          />
          {formik.touched.courseCode && formik.errors.courseCode && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.courseCode}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="courseName">Course Name</FormLabel>
          <FormInput
            id="courseName"
            name="courseName"
            {...formik.getFieldProps("courseName")}
          />
          {formik.touched.courseName && formik.errors.courseName && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.courseName}
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
          {courseInfo?.[jsonKey]?.[0] &&
          courseInfo[jsonKey][0].StudentCoursesId != 0
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
