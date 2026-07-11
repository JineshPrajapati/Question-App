import React, { useEffect, useState, useContext } from "react";
import { BaseForm } from "../common/BaseForm";
import { useMutation, useQuery } from "@tanstack/react-query";

import { FormInput, FormLabel, MultiSelect } from "../form/FormElements";
import { useFormik } from "formik";
import {
  getUserDropdownList,
  getSubjectDropdown,
  getSchoolGradeList,
} from "../../../api/services/dropDownMasterService";
import { AuthContext } from "../../../contexts/authContext";

export const LessonPlanFilterForm = ({
  onClose,
  onSuccess,
  isAllLessonPlans = false,
  setTableConfig,
  setFilterCount,
  filterCount,
  tableConfig,
}) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjectTypes] = useState([]);

  const [teachers, setTeachers] = useState([]);

  const {
    user: userData,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  const { data: gradeDropdownData } = useQuery({
    queryKey: ["gradeDropdownData"],
    queryFn: () =>
      getSchoolGradeList(
        userData.userId,
        currSelectedSchool,
        currSelectedAcademicYear,
      ),
  });

  const { data: SubjectdropdownData } = useQuery({
    queryKey: ["SubjectdropdownData"],
    queryFn: () => getSubjectDropdown(userData.userId, currSelectedSchool),
  });

  const { data: TeachersdropdownData } = useQuery({
    queryKey: ["TeachersdropdownData"],
    queryFn: () => getUserDropdownList(userData.userId, 16),
  });

  useEffect(() => {
    if (gradeDropdownData || SubjectdropdownData || TeachersdropdownData) {
      setGrades(gradeDropdownData?.data?.data ?? []);
      setSubjectTypes(SubjectdropdownData?.data?.data ?? []);
      setTeachers(TeachersdropdownData?.data?.data ?? []);

      setFormInitialValues({
        grade: tableConfig?.gradeIds ? tableConfig.gradeIds.split(",") : [],
        subject: tableConfig?.subjectIds
          ? tableConfig.subjectIds.split(",")
          : [],
        teacher: tableConfig?.teacherIds
          ? tableConfig.teacherIds.split(",")
          : [],
        startDate: tableConfig?.startDate ?? "",
        endDate: tableConfig?.endDate ?? "",
      });
    }
  }, [
    gradeDropdownData,
    SubjectdropdownData,
    TeachersdropdownData,
    tableConfig,
  ]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formInitialValues ?? {
      grade: [],
      subject: [],
      teacher: [],
      startDate: "",
      endDate: "",
    },
    onSubmit: (values) => {
      const payload = {
        gradeIds: values.grade.join(","),
        subjectIds: values.subject.join(","),
        teacherIds: values.teacher.join(","),
        startDate: values.startDate,
        endDate: values.endDate,
      };
      setTableConfig((prev) => ({ ...prev, ...payload }));
      onClose();
    },
  });
  const getFilterCount = () => {
    let count = 0;
    const { values } = formik;

    if (values.grade?.length > 0) count++;
    if (values.subject?.length > 0) count++;
    if (values.teachers?.length > 0) count++;
    if (values.startDate != "") count++;
    if (values.endDate != "") count++;
    if (selectedFilters.length) count++;
    return count;
  };
  useEffect(() => {
    let count = 0;
    const { values } = formik;

    if (values.grade?.length > 0) count++;
    if (values.subject?.length > 0) count++;
    if (values.teacher?.length > 0) count++;
    if (values.startDate != "") count++;
    if (values.endDate != "") count++;
    if (selectedFilters.length) count++;
    setFilterCount(count);
  }, [formik.values]);

  const handleClearAll = () => {
    formik.resetForm();
    setSelectedFilters([]);

    setTableConfig({
      pageNumber: 1,
      pageSize: 10,
      search: "",
      activeOnly: -1,
      sortBy: "",
      sortDirection: "DESC",
      schoolId: currSelectedSchool,
      academicYearId: currSelectedAcademicYear,
      UserId: userData.userId,
      gradeIds: "",
      subjectIds: "",
      teacherIds: "",
      startDate: null,
      endDate: null,
    });
  };

  if (!formInitialValues) return null;

  return (
    <BaseForm
      initialValues={formik.initialValues}
      onSubmit={formik.handleSubmit}
      onClose={onClose}
      onSuccess={onSuccess}
    >
      <>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Active Filters: <span className="font-semibold">{filterCount}</span>
          </div>
          <button
            type="button"
            className="ml-2 rounded bg-gray-200 px-4 py-1 text-sm"
            onClick={handleClearAll}
          >
            Clear all filters
          </button>
        </div>

        <div className="mt-4">
          <FormLabel htmlFor="grade">Grade</FormLabel>
          <MultiSelect
            name="grade"
            options={grades.map((group) => ({
              label: group.label,
              value: group.value,
            }))}
            value={formik.values.grade}
            formik={formik}
            labelledBy="Select"
            overrideStrings={{ selectSomeItems: "Choose grades" }}
          />
        </div>

        <div className="mt-4">
          <FormLabel htmlFor="subject">Subject</FormLabel>
          <MultiSelect
            name="subject"
            options={subjects}
            value={formik.values.subject}
            formik={formik}
            labelledBy="Select"
            overrideStrings={{ selectSomeItems: "Choose subject" }}
          />
        </div>

        <div className="mt-4">
          <FormLabel htmlFor="teacher">Teacher</FormLabel>
          <MultiSelect
            name="teacher"
            options={teachers}
            value={formik.values.teacher}
            formik={formik}
            labelledBy="Select"
            overrideStrings={{ selectSomeItems: "Choose teachers" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FormLabel htmlFor="startDate">From Date</FormLabel>
            <FormInput
              id="startDate"
              type="date"
              name="startDate"
              value={formik.values.startDate}
              onChange={formik.handleChange}
            />
          </div>

          <div>
            <FormLabel htmlFor="endDate">To Date</FormLabel>
            <FormInput
              id="endDate"
              type="date"
              name="endDate"
              value={formik.values.endDate}
              onChange={formik.handleChange}
            />
          </div>
        </div>
      </>
    </BaseForm>
  );
};
