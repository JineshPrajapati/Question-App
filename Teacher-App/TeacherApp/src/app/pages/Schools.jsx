import React, { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { SchoolList } from "../components/schools/SchoolList";
import { getSchoolsList } from "../../api/services/schoolService";
import Drawer from "../components/common/Drawer";
import { SchoolForm } from "../components/schools/SchoolForm";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { AuthContext } from "../../contexts/authContext";
import { Plus } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";

export const Schools = () => {
  const location = useLocation();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);

  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "SchoolId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicyearId: currSelectedAcademicYear,
    userId: user.userId,
  });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["schools", tableConfig],
    queryFn: () => getSchoolsList(tableConfig),
    keepPreviousData: true,
  });

  const handleAddSchool = async (e) => {
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
    <MainLayout
      pageTitle={"Schools"}
      actionButton={() => (
        <div className="flex gap-4">
          <PermissionGuard path={location.pathname} action={2}>
            <button
              className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
              onClick={() => setIsAddDrawerOpen(true)}
            >
              <Plus className="h-4 w-4 text-white" />
              Add School
            </button>
          </PermissionGuard>
        </div>
      )}
    >
      <SchoolList
        tableConfig={tableConfig}
        setTableConfig={setTableConfig}
        data={data}
        isLoading={isLoading}
        refetch={refetch}
        onRefresh={refetch}
      />

      <Drawer
        isFlexible={true}
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Add School"
      >
        <SchoolForm
          onSuccess={() => {
            setIsAddDrawerOpen(false);
            refetch();
          }}
          onSubmit={handleAddSchool}
          isSubmitting={false}
        />
      </Drawer>
    </MainLayout>
  );
};
