import { Calendar, Calendar1Icon, CalendarIcon } from "lucide-react";
import { format, set } from "date-fns";
const LessonPlanTab = ({
  activeLesson,
  lesson,
  lessonFormatType,
  setActiveLesson,
  currIndex,
}) => {

    const getWeekDate = (value) => {
        if (value != null && value != "") {     
            return format(value, "MMMM yyyy");
        }
        return "";
    }

    const getActualDate = (value) => {
        if (value != null && value != "") {
            return format(value, "MMMM,yyyy");
        }
        return "";
    }

  return (
    <div
      onClick={() => {
        setActiveLesson(currIndex);
      }}
      className={`flex h-full w-full cursor-pointer flex-col gap-2 rounded-md px-2 py-2 text-gray-700 hover:bg-gray-100 hover:shadow ${currIndex == activeLesson ? "border-primary border-2" : "border border-gray-300"}`}
    >
      <div
        className={`flex w-auto items-center rounded-md ${currIndex == activeLesson ? "bg-primary text-white" : "text-primary bg-gray-100"} px-2 py-1 text-sm font-medium`}
      >
              {lessonFormatType == 0
                  ? `Grading Period: ${lesson?.LessonContent?.Index}`
                  : lessonFormatType == 1
                      ? `Month: ${lesson?.LessonContent?.Month}`
                      : lessonFormatType == 2
                          ?
                          `Week : ${currIndex + 1} - ${getWeekDate(lesson?.LessonContent?.Start_Date)}` //`${lesson?.LessonContent?.Week}`
                          : `Day : ${currIndex + 1} - ${lesson?.LessonContent?.Actual_Date}`} 
      </div>
      <h6 className="sm:text-md text-left text-sm font-semibold">
        {lesson?.LessonContent?.Domain_Title ||
          lesson?.LessonContent?.Lesson_Title ||
          "Untitled Lesson"}
      </h6>
      <div className="flex items-center gap-2">
     
              {lessonFormatType != 3 && (
                  <div>
               <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                      {lesson?.LessonContent?.Start_Date} to{" "}
                      {lesson?.LessonContent?.End_Date}
                      </span>
                  </div>
        )       
        }
      </div>
    </div>
  );
};

export default LessonPlanTab;
