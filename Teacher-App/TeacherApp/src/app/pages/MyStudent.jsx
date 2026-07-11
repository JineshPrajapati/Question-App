import React, { useState, useEffect, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MyStudentList } from "../components/MyStudents/MyStudentList";
import {
  addBulkStudent,
  addScore,
  getMyStudentsList,
} from "../../api/services/studentService";
import Drawer from "../components/common/Drawer";
import { StudentForm } from "../components/students/StudentForm";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "../../contexts/authContext";
import { Plus } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { toast } from "react-toastify";

export const MyStudents = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [file, setFile] = useState(null);
  const { currSelectedSchool, user, currSelectedAcademicYear } =
    useContext(AuthContext);

  const [isScoreModelOpen, setIsScoreModelOpen] = useState(false);
  const [scoreFile, setScoreFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [dataError, setFileDataError] = useState("");

  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "StudentId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicyearId: currSelectedAcademicYear,
    userId: user.userId,
  });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["students", tableConfig],
    queryFn: () => getMyStudentsList(tableConfig),
    keepPreviousData: true,
  });

  const mutation = useMutation({
    mutationKey: ["bulkUploadStudents"],
    mutationFn: (formData) => addBulkStudent(formData, currSelectedSchool),
    onSuccess: () => {
      toast.success("Students uploaded successfully");
      setIsModelOpen(false);
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
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    setFileError("");
    setFileDataError("");
    const formData = new FormData();
    formData.append("file", file);
    mutation.mutate(formData);
  };

  const mutationScore = useMutation({
    mutationKey: ["uploadScore"],
    mutationFn: (formData) => addScore(formData),
    onSuccess: () => {
      toast.success("Score uploaded successfully");
      setIsScoreModelOpen(false);
      setScoreFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data || "An error occurred while uploading");
    },
  });

  const handleScoreSubmit = () => {
    if (!scoreFile) {
      toast.error("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", scoreFile);
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
      academicyearId: currSelectedAcademicYear,
      schoolId: currSelectedSchool,
      pageNumber: 1,
    }));
  }, [currSelectedSchool]);

  return (
    <>
      <MainLayout pageTitle={"My Students"}>
        <MyStudentList
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
