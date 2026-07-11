import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import {
  TextField,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { MonthlyLessonSummary } from "./MonthlyLessonSummary";
import { WeeklyLessonSummary } from "./WeeklyLessonSummary";
import { DailyLessonSummary } from "./DailyLessonSummary";
import { YearlyLessonSummary } from "./YearlyLessonSummary";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";
import { useFormik } from "formik";

export const LessonFormatContainer = ({ lessonFormat, lessonData }) => {
  const {
    user: currentUser,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  //const [lessonFormat, setLessonFormat] = useState("weekly");

  const [formData, setFormData] = useState({
    gradeId: 0,
    lessonFormat: "yearly",
    schoolId: parseInt(currSelectedSchool || ""),
    subjectId: 0,
    teacherId: 0,
    academicYearId: parseInt(currSelectedAcademicYear || ""),
    userIdentityKey: currentUser.userId || "",
    startDate: "",
    endDate: "",
    searchTerm: "",
    yearlyLessonPlanJson: lessonData?.yearlyLessonPlanJson || "",
    monthlyLessonPlanJson: lessonData?.monthlyLessonPlanJson || "",
    weeklyLessonPlanJson: lessonData?.weeklyLessonPlanJson || "",
    dailyLessonPlanJson: lessonData?.dailyLessonPlanJson || "",
  });

  useEffect(() => {
    if (lessonData) {
      setFormData((prev) => ({
        ...prev,
        grade: lessonData.grade,
        lessonPlanId: lessonData.lessonPlanId,
        yearlyLessonPlanJson: lessonData?.yearlyLessonPlanJson || "",
        monthlyLessonPlanJson: lessonData?.monthlyLessonPlanJson || "",
        weeklyLessonPlanJson: lessonData?.weeklyLessonPlanJson || "",
        dailyLessonPlanJson: lessonData?.dailyLessonPlanJson || "",
      }));
    }
  }, [lessonData]);

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border-gray-300 p-2">
      <div className="flex w-full flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="mt-2 ml-auto flex items-center gap-2 sm:mt-0">
          <span className="text-sm font-semibold whitespace-nowrap">
            Lesson Format
          </span>

          <ToggleButtonGroup
            value={formData.lessonFormat || ""}
            exclusive
            onChange={(e, newFormat) => {
              if (newFormat !== null) {
                setFormData((prev) => ({
                  ...prev,
                  lessonFormat: newFormat,
                }));
              }
            }}
            size="small"
            color="primary"
            sx={{ gap: 0, flexWrap: "nowrap" }}
          >
            {[
              {
                value: "yearly",
                tooltip: "View lessons  summary for the entire year",
              },
              {
                value: "monthly",
                tooltip: "View lessons summary for the selected month",
              },
              {
                value: "weekly",
                tooltip: "View lessons for the selected week",
              },
              { value: "daily", tooltip: "View lessons for the selected day" },
            ].map((format) => (
              <Tooltip key={formData.lessonFormat} title={format.tooltip} arrow>
                <ToggleButton
                  value={format.value}
                  className="bg-primary"
                  sx={{
                    textTransform: "capitalize",
                    px: 3,

                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      backgroundColor: "#e3f2fd",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      transform: "scale(1.05)",
                    },
                    whiteSpace: "nowrap",
                  }}
                >
                  {format.value.charAt(0).toUpperCase() + format.value.slice(1)}
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </div>
      </div>
      <div className="h-full space-y-1">
        {formData.lessonFormat === "yearly" && (
          <YearlyLessonSummary
            yearlyLessonPlans={formData.yearlyLessonPlanJson || ""}
          />
        )}
        {formData.lessonFormat === "monthly" && (
          <MonthlyLessonSummary
            monthlyLessonPlans={formData.monthlyLessonPlanJson || ""}
          />
        )}
        {formData.lessonFormat === "weekly" && (
          <WeeklyLessonSummary
            weeklyLessonPlans={formData.weeklyLessonPlanJson || ""}
          />
        )}
        {formData.lessonFormat === "daily" && (
          <DailyLessonSummary
            dailyLessonPlans={formData.dailyLessonPlanJson || ""}
          />
        )}
      </div>
    </div>
  );
};
