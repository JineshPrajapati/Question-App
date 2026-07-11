import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  School,
  GraduationCap,
  GraduationCapIcon,
} from "lucide-react";

const AvailLessonSection = ({
  data,
  setFormData,
  activeStep,
  getLessonPlansList,
}) => {
  // Group by grade
  const groupedByGrade = data.reduce((acc, item) => {
    if (!acc[item.grade]) acc[item.grade] = {};
    if (!acc[item.grade][item.subject]) acc[item.grade][item.subject] = [];
    acc[item.grade][item.subject].push(item);
    return acc;
  }, {});

  // Instead of multiple expanded, store only one subject per grade
  const [expandedSubjects, setExpandedSubjects] = useState({});

  useEffect(() => {
    setExpandedSubjects({});
  }, [activeStep]);
  const toggleSubject = (grade, subject) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [grade]: prev[grade] === subject ? null : subject, // toggle
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <div
      className={`grid w-full ${Object.entries(groupedByGrade).length > 2 ? "grid-cols-[repeat(auto-fit,minmax(350px,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(350px,450px))]"} gap-2`}
    >
      {/* </div>
    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-4"> */}
      {Object.entries(groupedByGrade).map(([grade, subjects]) => (
        <div
          key={grade}
          className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg"
        >
          {/* Grade Header */}
          <div className="bg flex items-center justify-between rounded-t-xl border-b border-gray-300 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-md">
                {/* <StudentCap className="h-6 w-6" /> */}
                <GraduationCapIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-md font-semibold text-gray-800">{grade}</h2>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {Object.keys(subjects).length}{" "}
              {Object.keys(subjects).length > 1 ? "Subjects" : "Subject"}
            </span>
          </div>

          {/* Subjects */}
          <div className="flex-1 space-y-2 p-2 md:p-3">
            {Object.entries(subjects).map(([subject, plans]) => {
              const isOpen = expandedSubjects[grade] === subject;
              // console.log("plans", plans);
              return (
                <div key={subject}>
                  {/* Subject Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 hover:bg-gray-100"
                    onClick={() => toggleSubject(grade, subject)}
                  >
                    <span
                      //   className={`rounded-full px-3 py-1 text-sm font-medium ${
                      //     subject === "Mathematics"
                      //       ? "bg-blue-100 text-primary"
                      //       : subject === "English Language Arts"
                      //         ? "bg-green-100 text-green-700"
                      //         : subject === "Science"
                      //           ? "bg-cyan-100 text-cyan-700"
                      //           : subject === "Social Studies"
                      //             ? "bg-purple-100 text-purple-700"
                      //             : "bg-gray-100 text-gray-700"
                      //   }`}
                      className="text-primary border-primary rounded-full border bg-gray-100 px-3 py-1 text-sm font-medium"
                    >
                      {subject}
                    </span>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        {plans.length}{" "}
                        {plans.length > 1 ? "Lesson plans" : "Lesson plan"}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Lesson Plans */}
                  {isOpen && (
                    <div className="mt-2 space-y-3">
                      {plans.map((plan) => (
                        <div
                          key={plan.lessonPlanId}
                          className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            {/* Left section */}
                            <div>
                              <h3 className="text-left text-sm font-semibold text-gray-800">
                                Lesson Plan #{plan.lessonPlanId}
                              </h3>
                              <div className="mt-2 flex items-center gap-2 text-left text-xs text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {formatDate(plan.lessonPlanFromDate)} –{" "}
                                {formatDate(plan.lessonPlanToDate)}
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-left text-xs text-gray-600">
                                <User className="h-4 w-4" />
                                Created by: {plan.user}
                              </div>
                            </div>

                            {/* Right section */}
                            <div className="text-right text-xs text-gray-600">
                              <div className="flex items-center justify-end gap-1">
                                <School className="h-4 w-4" />
                                {plan.school}
                              </div>
                              <div className="mt-2">
                                Academic Year: {plan.academicYear}
                              </div>
                              <span className="text-primary mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium">
                                {plan.roleName}
                              </span>
                            </div>
                          </div>

                          {/* Explore Button */}
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                getLessonPlansList({
                                  lessonPlanId: plan.lessonPlanId,
                                  subjectId: plan.subjectId || "",
                                  gradeId: plan.gradeId || "",
                                  endDate: plan.lessonPlanToDate || "",
                                });

                                // setFormData((prev) => ({
                                //   ...prev,
                                //   subjectId: plan.subjectId || "",
                                //   gradeId: plan.gradeId || "",
                                //   endDate: plan.lessonPlanToDate || "",
                                // }));
                              }}
                              className="bg-primary w-full cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition"
                            >
                              Explore
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailLessonSection;
