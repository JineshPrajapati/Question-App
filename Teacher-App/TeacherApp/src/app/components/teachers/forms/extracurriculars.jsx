import React, { useEffect, useState, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormInput, FormLabel, FormSelect } from "../../form/FormElements";
import { useQuery } from "@tanstack/react-query";
import { getDropdownData } from "../../../../api/services/utilityService";
import { dropdownConst } from "../../../../lib/dropdownConst";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AuthContext } from "../../../../contexts/authContext";
import { teacherExtracurricularsFormValidation } from "../../form/validationSchema";

const jsonKey = "TeacherCurricular";

const extracurricularSchema = Yup.object().shape({
  curricularType: Yup.string().required("Curricular Type is required"),
  curricularName: Yup.string().required("Curricular Name is required"),
  role: Yup.string().required("Role is required"),
  achievements: Yup.string().required("Achievements is required"),
  yearsInvolvement: Yup.number()
    .typeError("Years Of Experience must be a number")
    .required("Years Of Experience is required")
    .min(0, "Years Of Experience cannot be negative"),
});

export const Extracurriculars = ({
  handleNextStep,
  handleSubmitForm,
  myDetails: teacherDetails,
  submitingData,
  myDetailsLoading,
}) => {
  const { currSelectedSchool } = useContext(AuthContext);
  const [curricularTypes, setCurricularTypes] = useState([]);
  const [sportsRoles, setSportsRoles] = useState([]);
  const [clubRoles, setClubRoles] = useState([]);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [rolesOptions, setRolesOptions] = useState([]);

  const { data: dropdownData, isLoading: dropdownLoading } = useQuery({
    queryKey: ["dropdownData"],
    queryFn: () =>
      getDropdownData(
        `${dropdownConst.CURRICULAR_TYPE},${dropdownConst.TEACHER_EXTRACURRICULARS_SPORTS_ROLE},${dropdownConst.TEACHER_EXTRACURRICULARS_CLUB_ROLE}`,
      ),
  });

  // Setup dropdown options once dropdownData is fetched
  useEffect(() => {
    if (dropdownData?.isSuccess) {
      setCurricularTypes(
        dropdownData.options.filter(
          (option) => option.optionGroup === dropdownConst.CURRICULAR_TYPE,
        ),
      );
      setSportsRoles(
        dropdownData.options.filter(
          (option) =>
            option.optionGroup ===
            dropdownConst.TEACHER_EXTRACURRICULARS_SPORTS_ROLE,
        ),
      );
      setClubRoles(
        dropdownData.options.filter(
          (option) =>
            option.optionGroup ===
            dropdownConst.TEACHER_EXTRACURRICULARS_CLUB_ROLE,
        ),
      );

      // Initialize form values from teacherDetails
      const existingData = teacherDetails?.[jsonKey]?.[0] ?? {};

      setFormInitialValues({
        curricularType: existingData.CurricularType ?? "",
        curricularName: existingData.CurricularName ?? "",
        role: existingData.Role ?? "",
        achievements: existingData.Achievements ?? "",
        yearsInvolvement: existingData.YearsInvolvement ?? "",
      });

      setIsDataReady(true);
    }
  }, [dropdownData, teacherDetails]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues || {
      curricularType: "",
      curricularName: "",
      role: "",
      achievements: "",
      yearsInvolvement: "",
    },
    validationSchema: teacherExtracurricularsFormValidation,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        TeacherCurricularId: teacherDetails?.[jsonKey]?.[0]
          ? teacherDetails[jsonKey][0].TeacherCurricularId
          : 0,
        SchoolId: currSelectedSchool,
      };
      handleSubmitForm(updatedValues, jsonKey);
    },
  });

  useEffect(() => {
    if (clubRoles.length > 0) {
      const currentRolesOptions =
        formik.values.curricularType == 1
          ? sportsRoles
          : formik.values.curricularType == 2
            ? clubRoles
            : [];

      setRolesOptions(currentRolesOptions);
    }
  }, [formik.values.curricularType]);

  if (!isDataReady || myDetailsLoading || dropdownLoading) {
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
          <FormLabel htmlFor="curricularType">Curricular Type</FormLabel>
          <FormSelect
            id="curricularType"
            name="curricularType"
            options={[
              { optionValue: "", optionLabel: "Choose an option" },
              ...curricularTypes,
            ]}
            {...formik.getFieldProps("curricularType")}
          />
          {formik.touched.curricularType && formik.errors.curricularType && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.curricularType}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="curricularName">Curricular Name</FormLabel>
          <FormInput
            id="curricularName"
            name="curricularName"
            {...formik.getFieldProps("curricularName")}
          />
          {formik.touched.curricularName && formik.errors.curricularName && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.curricularName}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="role">Role</FormLabel>
          <FormSelect
            id="role"
            name="role"
            options={[
              { optionValue: "", optionLabel: "Choose an option" },
              ...rolesOptions,
            ]}
            {...formik.getFieldProps("role")}
          />
          {formik.touched.role && formik.errors.role && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.role}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="achievements">Achievements</FormLabel>
          <FormInput
            id="achievements"
            name="achievements"
            {...formik.getFieldProps("achievements")}
          />
          {formik.touched.achievements && formik.errors.achievements && (
            <div className="mt-1 text-left text-sm text-red-500">
              {formik.errors.achievements}
            </div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="yearsInvolvement">Years Involvement</FormLabel>
          <FormInput
            id="yearsInvolvement"
            name="yearsInvolvement"
            {...formik.getFieldProps("yearsInvolvement")}
            onKeyPress={(e) => {
              const allowedKeys = /^[0-9.]$/;
              const currentValue = e.currentTarget.value;

              if (
                !allowedKeys.test(e.key) ||
                (e.key === "." && currentValue.includes("."))
              ) {
                e.preventDefault();
              }
            }}
          />
          {formik.touched.yearsInvolvement &&
            formik.errors.yearsInvolvement && (
              <div className="mt-1 text-left text-sm text-red-500">
                {formik.errors.yearsInvolvement}
              </div>
            )}
        </div>
      </div>
      <div className="flex w-full justify-end gap-2">
        <button
          type="submit"
          disabled={submitingData}
          className="bg-primary flex gap-2 rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitingData && (
            <LoadingSpinner fullHeight={false} color="white" size={4} />
          )}
          {teacherDetails?.[jsonKey]?.[0]?.TeacherCurricularId
            ? "Update & Continue"
            : "Save & Continue"}
        </button>
      </div>
    </form>
  );
};
