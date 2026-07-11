import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../contexts/authContext";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { Tooltip } from "../../common/Tooltip";
const jsonKey = "GradeWiseStudents";

export const GradeWiseStudents = ({ myDetails, myDetailsLoading }) => {
  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);

  const [gradeWiseStudents, setGradeWiseStudents] = useState([]);

  useEffect(() => {
    if (myDetails?.[jsonKey]) {
      setGradeWiseStudents(myDetails[jsonKey]);
    }
  }, [myDetails]);

  if (myDetailsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (!gradeWiseStudents.length) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No Grade allocation found.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
      {gradeWiseStudents.map((grade) => (
        <div
          key={grade.GradeCode}
          className="flex min-h-[200px] flex-col justify-between rounded-2xl border border-gray-200 bg-white/70 shadow-md backdrop-blur-md transition hover:shadow-lg"
        >
          {/* Grade Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gray-300 px-4 py-3 text-black">
            <div className="text-primary flex flex-1 items-center justify-start px-3 py-1 text-left text-sm font-bold">
              {grade.GradeName}
              {/* <span className="ml-2 text-xs text-gray-700">{"Code: "}</span> */}
            </div>
            <div>
              <span className="ml-2 text-xs text-gray-700">
                ({grade.Students?.length || 0} {"Students"})
              </span>
            </div>
          </div>

          {/* Students List */}
          <div className="flex-1 p-4">
            {grade.Students && grade.Students.length > 0 ? (
              <div className="max-h-[150px] space-y-2 overflow-y-auto text-sm">
                {grade.Students.map((student) => (
                  <div
                    key={student.StudentNumber}
                    className="flex items-center justify-between rounded bg-gray-100 px-3 py-1"
                  >
                    <span className="font-medium">
                      {student.FirstName} {student.LastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {student.StudentNumber}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No students found</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
