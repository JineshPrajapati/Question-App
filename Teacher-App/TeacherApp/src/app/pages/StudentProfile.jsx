import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useLocation } from "react-router";

import {
  Mail,
  User,
  Users,
  BookOpen,
  GraduationCap,
  GraduationCapIcon,
  Venus,
  Mars,
  Circle,
  Cake,
  Phone,
  MapIcon,
  AlertCircle,
  Star,
} from "lucide-react";
import { getStudentDetail } from "../../api/services/studentService";

export const StudentProfile = () => {
  const { currSelectedSchool, currSelectedAcademicYear } =
    useContext(AuthContext);
  const location = useLocation();
  const { studentId } = location.state || {};

  const [studentData, setStudentData] = useState(null);
  const [searchQueries, setSearchQueries] = useState({}); // 🔍 stores search per grade

  const { data: studentDetail, isLoading: sprofileLoading } = useQuery({
    queryKey: ["studentProfileData", studentId, currSelectedAcademicYear],
    queryFn: () => getStudentDetail(studentId, currSelectedAcademicYear),
    enabled: !!studentId,
  });

  useEffect(() => {
    if (studentDetail?.data?.data) {
      setStudentData(JSON.parse(studentDetail.data.data));
    }
  }, [studentDetail]);

  if (sprofileLoading || !studentData) {
    return <LoadingSpinner />;
  }

  const student = studentData.Students?.[0];
  const guardians = studentData.StudentGuardian?.[0];

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
                {student?.FirstName} {student?.LastName}
              </h2>
              <Badge className="bg-primary text-white">
                {student?.GradeName}
              </Badge>
            </div>
          </div>

          {/* Student Information */}
          <div className="mb-5 space-y-3">
            <h3 className="text-primary flex items-center space-x-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              <span>Student Information</span>
            </h3>
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoRow
                  icon={
                    student?.Gender === "M" ? (
                      <Mars className="h-4 w-4" />
                    ) : student?.Gender === "F" ? (
                      <Venus className="h-4 w-4" />
                    ) : (
                      <Circle />
                    )
                  }
                  label="Gender"
                  value={
                    student?.Gender === "M"
                      ? "Male"
                      : student?.Gender === "F"
                        ? "Female"
                        : "-"
                  }
                />
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={student?.EmailAddress}
                />
                {/* <InfoRow
                  icon={<GraduationCapIcon className="h-4 w-4" />}
                  label="Grade"
                  value={student?.GradeName}
                /> */}

                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={student?.PhoneNumber}
                />
                <InfoRow
                  icon={<Cake className="h-4 w-4" />}
                  label="DOB"
                  value={student?.DateOfBirth}
                />
                <InfoRow
                  icon={<MapIcon className="h-4 w-4" />}
                  label="Address"
                  value={`${student?.Address || ""}${student?.City ? ", " + student.City : ""}${student?.State ? ", " + student.State : ""}${student?.Pincode ? ", " + student.Pincode : ""}`}
                />
                <InfoRow
                  icon={<AlertCircle className="h-4 w-4" />}
                  label="Emergency Contact"
                  value={`${student?.EmergencyContactName || ""}${
                    student?.RelationShipName
                      ? " (" + student.RelationShipName + ")"
                      : ""
                  }${student?.EmergencyContactNumber ? ", " + student.EmergencyContactNumber : ""}`}
                />
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="mb-5 space-y-3">
            <h3 className="text-primary flex items-center space-x-2 text-lg font-semibold">
              <Users className="h-5 w-5" />
              <span>Guardian Information</span>
            </h3>

            {studentData.StudentGuardian &&
            studentData.StudentGuardian.length > 0 ? (
              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {studentData.StudentGuardian.map((guardian, i) => (
                    <React.Fragment key={i}>
                      <InfoRow
                        icon={
                          <div className="flex w-6 items-center justify-center">
                            {guardian.primaryGuardianIndex ? (
                              <Star className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                        }
                        label="Name"
                        value={`${guardian.FirstName} ${guardian.LastName}`}
                      />
                      <InfoRow
                        icon={<Mail className="h-4 w-4" />}
                        label="Email"
                        value={guardian.EmailAddress}
                      />
                      <InfoRow
                        icon={<Phone className="h-4 w-4" />}
                        label="Phone"
                        value={guardian.GuardianPhoneNumber}
                      />
                      <InfoRow
                        icon={<Users className="h-4 w-4" />}
                        label="Relationship"
                        value={guardian.Relationship}
                      />

                      {/* Divider between guardians */}
                      {i !== studentData.StudentGuardian.length - 1 && (
                        <div className="col-span-full">
                          <hr className="border-gray-200" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-300 bg-white p-4 text-center text-gray-500">
                No guardian information found
              </div>
            )}
          </div>

          {/* Score Section */}

          <div className="mb-5 space-y-3">
            <h3 className="text-primary flex items-center space-x-2 text-lg font-semibold">
              <BookOpen className="h-5 w-5" />
              <span>Score Information</span>
            </h3>

            {studentData.ScoreDetails && studentData.ScoreDetails.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(
                  studentData.ScoreDetails.reduce((acc, score) => {
                    if (!acc[score.SheetName]) acc[score.SheetName] = {};
                    if (!acc[score.SheetName][score.Assessment])
                      acc[score.SheetName][score.Assessment] = [];
                    acc[score.SheetName][score.Assessment].push(score);
                    return acc;
                  }, {}),
                ).map(([sheetName, assessments], i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-300 bg-white p-4"
                  >
                    <h4 className="mb-2 text-lg font-bold">{sheetName}</h4>

                    {Object.entries(assessments).map(
                      ([assessmentName, components], j) => (
                        <div key={j} className="mb-4">
                          <div className="mb-2 flex items-center gap-4">
                            <h5 className="font-semibold">{assessmentName}</h5>
                            <span className="text-xs text-gray-500">
                              ({components.length} Components)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {components.map((comp, k) => (
                              <div
                                key={k}
                                className="rounded-lg border border-gray-200 p-4"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <h6 className="font-semibold">
                                    {comp.Component}
                                  </h6>
                                </div>

                                <div className="flex gap-4 text-sm">
                                  <div className="rounded bg-gray-200 p-2">
                                    <p className="font-medium">Fall Score</p>
                                    <p>{comp.F_score || "N/A"}</p>
                                  </div>
                                  <div className="rounded bg-gray-200 p-2">
                                    <p className="font-medium">Winter Score</p>
                                    <p>{comp.W_score || "N/A"}</p>
                                  </div>
                                  <div className="rounded bg-gray-200 p-2">
                                    <p className="font-medium">Spring Score</p>
                                    <p>{comp.S_score || "N/A"}</p>
                                  </div>
                                </div>

                                {comp.Improvement && (
                                  <p className="mt-2 text-xs text-gray-500">
                                    {comp.Improvement}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-300 bg-white p-4 text-center text-gray-500">
                No score data found
              </div>
            )}
          </div>

          {/* {} */}
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
