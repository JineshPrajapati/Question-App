import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AuthContext } from "../../../../contexts/authContext";
import { teacherCoursesFormValidation } from "../../form/validationSchema";
const jsonKey = "TeacherCourses";

const teacherCourseSchema = Yup.object().shape({
  courseCode: Yup.string().required("Course Code is required"),
  courseName: Yup.string().required("Course Name is required"),
});

export const TeacherCourses = ({
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
      courseCode: existingData.CourseCode ?? "",
      courseName: existingData.CourseName ?? "",
    };

    setFormInitialValues(initialValues);
    setIsDataReady(true);
  }, [teacherDetails]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues,
    validationSchema: teacherCoursesFormValidation,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        TeacherCoursesId: teacherDetails?.[jsonKey]?.[0]
          ? teacherDetails[jsonKey][0].TeacherCoursesId
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
          <FormLabel htmlFor="courseName">course Name</FormLabel>
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
          {teacherDetails?.[jsonKey]?.[0] &&
          teacherDetails[jsonKey][0].TeacherCoursesId != 0
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
