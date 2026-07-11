import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import { useQuery } from "@tanstack/react-query";
import { getTeacherDetail } from "../../api/services/teacherService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useLocation, useNavigate } from "react-router";

import { Mail, User, Users, BookOpen, GraduationCap } from "lucide-react";

export const TeacherProfile = () => {
  const navigate = useNavigate();

  const { currSelectedSchool, currSelectedAcademicYear } =
    useContext(AuthContext);
  const location = useLocation();
  const { teacherId } = location.state || {};

  const [teacherData, setTeacherData] = useState(null);
  const [searchQueries, setSearchQueries] = useState({}); // 🔍 stores search per grade

  const { data: teacherDetail1, isLoading: tprofileLoading } = useQuery({
    queryKey: [
      "teacherProfileData",
      teacherId,
      currSelectedSchool,
      currSelectedAcademicYear,
    ],
    queryFn: () =>
      getTeacherDetail(teacherId, currSelectedSchool, currSelectedAcademicYear),
    enabled: !!teacherId,
  });

  useEffect(() => {
    if (teacherDetail1?.data?.data) {
      setTeacherData(JSON.parse(teacherDetail1.data.data));
    }
  }, [teacherDetail1]);

  if (tprofileLoading || !teacherData) {
    return <LoadingSpinner />;
  }

  const teacher = teacherData.Users?.[0];
  const gradeSubjects = teacherData.TeacherGradeSubject?.GradeSubjects || [];
  const gradeWiseStudents = teacherData.GradeWiseStudents || [];

  const Badge = ({ children, className = "" }) => (
    <span
      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );

  // update search query for specific grade
  const handleSearchChange = (gradeName, value) => {
    setSearchQueries((prev) => ({
      ...prev,
      [gradeName]: value,
    }));
  };

  return (
    <div className="max-h-full overflow-y-auto">
      <div className="min-h-screen px-4 py-10 sm:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <div className="from-primary to-primary-500 rounded-full bg-gradient-to-r p-3 text-white">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="text-start">
              <h2 className="text-2xl font-bold">
                {teacher?.FirstName} {teacher?.LastName}
              </h2>
              <Badge className="bg-primary text-white">Teacher</Badge>
            </div>
          </div>

          {/* Teacher Information */}
          <div className="mb-5 space-y-3">
            <h3 className="text-primary flex items-center space-x-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              <span>Teacher Information</span>
            </h3>
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={teacher?.EmailAddress}
                />

                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Gender"
                  value={teacher?.Gender === "M" ? "Male" : "Female"}
                />
              </div>
            </div>
          </div>

          {/* Grade & Subjects */}
          <div className="mb-5 space-y-3">
            <h3 className="text-primary flex items-center space-x-2 text-lg font-semibold">
              <BookOpen className="h-5 w-5" />
              <span>Grade & Subjects</span>
            </h3>
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {gradeSubjects.map((g, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="text-primary h-4 w-4" />
                      <span className="font-medium">Grade : {g.GradeName}</span>
                    </div>
                    <div className="ml-6 flex flex-wrap gap-2">
                      {Object.values(g.SubjectIds).map((sub, idx) => (
                        <Badge
                          key={idx}
                          className="text-primary border border-gray-300"
                        >
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grade Wise Students */}
          <div className="mb-5 space-y-3">
            <h3 className="text-primary flex items-center space-x-2 text-lg font-semibold">
              <Users className="h-5 w-5" />
              <span>Grade Level Students</span>
            </h3>
            <div className="space-y-6 rounded-lg border border-gray-300 bg-white p-4">
              {gradeWiseStudents.map((grade, i) => {
                const query = searchQueries[grade.GradeName] || "";
                const filteredStudents = grade.Students.filter((student) =>
                  `${student.FirstName} ${student.LastName}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                );

                return (
                  <div key={i} className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{grade.GradeName}</h4>
                        <Badge className="bg-primary text-white">
                          {grade.Students?.length || 0} Students
                        </Badge>
                      </div>
                      {/* Search Box */}
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={query}
                        onChange={(e) =>
                          handleSearchChange(grade.GradeName, e.target.value)
                        }
                        className="focus:border-primary w-full max-w-xs rounded border border-gray-300 px-3 py-1 text-sm focus:outline-none"
                      />
                    </div>

                    {/* Student List */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                      {filteredStudents.map((student, j) => (
                        <div
                          key={j}
                          className="flex items-center space-x-2 rounded border border-gray-300 bg-gray-50 p-3"
                        >
                          <div className="rounded-full bg-indigo-100 p-1">
                            <User className="text-primary h-4 w-4" />
                          </div>
                          <button
                            className="text-sm font-medium"
                            onClick={() => {
                              navigate("/student-profile", {
                                state: {
                                  studentId: student.StudentId,
                                },
                              });
                            }}
                          >
                            {student.FirstName} {student.LastName}
                          </button>

                          {/* <span className="text-sm font-medium">
                            
                          </span> */}
                        </div>
                      ))}
                      {filteredStudents.length === 0 && (
                        <p className="col-span-full text-sm text-gray-500">
                          No students found
                        </p>
                      )}
                    </div>
                    {i !== gradeWiseStudents.length - 1 && (
                      <hr className="border-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// small reusable row component
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-2 text-sm">
    {icon && <div className="text-primary">{icon}</div>}
    <span className="font-medium">{label}:</span>
    <span>{value || "-"}</span>
  </div>
);
