import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/authContext";
import { getSchoolGradeSubject } from "../../../api/services/dropDownMasterService";
import {
  saveSchoolGrades,
  AddSubjectToGrade,
  AddSubjectMaster,
  getGradeMaster,
  deleteGrade,
  deleteSubject,
} from "../../../api/services/SettingsService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Model from "../common/Model";
import {
  Calendar,
  GraduationCap,
  SquarePen,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { Tooltip } from "../common/Tooltip";

const GradeSettings = () => {
  const { user, currSelectedSchool, currSelectedAcademicYear } =
    useContext(AuthContext);

  const [grades, setGrades] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [tempSelected, setTempSelected] = useState([]);
  const [newGradeName, setNewGradeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGradePopupOpen, setIsGradePopupOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [tempSubjects, setTempSubjects] = useState([]);
  const [subjectGradeId, setSubjectGradeId] = useState(null);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [allSubjects, setAllSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [errors, setErrors] = useState({});
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  });

  const fetchGrades = async () => {
    try {
      const res = await getGradeMaster(
        currSelectedSchool,
        currSelectedAcademicYear,
      );
      const rawGrades = res?.data?.data || [];

      const processedGrades = rawGrades.map((grade, index) => {
        const parsedSubjects =
          grade.subjectJson && grade.subjectJson !== "{}"
            ? JSON.parse(grade.subjectJson)
            : {};
        return {
          ...grade,
          value: grade.value ?? `temp-${index}`,
          parsedSubjects,
        };
      });

      setGrades(processedGrades);

      const preselected = processedGrades
        .filter((g) => g.isDisabled && g.value)
        .map((g) => g.value);

      const initialSubjects = {};
      processedGrades.forEach((g) => {
        if (g.value && Object.keys(g.parsedSubjects).length > 0) {
          initialSubjects[g.value] = Object.keys(g.parsedSubjects);
        }
      });

      setSelectedGrades(preselected);
      setSelectedSubjects(initialSubjects);
    } catch (err) {
      toast.error("Failed to load grades");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGrades();
  }, [currSelectedAcademicYear, currSelectedSchool]);

  const saveGradesMutation = useMutation({
    mutationFn: (payload) => saveSchoolGrades(payload),
    onSuccess: () => {
      fetchGrades();
      setFormData({ startDate: "", endDate: "" });
      toast.success("Grades saved successfully!");
    },
    onError: () => toast.error("Failed to save grades"),
  });

  const handleDeleteConfirm = (grade) => {
    setConfirmMessage("Are you sure you want to delete this grade?");
    setConfirmAction(() => () => handleDeleteGrade(grade));
    setIsConfirmOpen(true);
  };

  const handleDeleteGrade = async (grade) => {
    try {
      await deleteGrade({
        Id: grade,
        IsDelete: true,
        CreatedIdentityBy: user.userId,
      });
      toast.success("Grade deleted successfully!");
      fetchGrades();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the grade.",
      );
      console.error("Error deleting grade:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const addSubjectMutation = useMutation({
    mutationFn: (payload) => AddSubjectToGrade(payload),
    onSuccess: () => toast.success("Subjects updated"),
    onError: () => {
      toast.error("Failed to update subjects");
      setSelectedSubjects(null);
    },
  });

  const addSubjectMasterMutation = useMutation({
    mutationFn: (payload) => AddSubjectMaster(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Subject added!");
      setNewSubjectName("");
      if (subjectGradeId) handleAddSubjects(subjectGradeId);
    },
    onError: (err) => toast.error(err?.message || "Failed to add subject"),
  });

  const handleAddSelectedGrades = () => {
    const errors = {};

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (start > end) {
        errors.startDate = "Start date should not be after end date";
        errors.endDate = "End date should not be before start date";
      }
    }

    if (tempSelected.length === 0 && selectedGrade == null) {
      errors.grades = "Please select at least one grade";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setErrors({});
    let updatedSelected = null;
    if (selectedGrade == null) {
      updatedSelected = [
        ...new Set([...(selectedGrades || []), ...tempSelected]),
      ];
    } else {
      updatedSelected = [...new Set([selectedGrade.value, ...tempSelected])];
    }
    setSelectedGrades(updatedSelected);
    setTempSelected([]);
    setIsGradePopupOpen(false);

    const gradeLabels = updatedSelected
      .map((id) => grades.find((g) => g.value === id)?.value)
      .filter(Boolean);

    saveGradesMutation.mutate({
      schoolId: parseInt(currSelectedSchool),
      grades: gradeLabels.join(","),
      userId: user.userId,
      academicYearId: currSelectedAcademicYear,
      effectiveFrom: formData.startDate,
      effectiveTo: formData.endDate,
    });
  };

  const handleAddSubjects = async (schoolGradeId) => {
    setSubjectGradeId(schoolGradeId);
    const res = await getSchoolGradeSubject(schoolGradeId);
    const subjectList = res?.data?.data || [];
    setAllSubjects(subjectList);

    setSelectedSubjects((prev) => ({ ...prev, [schoolGradeId]: subjectList }));
    setTempSubjects([]);
    setSubjectModalOpen(true);
  };

  const handleSaveSubjects = () => {
    if (!subjectGradeId) return;

    const finalSubjects = [...tempSubjects];

    const uniqueSubjects = [
      ...new Set(
        finalSubjects.map((s) =>
          typeof s === "object" && s !== null ? s.value : s,
        ),
      ),
    ];

    const payload = {
      schoolGradeId: parseInt(subjectGradeId),
      subjectIds: uniqueSubjects.join(","),
    };

    addSubjectMutation.mutate(payload, {
      onSuccess: () => {
        fetchGrades();
        setSubjectModalOpen(false);
        setTempSubjects([]);
        setSubjectGradeId(null);
      },
      onError: () => toast.error("Failed to add subjects"),
    });
  };

  const handleRemoveSubject = async (gradeId, subjectId) => {
    // const updated = (selectedSubjects[gradeId] || []).filter(
    //   //   (id) => id !== subjectId,
    //   // );

    //   // setSelectedSubjects((prev) => ({
    //   //   ...prev,
    //   //   [gradeId]: updated,
    //   // }));

    try {
      await deleteSubject(subjectId);
      toast.success("subject removed successfully!");
      fetchGrades();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the subject.",
      );
      console.error("Error deleting subject:", error);
    }
  };

  if (loading) return <div>Loading grades...</div>;

  return (
    <div className="flex h-full flex-col px-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-xl p-2">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-left text-gray-800">Manage Grades</h2>
            {/*    <p className="text-left text-gray-600">Manage Grades</p>*/}
          </div>
        </div>
        <button
          onClick={() => {
            setIsGradePopupOpen(true);
            setSelectedGrade(null);
          }}
          className="bg-primary rounded px-4 py-2 text-white"
        >
          Add Grade
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {selectedGrades.map((gradeId) => {
          const grade = grades.find((g) => g.value === gradeId);
          const subjectIds = selectedSubjects[gradeId] || [];

          return (
            <div
              key={gradeId}
              className="flex min-h-[200px] flex-col justify-between rounded-2xl border border-gray-200 bg-white/70 shadow-md backdrop-blur-md transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between rounded-t-2xl bg-gray-300 px-4 py-3 text-black">
                <div className="flex flex-col items-start gap-1">
                  <div className="text-primary flex items-center justify-center rounded-full bg-gray-200 px-2 py-1 text-sm font-bold shadow">
                    {grade?.label}
                  </div>
                </div>
                <div className="flex">
                  <Tooltip content={<p>Delete</p>}>
                    <button
                      onClick={() => handleDeleteConfirm(grade.schoolGradeId)}
                      className="p-1 text-red-300 transition hover:text-red-500"
                    >
                      <TrashIcon className="h-4.5 w-4.5 cursor-pointer text-red-500" />
                    </button>
                  </Tooltip>
                  <Tooltip content={<p>Edit</p>}>
                    <button
                      onClick={() => {
                        setFormData({
                          startDate: grade.effectiveFrom?.split("T")[0] || "",
                          endDate: grade.effectiveTo?.split("T")[0] || "",
                        });
                        // setSelectedGrades(null);
                        setSelectedGrade(grade);
                        setIsGradePopupOpen(true);
                      }}
                      className="hover:text-primary p-1 text-blue-300 transition"
                    >
                      <SquarePen className="text-primary h-5 w-5 cursor-pointer" />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="flex h-10 items-center justify-start gap-2 bg-gray-100 px-4">
                {/* <p className="text-xs font-medium ">Grade Period:</p> */}
                <Calendar className="h-4 w-4 text-gray-600" />
                <div className="text-xs font-normal">
                  {grade?.effectiveFrom?.split("T")[0] || "-"} -{" "}
                  {grade?.effectiveTo?.split("T")[0] || "-"}
                </div>
              </div>

              <div className="flex-1 p-4">
                <div className="flex h-full flex-col">
                  {subjectIds.length > 0 && (
                    <div className="mb-4 max-h-[150px] space-y-2 overflow-y-auto text-sm">
                      {subjectIds.map((sid) => {
                        const label =
                          grades.find((g) => g.value === gradeId)
                            ?.parsedSubjects?.[sid] || "";
                        return (
                          <div
                            key={sid}
                            className="flex items-center justify-between rounded bg-gray-100 px-3 py-1"
                          >
                            <span>{label}</span>
                            <button
                              onClick={() => handleRemoveSubject(gradeId, sid)}
                              className="text-sm text-red-400 hover:text-red-600"
                            >
                              <XCircleIcon className="h-4.5 w-4.5 cursor-pointer text-gray-600" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => handleAddSubjects(grade.schoolGradeId)}
                    className="bg-primary mt-auto w-full rounded px-4 py-2 text-sm font-medium text-white"
                  >
                    + Add Subject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade Modal */}
      <Model
        isOpen={isGradePopupOpen}
        onClose={() => {
          setFormData({ startDate: "", endDate: "" });
          setIsGradePopupOpen(false);
          setTempSelected([]);
        }}
        title="Select Grades"
      >
        {/* <div className="mb-3 grid max-h-[50vh] grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
          {grades
            .filter((grade) => !selectedGrades.includes(grade.value))
            .map((grade) => (
              <label
                key={grade.value}
                className={`flex cursor-pointer items-center gap-2 rounded border p-3 ${
                  tempSelected.includes(grade.value)
                    ? "border-green-600 bg-green-100"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={tempSelected.includes(grade.value)}
                  onChange={() => {
                    setTempSelected((prev) =>
                      prev.includes(grade.value)
                        ? prev.filter((id) => id !== grade.value)
                        : [...prev, grade.value],
                    );
                  }}
                />
                <span>{grade.label}</span>
              </label>
            ))}
        </div> */}
        {selectedGrade ? (
          <div className="mb-3 rounded bg-blue-50 p-3 shadow">
            <p className="text-sm">
              <strong>Editing Grade:</strong> {selectedGrade.label}
            </p>
          </div>
        ) : (
          <div className="mb-3 grid max-h-[50vh] grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
            {grades
              .filter((grade) => !selectedGrades.includes(grade.value))
              .map((grade) => (
                <label
                  key={grade.value}
                  className={`flex cursor-pointer items-center gap-2 rounded border p-3 ${
                    tempSelected.includes(grade.value)
                      ? "border-green-600 bg-green-100"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={tempSelected.includes(grade.value)}
                    onChange={() => {
                      setTempSelected((prev) =>
                        prev.includes(grade.value)
                          ? prev.filter((id) => id !== grade.value)
                          : [...prev, grade.value],
                      );
                    }}
                  />
                  <span>{grade.label}</span>
                </label>
              ))}
          </div>
        )}

        {errors.grades && (
          <p className="col-span-full mb-3 text-sm text-red-600">
            {errors.grades}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 border-t-gray-400 pt-4">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded border px-3 py-2"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
            {errors.startDate && (
              <p className="mt-1 text-left text-red-600">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded border px-3 py-2"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
            {errors.endDate && (
              <p className="mt-1 text-left text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={() => {
              setFormData({ startDate: "", endDate: "" });
              setIsGradePopupOpen(false);
              setTempSelected([]);
              setErrors({}); // (optional) also clear errors
            }}
            className="mr-4 text-gray-600 hover:text-red-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelectedGrades}
            className="bg-primary rounded px-5 py-2 text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </Model>

      {/* Subject Modal */}
      <Model
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title="Select Subjects"
      >
        {/* <div className="mb-4 flex items-center gap-2">
          <input
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Enter new subject"
            className="w-full rounded border px-3 py-2"
          />
          <button
            onClick={() => {
              if (newSubjectName.trim()) {
                addSubjectMasterMutation.mutate({
                  subject: newSubjectName,
                });
              }
            }}
            disabled={!newSubjectName || addSubjectMasterMutation.isLoading}
            className="bg-primary rounded px-4 py-2 text-white disabled:opacity-50"
          >
            {addSubjectMasterMutation.isLoading ? "Saving..." : "Add"}
          </button>
        </div> */}
        <div className="grid max-h-[50vh] grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3">
          {allSubjects
            .filter(
              (s) =>
                !(selectedSubjects[subjectGradeId] || []).includes(s.value),
            )
            .map((s) => (
              <label
                key={s.value}
                className={`flex cursor-pointer items-center gap-2 rounded border p-3 ${
                  tempSubjects.includes(s.value)
                    ? "border-purple-600 bg-purple-100"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={tempSubjects.includes(s.value)}
                  onChange={() => {
                    setTempSubjects((prev) =>
                      prev.includes(s.value)
                        ? prev.filter((id) => id !== s.value)
                        : [...prev, s.value],
                    );
                  }}
                />
                <span>{s.label}</span>
              </label>
            ))}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={() => setSubjectModalOpen(false)}
            className="mr-4 text-gray-600 hover:text-red-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSubjects}
            disabled={tempSubjects.length === 0}
            className="bg-primary rounded px-5 py-2 text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </Model>

      <Model
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setErrors({});
        }}
        title="Confirm Delete"
      >
        <p>{confirmMessage}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            className="rounded bg-gray-300 px-4 py-2"
            onClick={() => setIsConfirmOpen(false)}
          >
            Cancel
          </button>
          <button
            className="bg-primary rounded px-4 py-2 text-white"
            onClick={confirmAction}
          >
            Confirm
          </button>
        </div>
      </Model>
    </div>
  );
};

export default GradeSettings;
