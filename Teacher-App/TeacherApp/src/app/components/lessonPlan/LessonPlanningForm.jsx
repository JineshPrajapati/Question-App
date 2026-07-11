import React, { useContext, useEffect, useState } from "react";

import { Button } from "../ui/Button";
import * as Yup from "yup";
import { TextField, MenuItem } from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MainLayout } from "../../layouts/MainLayout";

import { toast } from "react-toastify";
import {
  getGradeSubject,
  generateLessonPlan,
  getWeekNumberForLessonPlan,
} from "../../../api/services/lessonPlanService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";
import { useFormik } from "formik";

import { LessonPlanEditor } from "./LessonPlanEditor";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { SparklesIcon } from "@heroicons/react/24/outline";

export const LessonPlanningForm = () => {
  const [showLessonEditor, setShowLessonEditor] = useState(false);
  const {
    user: currentUser,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [weekList, setWeekList] = useState([]);
  const [generatingLessonPlan, setGeneratingLessonPlan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [gradeSubjectList, setGradeSubjectList] = useState([]);
  const [lessonPlanData, setLessonPlanData] = useState(null);
  const [formData, setFormData] = useState({
    gradeId: 0,
    schoolId: parseInt(currSelectedSchool || ""),
    subjectId: 0,
    academicYearId: parseInt(currSelectedAcademicYear || ""),
    userIdentityKey: currentUser.userId || "",
    userId: currentUser.userId || "",
    lessonFormat: "",
    lessonDate: "",
    weekNumber: "",
    startDate: "",
    endDate: "",
    planTimeline: "",
    dateRange: {
      type: "this_month", // or 'custom'
      startDate: null,
      endDate: null,
    },
    lessonData: {
      Date: "",
      ChapterNo: 1,
      Domain: "",
      Title: "",
      Content: "",
      KeyTopics: [""],
      Standards: "",
      Activities: [""],
      Assessments: [""],
      Material: [""],
    },
  });

  const { data: gradeSubjectData } = useQuery({
    queryKey: [
      "gradeSubjectData",
      currSelectedSchool,
      currSelectedAcademicYear,
    ],
    queryFn: () =>
      getGradeSubject({
        academicYearId: parseInt(currSelectedAcademicYear),
        gradeId: 0,
        UserIdentityKey: currentUser.userId || "",
        schoolId: parseInt(currSelectedSchool || 0),
      }),
  });

  const {
    data: periodListData,
    isLoading: periodListDataLoading,
    refetch: refetchPeriodList,
  } = useQuery({
    queryKey: [
      "periodListData",
      currSelectedSchool,
      currSelectedAcademicYear,
      formData.gradeId,
      formData.subjectId,
    ],
    queryFn: () =>
      getWeekNumberForLessonPlan({
        academicYearId: parseInt(currSelectedAcademicYear),
        schoolId: parseInt(currSelectedSchool),
        userId: currentUser.userId || "",
        gradeId: parseInt(formData.gradeId),
        subjectId: parseInt(formData.subjectId),
        UserIdentityKey: currentUser.userId || "",
      }),
    enabled: !!formData.subjectId,
  });
  const handleGrade = (e) => {
    const gradeId = parseInt(e.target.value || 0);
    const selectedGrade = grades.find((g) => g.gradeId === gradeId);
    setFormData((prev) => ({
      ...prev,
      gradeId,
      gradeStartDate: selectedGrade?.gradeStartDate || null,
      gradeEndDate: selectedGrade?.gradeEndDate || null,
    }));

    if (gradeSubjectList) {
      const filteredSubjects = gradeSubjectList
        .filter((item) => item.gradeId === gradeId)
        .map(({ subjectId, subject }) => ({ subjectId, subject }));

      const uniqueSubjects = Array.from(
        new Map(
          filteredSubjects.map((item) => [item.subjectId, item]),
        ).values(),
      );

      setSubjects(uniqueSubjects);
    }
  };

  useEffect(() => {
    if (gradeSubjectData?.isSuccess) {
      const gradeSubjects = gradeSubjectData.data.filter(
        (item) => item.lessonPlanFileId > 0,
      );
      const uniqueGrades = Array.from(
        new Map(
          gradeSubjects.map((item) => [
            item.gradeId,
            {
              gradeId: item.gradeId,
              gradeName: item.gradeName,
              gradeStartDate: item.gradeStartDate,
              gradeEndDate: item.gradeEndDate,
            },
          ]),
        ).values(),
      );
      setGrades(uniqueGrades);
      setGradeSubjectList(gradeSubjects);
    }
  }, [gradeSubjectData]);

  useEffect(() => {
    if (
      formData.lessonFormat === "Weekly" ||
      formData.lessonFormat === "Monthly" ||
      formData.lessonFormat === "Daily"
    ) {
      refetchPeriodList();
    } else {
      setPeriods([]);
    }
    setFormData((prev) => ({ ...prev, periodValue: "" }));
  }, [formData.lessonFormat, refetchPeriodList]);

  useEffect(() => {
    if (periodListData?.isSuccess) {
      setPeriods(periodListData.data || []);
      setWeekList(periodListData.data || []);
    }
  }, [periodListData]);

  const handleLessonPlan = () => {
    setGeneratingLessonPlan(true);
    //setTimeout(() => {
    //  setShowLessonEditor(true);
    //  setGeneratingLessonPlan(false);
    //}, 3000);
    const values = {
      academicYearId: parseInt(currSelectedAcademicYear || 0),
      schoolId: formData.schoolId,
      gradeId: formData.gradeId,
      //   lessonFormat: formData.lessonFormat,
      weekNumber: formData.weekNumber,
      startDate: formData.startDate,
      endDate: formData.endDate,
      subjectId: formData.subjectId,
      //   periodValue: formData.periodValue,
      userId: formData.userIdentityKey,
    };
    handleGeneratePlan(values);
  };

  const handleGeneratePlan = () => {
    try {
      setLoading(true);
      setShowLessonEditor(true);
      setLoading(false);
      // mutation.mutateAsync(values);
    } catch (error) {}
  };

  const isFormValid =
    formData.gradeId && formData.subjectId && formData.weekNumber;

  return (
    <>
      <MainLayout
        pageTitle={"Create Lesson Plan"}
        subtitle={
          "Create Lessons with Ease Using a Structured Curriculum. (Note: Grades and Subjects are available only when a curriculum is available.)"
        }
      >
        <div className="flex h-full max-h-full flex-col gap-4 overflow-hidden px-6 py-2">
          <div className="w-full rounded-lg border border-gray-300 p-4">
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div className="w-full">
                <TextField
                  select
                  label="Grade Level"
                  id="gradeId"
                  name="gradeId"
                  fullWidth
                  size="small"
                  value={formData.gradeId || ""}
                  onChange={handleGrade}
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade.gradeId} value={grade.gradeId}>
                      {grade.gradeName}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div className="w-full">
                <TextField
                  select
                  label="Subject"
                  id="subjectId"
                  name="subjectId"
                  fullWidth
                  size="small"
                  value={formData.subjectId || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subjectId: e.target.value,
                    }))
                  }
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.subjectId} value={subject.subjectId}>
                      {subject.subject}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {periodListDataLoading ? (
                <div className="flex w-full justify-center">
                  <LoadingSpinner fullHeight={false} size={6} />
                </div>
              ) : (
                <div className="w-full">
                  <TextField
                    select
                    label="Week"
                    id="weekNumber"
                    name="weekNumber"
                    fullWidth
                    size="small"
                    value={formData.weekNumber || ""}
                    onChange={(e) => {
                      const selectedWeek = parseInt(e.target.value, 10);
                      const selectedWeekObj = weekList.filter(
                        (item) => item.weekNumber === selectedWeek,
                      )[0];

                      setFormData((prev) => ({
                        ...prev,
                        weekNumber: selectedWeekObj.weekNumber,
                        startDate: selectedWeekObj.weekStartDate,
                        endDate: selectedWeekObj.weekEndDate,
                      }));
                    }}
                  >
                    {weekList.map((week) => (
                      <MenuItem key={week.weekNumber} value={week.weekNumber}>
                        {"Week " +
                          week.weekNumber +
                          (" [ " +
                            dayjs(week.weekStartDate).format("YYYY-MM-DD") +
                            " to  " +
                            dayjs(week.weekEndDate).format("YYYY-MM-DD") +
                            " ]")}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              )}

              <div className="w-full">
                <Button
                  onClick={handleLessonPlan}
                  disabled={!isFormValid}
                  className="bg-primary flex h-[40px] w-full items-center justify-center gap-2 text-white transition-all hover:opacity-90"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Generate
                </Button>
              </div>
            </div>

            {generatingLessonPlan && <LoadingSpinner fullHeight={false} />}
            {showLessonEditor && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {showLessonEditor && (
                  <LessonPlanEditor
                    lessonFormat={formData.lessonFormat}
                    lessonData={lessonPlanData}
                    onGeneratePlan={handleGeneratePlan}
                  />
                )}
              </LocalizationProvider>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
};
