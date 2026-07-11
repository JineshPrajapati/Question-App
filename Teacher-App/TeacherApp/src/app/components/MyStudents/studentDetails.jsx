import React, { useState, useEffect } from "react";
import Select from "react-select";
import { HomeModernIcon } from "@heroicons/react/24/solid";
import { PersonalInfoForm } from "../students/forms/personalInfoForm";
import { StudentGuardian } from "../students/forms/studentGuardian";
import { useLocation, useNavigate } from "react-router";

export const StudentDetails = ({ data, isLoading }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let parsedArray = [];
  try {
    if (typeof data?.data === "string") {
      const temp = JSON.parse(data.data);
      if (Array.isArray(temp)) {
        parsedArray = temp;
      } else {
        console.warn("Parsed data is not an array:", temp);
      }
    }
  } catch (err) {
    console.error("Failed to parse student array:", err);
  }

  const studentOptions = parsedArray.map(([key, student]) => ({
    id: student.StudentId,
    label: `${student.FirstName} ${student.LastName} (Grade ${student.GradeId})`,
  }));

  useEffect(() => {
    if (studentOptions.length && selectedStudentId === null) {
      setSelectedStudentId(studentOptions[0].id);
    }
  }, [studentOptions]);
  const handleIconClick = () => setMenuOpen(!menuOpen);

  const selectedStudent = parsedArray.find(
    ([key, student]) => student.StudentId === selectedStudentId,
  )?.[1];
  return (
    <div className="flex-1 space-y-3 rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white pb-4">
        {isMobile ? (
          <div className="relative">
            <div onClick={handleIconClick} className="cursor-pointer">
              <HomeModernIcon className="text-primary h-6 w-6" />
            </div>
            {menuOpen && (
              <ul className="absolute right-0 z-10 mt-2 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                {studentOptions.map((student) => {
                  const isSelected = selectedStudentId === student.studentId;
                  return (
                    <li
                      key={student.studentId}
                      //   onClick={() => {
                      //     // setSelectedStudentId(student.studentId);

                      //     setMenuOpen(false);
                      //   }}
                      onClick={() => {
                        navigate("/students/Update", {
                          state: {
                            studentId: student.studentId,
                            isEdit: true,
                          },
                        });
                      }}
                      className={`cursor-pointer rounded-md p-3 text-sm ${
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {student.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div className="w-full max-w-xs">
            {/* Hello */}
            <Select
              options={studentOptions.map((s) => ({
                value: s.id,
                label: s.label,
              }))}
              value={studentOptions
                .map((s) => ({ value: s.id, label: s.label }))
                .find((s) => s.value === selectedStudentId)}
              onChange={(selected) => {
                navigate("/students/Update", {
                  state: {
                    studentId: selected.value,
                    isEdit: true,
                  },
                });
              }}
              isSearchable={false}
              components={{
                ValueContainer: ({ children, ...props }) => (
                  <div className="flex items-center gap-1" {...props}>
                    <div className="border-r-1 border-gray-400 px-1">
                      <HomeModernIcon className="text-primary h-4 w-4" />
                    </div>
                    {children}
                  </div>
                ),
              }}
            />
          </div>
        )}
      </div>

      {/* Show selected student details */}
      {selectedStudent && (
        <div className="space-y-2 text-sm text-gray-700">
          {/* <PersonalInfoForm />
          <StudentGuardian /> */}
        </div>
      )}
    </div>
  );
};
