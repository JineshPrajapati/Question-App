import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../../contexts/authContext";
import { getGradeSubject } from "../../../../api/services/dropDownMasterService";
import { FormLabel, FormSelect } from "../../form/FormElements";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { XCircleIcon } from "lucide-react";

const jsonKey = "TeacherGradeSubject";

export const TeacherGradeSubjectAllocation = ({
  myDetails,
  // teacherId,
  handleSubmitForm,
  submitingData,
  myDetailsLoading,
  isView,
}) => {
  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);

  const [gradeSubjectRows, setGradeSubjectRows] = useState([]);

  const { data: allGradeSubjects, isLoading } = useQuery({
    queryKey: ["gradesSubjects"],
    queryFn: () =>
      getGradeSubject(
        user?.userId,
        currSelectedSchool,
        currSelectedAcademicYear,
      ),
  });

  const gradeData = allGradeSubjects?.data?.data || [];
  const gradeOptions = gradeData.reduce((acc, curr) => {
    if (!acc.some((g) => g.optionValue === curr.gradeId)) {
      acc.push({ optionValue: curr.gradeId, optionLabel: curr.gradeName });
    }
    return acc;
  }, []);

  useEffect(() => {
    const teacherGradeSubject = myDetails?.[jsonKey];
    if (teacherGradeSubject?.GradeSubjects?.length > 0) {
      const formattedRows = teacherGradeSubject.GradeSubjects.map((item) => {
        const gradeId = item.GradeId;
        const subjectObj = item.SubjectIds || {};

        const selectedSubjects = Object.entries(subjectObj).map(
          ([id, name]) => ({
            value: Number(id),
            label: name,
          }),
        );

        return {
          gradeId,
          selectedSubject: "",
          selectedSubjects,
        };
      });

      setGradeSubjectRows(formattedRows);
    }
  }, [myDetails]);
  const handleAddGradeRow = () => {
    setGradeSubjectRows((prev) => [
      ...prev,
      {
        gradeId: "",
        selectedSubject: "",
        selectedSubjects: [],
      },
    ]);
  };

  const handleGradeChange = (index, gradeId) => {
    const updatedRows = [...gradeSubjectRows];
    updatedRows[index].gradeId = gradeId;
    updatedRows[index].selectedSubjects = [];
    updatedRows[index].selectedSubject = "";

    setGradeSubjectRows(updatedRows);
  };

  const handleSubjectSelect = (index, subjectId) => {
    const updatedRows = [...gradeSubjectRows];
    updatedRows[index].selectedSubject = subjectId;

    setGradeSubjectRows(updatedRows);
  };

  const handleAddSubjectToGrade = (index) => {
    const updatedRows = [...gradeSubjectRows];
    const row = updatedRows[index];
    const existing = row.selectedSubjects.find(
      (s) => s.value === row.selectedSubject,
    );

    if (!existing && row.selectedSubject) {
      const subject = getFilteredSubjects(row.gradeId).find(
        (s) => s.value === row.selectedSubject,
      );

      if (subject) {
        row.selectedSubjects.push({ ...subject });
        row.selectedSubject = "";
      }
    }

    setGradeSubjectRows(updatedRows);
  };

  const handleRemoveSubject = (rowIndex, subjectId) => {
    const updatedRows = [...gradeSubjectRows];
    updatedRows[rowIndex].selectedSubjects = updatedRows[
      rowIndex
    ].selectedSubjects.filter((s) => s.value !== subjectId);

    setGradeSubjectRows(updatedRows);
  };

  const getFilteredSubjects = (gradeId) => {
    return gradeData
      .filter((item) => item.gradeId === parseInt(gradeId))
      .map((s) => ({
        value: s.subjectId,
        label: s.subject,
      }));
  };

  const handleSubmit = () => {
    const payload = {
      academicYearId: currSelectedAcademicYear,
      gradeSubjects: gradeSubjectRows
        .filter((row) => row.gradeId && row.selectedSubjects.length > 0)
        .map((row) => ({
          gradeId: row.gradeId,
          subjects: row.selectedSubjects.map((s) => ({
            subjectId: s.value,
            subjectName: s.label,
          })),
        })),
    };

    handleSubmitForm(payload, jsonKey);
  };
  if (isLoading || myDetailsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {gradeSubjectRows.length > 0 ? (
        gradeSubjectRows.map((row, index) => {
          const subjectOptions = getFilteredSubjects(row.gradeId);
          return (
            <div
              key={index}
              className="space-y-4 rounded border border-gray-400 bg-gray-50 p-4 shadow-sm"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <FormLabel>Grade</FormLabel>
                  <FormSelect
                    value={row.gradeId}
                    disabled={isView}
                    onChange={(e) => handleGradeChange(index, e.target.value)}
                    options={[
                      { optionValue: "", optionLabel: "Choose Grade" },
                      ...gradeOptions,
                    ]}
                  />
                </div>
                <div>
                  <FormLabel>Subject</FormLabel>
                  <FormSelect
                    value={row.selectedSubject}
                    disabled={isView}
                    onChange={(e) =>
                      handleSubjectSelect(index, Number(e.target.value))
                    }
                    options={[
                      { optionValue: "", optionLabel: "Choose Subject" },
                      ...subjectOptions.map((s) => ({
                        optionValue: s.value,
                        optionLabel: s.label,
                      })),
                    ]}
                  />
                </div>
                {!isView && (
                  <div className="flex items-end">
                    <button
                      onClick={() => handleAddSubjectToGrade(index)}
                      className="bg-primary hover:bg-primary h-10 rounded px-4 py-2 text-white"
                    >
                      + Add Subject
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {row.selectedSubjects.map((subj) => (
                  <div
                    key={subj.value}
                    className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm"
                  >
                    {subj.label}
                    {!isView && (
                      <button
                        onClick={() => handleRemoveSubject(index, subj.value)}
                        className="text-red-500"
                      >
                        <XCircleIcon className="h-4.5 w-4.5 cursor-pointer text-red-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded border border-gray-300 bg-white p-4 text-center text-gray-500">
          No Position found.
        </div>
      )}
      {!isView && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleAddGradeRow}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            + Add Grade
          </button>

          {gradeSubjectRows.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={submitingData}
              className="bg-primary hover:bg-primary-dark rounded px-5 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitingData ? "Saving..." : "Save Position"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
