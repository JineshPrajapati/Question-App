import React, { useState, useEffect, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StudentList } from "../components/students/StudentList";
import {
  getStudentsList,
  addBulkStudent,
  addScore,
} from "../../api/services/studentService";
import Drawer from "../components/common/Drawer";
import { StudentForm } from "../components/students/StudentForm";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "../../contexts/authContext";
import { Plus } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { toast } from "react-toastify";
import {
  FormLabel,
  FormSelect,
  PrimaryButton,
} from "../components/form/FormElements";
import Model from "../components/common/Model";
import { getSchoolGradeList } from "../../api/services/dropDownMasterService";

export const Students = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [file, setFile] = useState(null);
  const {
    user: userData,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);

  const [isScoreModelOpen, setIsScoreModelOpen] = useState(false);
  const [scoreFile, setScoreFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [dataError, setFileDataError] = useState("");
  const [grades, setGrades] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [formErrors, setFormErrors] = useState({
    grade: "",
    file: "",
  });

  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "StudentId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicYearId: currSelectedAcademicYear,
    userId: userData.userId,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["students", [tableConfig, currSelectedAcademicYear]],
    queryFn: () => getStudentsList(tableConfig),
    keepPreviousData: true,
  });

  const { data: gradeData, isLoading: gradeLoading } = useQuery({
    queryKey: [
      "gradeData",
      userData.userId,
      currSelectedAcademicYear,
      currSelectedSchool,
    ],
    queryFn: () =>
      getSchoolGradeList(
        userData.userId,
        currSelectedSchool,
        currSelectedAcademicYear,
      ),
  });
  useEffect(() => {
    if (gradeData?.isSuccess) {
      const grades = Array.isArray(gradeData.data?.data)
        ? gradeData.data.data.map((grade) => ({
            gradeId: grade.value,
            grade: grade.label,
          }))
        : [];

      setGrades(grades);
    }
  }, [gradeData]);
  const mutation = useMutation({
    mutationKey: [
      "bulkUploadStudents",
      [currSelectedSchool, selectedGradeId, currSelectedAcademicYear],
    ],
    mutationFn: (formData) =>
      addBulkStudent(
        formData,
        currSelectedSchool,
        selectedGradeId,
        currSelectedAcademicYear,
        userData.userId,
      ),
    onSuccess: () => {
      toast.success("Students uploaded successfully");
      setIsModelOpen(false);
      setSelectedGradeId(null);
      setFile(null);
      refetch();
    },
    onError: (error) => {
      const errorData = error.data[0].data;
      const message =
        error.response?.data?.message || error.message || "An error occurred";
      setFileError(message);

      setFileDataError(errorData);
    },
  });
  const handleSubmit = () => {
    const errors = {
      grade: "",
      file: "",
    };

    if (!selectedGradeId) {
      errors.grade = "Grade is required";
    }

    if (!file) {
      errors.file = "Please select an Excel file";
    }

    setFormErrors(errors);

    if (errors.grade || errors.file) return;

    setFileError("");
    setFileDataError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("gradeId", selectedGradeId);
    mutation.mutate(formData);
  };

  const mutationScore = useMutation({
    mutationKey: [
      "uploadScore",
      [currSelectedSchool, selectedGradeId, currSelectedAcademicYear],
    ],
    mutationFn: (formData) =>
      addScore(
        formData,
        currSelectedSchool,
        selectedGradeId,
        currSelectedAcademicYear,
      ),
    onSuccess: () => {
      toast.success("Score uploaded successfully");
      setIsScoreModelOpen(false);
      setScoreFile(null);
      setSelectedGradeId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data || "An error occurred while uploading");
    },
  });

  const handleScoreSubmit = () => {
    const errors = {
      grade: "",
      file: "",
    };

    if (!selectedGradeId) {
      errors.grade = "Grade is required";
    }

    if (!scoreFile) {
      errors.file = "Please select an Excel file";
    }

    setFormErrors(errors);

    if (errors.grade || errors.file) return;

    const formData = new FormData();
    formData.append("file", scoreFile);
    formData.append("gradeId", selectedGradeId);
    mutationScore.mutate(formData);
  };
  const handleDownload = (name) => {
    let fileUrl = "";
    let fileName = "";
    if (name == "Student") {
      fileUrl = "/assets/files/Student-Sapmle.xlsx";
      fileName = "Student-Sapmle.xlsx";
    } else if (name == "Score") {
      fileUrl = "/assets/files/Score-Sample.xlsx";
      fileName = "Score-Sample.xlsx";
    }

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsAddDrawerOpen(false);
    refetch();
  };
  useEffect(() => {
    setTableConfig((prevConfig) => ({
      ...prevConfig,
      schoolId: currSelectedSchool,
      academicYearId: currSelectedAcademicYear,
      pageNumber: 1,
    }));
  }, [currSelectedSchool, currSelectedAcademicYear]);

  return (
    <>
      {/* Bulk Upload Modal */}
      <Model
        isOpen={isModelOpen}
        onClose={() => {
          setIsModelOpen(false);
          setFile(null);
        }}
        title="Import Student Data"
      >
        <div className="space-y-4">
          <div>
            <FormLabel htmlFor="grade">Grade</FormLabel>
            <FormSelect
              id="grade"
              name="grade"
              valueKey="gradeId"
              labelKey="grade"
              options={[{ gradeId: "", grade: "Choose an option" }, ...grades]}
              onChange={(e) => {
                setSelectedGradeId(e?.target?.value || "");
                setFormErrors((prev) => ({ ...prev, grade: "" }));
              }}
              // {...formik.getFieldProps("grade")}
            />
            {formErrors.grade && (
              <p className="mt-1 text-left text-sm text-red-600">
                {formErrors.grade}
              </p>
            )}
          </div>
          <div>
            <FormLabel htmlFor="excelFile">Choose Excel File</FormLabel>
            <input
              type="file"
              id="excelFile"
              name="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file:bg-primary mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-white"
            />
            {formErrors.file && (
              <p className="mt-1 text-left text-sm text-red-600">
                {formErrors.file}
              </p>
            )}
            {dataError && (
              <div className="mt-2 text-sm whitespace-pre-wrap text-red-600">
                {dataError}
              </div>
            )}
          </div>
          <div className="text-right">
            <PrimaryButton onClick={handleSubmit} disabled={mutation.isLoading}>
              {mutation.isLoading ? "Uploading..." : "Import"}
            </PrimaryButton>
            <button
              type="button"
              className="text-primary ml-4 underline"
              onClick={() => handleDownload("Student")}
            >
              Download Sample Template
            </button>
          </div>
        </div>
      </Model>

      {/* Score Upload Modal */}
      <Model
        isOpen={isScoreModelOpen}
        onClose={() => {
          setIsScoreModelOpen(false);
          setScoreFile(null);
        }}
        title="Import Score Data"
      >
        <div className="space-y-4">
          <div>
            <FormLabel htmlFor="grade">Grade</FormLabel>
            <FormSelect
              id="grade"
              name="grade"
              valueKey="gradeId"
              labelKey="grade"
              options={[{ gradeId: "", grade: "Choose an option" }, ...grades]}
              onChange={(e) => {
                setSelectedGradeId(e?.target?.value || "");
                setFormErrors((prev) => ({ ...prev, grade: "" }));
              }}
              // {...formik.getFieldProps("grade")}
            />
            {formErrors.grade && (
              <p className="mt-1 text-left text-sm text-red-600">
                {formErrors.grade}
              </p>
            )}
          </div>
          <div>
            <FormLabel htmlFor="scoreExcelFile">Choose Excel File</FormLabel>
            <input
              type="file"
              id="scoreExcelFile"
              name="file"
              accept=".xlsx,.xls"
              onChange={(e) => setScoreFile(e.target.files?.[0] || null)}
              className="file:bg-primary mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-white"
            />
          </div>
          <div className="text-right">
            <PrimaryButton
              onClick={handleScoreSubmit}
              disabled={mutationScore.isLoading}
            >
              {mutationScore.isLoading ? "Uploading..." : "Import"}
            </PrimaryButton>
            <button
              type="button"
              className="text-primary ml-4 underline"
              onClick={() => handleDownload("Score")}
            >
              Download Sample Template
            </button>
          </div>
        </div>
      </Model>
      <MainLayout
        pageTitle={"Students"}
        actionButton={() => (
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
              onClick={() => setIsModelOpen(true)}
            >
              <Plus className="h-4 w-4 text-white" />
              Import Student Data
            </button>

            <button
              className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
              onClick={() => setIsScoreModelOpen(true)}
            >
              <Plus className="h-4 w-4 text-white" />
              Add Score
            </button>

            <PermissionGuard path={location.pathname} action={2}>
              <button
                className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
                onClick={() => navigate("/students/Add")}
              >
                <Plus className="h-4 w-4 text-white" />
                Add Student
              </button>
            </PermissionGuard>
          </div>
        )}
      >
        <StudentList
          tableConfig={tableConfig}
          setTableConfig={setTableConfig}
          data={data}
          isLoading={isLoading}
          refetch={refetch}
          onRefresh={refetch}
        />
        {/* Add Drawer */}

        <Drawer
          isFlexible={true}
          maxWidth="1250px"
          isOpen={isAddDrawerOpen}
          onClose={() => setIsAddDrawerOpen(false)}
          title="Add Student"
        >
          <StudentForm
            onSuccess={() => {
              setIsAddDrawerOpen(false);
              refetch();
            }}
            onSubmit={handleAddStudent}
            isSubmitting={false}
          />
        </Drawer>
      </MainLayout>
    </>
  );
};
