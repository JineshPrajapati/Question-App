import React, { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeacherList } from "../components/teachers/TeacherList";
import { getTeachersList } from "../../api/services/teacherService";
import Drawer from "../components/common/Drawer";
import { TeacherForm } from "../components/teachers/TeacherForm";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "../../contexts/authContext";
import { Plus } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";

export const Teachers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);

  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "TeacherId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    userId: user.userId,
  });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["teachers", tableConfig],
    queryFn: () => getTeachersList(tableConfig),
    keepPreviousData: true,
  });

  const handleAddTeacher = async (e) => {
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
    <MainLayout
      pageTitle={"Teachers"}
      actionButton={() => (
        <PermissionGuard path={location.pathname} action={2}>
          <button
            className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
            onClick={() => navigate("/teachers/Add")}
          >
            <Plus className="h-4 w-4 text-white" />
            Add Teacher
          </button>
        </PermissionGuard>
      )}
    >
      <TeacherList
        tableConfig={tableConfig}
        setTableConfig={setTableConfig}
        data={data}
        isLoading={isLoading}
        refetch={refetch}
        onRefresh={refetch}
      />

      <Drawer
        isFlexible={true}
        maxWidth="1250px"
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Add Student"
      >
        <TeacherForm
          onSuccess={() => {
            setIsAddDrawerOpen(false);
            refetch();
          }}
          onSubmit={handleAddTeacher}
          isSubmitting={false}
        />
      </Drawer>
    </MainLayout>
  );
};
