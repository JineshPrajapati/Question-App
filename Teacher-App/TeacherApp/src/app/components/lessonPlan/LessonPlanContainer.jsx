import { useContext, useEffect, useState } from "react";
import { useIsMobile } from "../../hooks/useMobile";
import LessonFormatTabbar from "./UI/LessonFormatTabbar";
import LessonPlanTab from "./UI/LessonPlanTab";
import { AuthContext } from "../../../contexts/authContext";
import LessonDetailContainer from "./UI/LessonDetailContainer";
import { LoadingSpinner } from "../common/LoadingSpinner";
// import { LessonPlanTab } from "./UI/LessonPlanTab";

const LessonPlanContainer = ({
  lessonData = null,
  setLessonFormat,
  loadingLessonplanData,
  lessonFormat,
}) => {
  const isMobile = useIsMobile();
  const [lessonFormatType, setLessonFormatType] = useState(
    lessonFormat == "yearly"
      ? 0
      : lessonFormat == "monthly"
        ? 1
        : lessonFormat == "weekly"
          ? 2
          : 3,
  );
  const [activeLesson, setActiveLesson] = useState(0);
  const {
    user: currentUser,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  //const [lessonFormat, setLessonFormat] = useState("weekly");
  const [lessonPlan, setLessonPlan] = useState([]);

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
      let currLessonPlan =
        lessonFormatType == 0
          ? lessonData?.yearlyLessonPlanJson
          : lessonFormatType == 1
            ? lessonData?.monthlyLessonPlanJson
            : lessonFormatType == 2
              ? lessonData?.weeklyLessonPlanJson
              : lessonData?.dailyLessonPlanJson;
      if (currLessonPlan && currLessonPlan != "") {
        const outerList =
          typeof currLessonPlan === "string"
            ? JSON.parse(currLessonPlan)
            : currLessonPlan;
     
        const parsedList = outerList.map((plan) => ({
          ...plan,
          LessonContent: plan.LessonContent
            ? plan.LessonContent
            : {},
        }));

        // setLessonPlanList(parsedList);

        setLessonPlan(parsedList);
      } else {
        setLessonPlan([]);
      }
    }
  }, [lessonData, lessonFormatType]);
  useEffect(() => {
    setLessonFormat(
      lessonFormatType == 0
        ? "yearly"
        : lessonFormatType == 1
          ? "monthly"
          : lessonFormatType == 2
            ? "weekly"
            : "daily",
    );
  }, [lessonFormatType]);
  //   if (lessonPlan.length == 0) {
  //     return (
  //       <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-gray-300 text-center text-gray-500">
  //         <span className="text-lg font-medium">No Lesson Plan Available</span>
  //       </div>
  //     );
  //   }

  return (
    <div className="h-full w-full rounded-md border border-gray-300">
      {isMobile ? (
        <div className="flex h-full flex-col">
          <LessonFormatTabbar />
          <div className="flex w-full items-center gap-2 overflow-x-auto p-2">
            {lessonPlan.map((_, idx) => (
              <LessonPlanTab key={idx} />
            ))}
          </div>
          <div className="h-full flex-1 overflow-auto bg-green-500 p-2"></div>
        </div>
      ) : (
        <div className="grid h-full grid-cols-[30%_70%] space-x-2 overflow-hidden md:grid-cols-[40%_60%] lg:grid-cols-[50%-50%]">
          <div className="flex h-full flex-col gap-2 overflow-auto rounded-xl p-2 text-white shadow-md">
            <LessonFormatTabbar
              lessonFormatType={lessonFormatType}
              setLessonFormatType={(type) => setLessonFormatType(type)}
            />
            {/* <div className="h-full flex-1 overflow-auto"> */}
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              {loadingLessonplanData ? (
                <div className="flex h-40 w-full flex-1 items-center justify-center rounded-md border border-gray-300 text-center text-gray-500">
                  <LoadingSpinner fullHeight={false} size={12} />
                </div>
              ) : (
                lessonPlan.map((lesson, idx) => (
                  <LessonPlanTab
                    key={idx}
                    currIndex={idx}
                    lesson={lesson}
                    activeLesson={activeLesson}
                    lessonFormatType={lessonFormatType}
                    setActiveLesson={(activeIndex) => {
                      setActiveLesson(activeIndex);
                    }}
                  />
                ))
              )}
            </div>
            {/* </div> */}
          </div>
          <LessonDetailContainer
            key={lessonFormatType} // 👈 this forces remount when lessonFormatType changes
            lessonFormatType={lessonFormatType}
            loadingLessonplanData={loadingLessonplanData}
            currLessonPlan={lessonPlan[activeLesson]}
          />
        </div>
      )}
    </div>
  );
};

export default LessonPlanContainer;
