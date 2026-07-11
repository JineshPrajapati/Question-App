import React, { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RoleList } from "../components/roles/RoleList";
import Drawer from "../components/common/Drawer";
import { getRolesList } from "../../api/services/roleService";
import { AuthContext } from "../../contexts/authContext";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { RoleForm } from "../components/roles/roleForm";
import { Plus } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";

export const Roles = () => {
  const location = useLocation();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);

  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "RoleId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicyearId: currSelectedAcademicYear,
    userId: user.userId,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["roles", tableConfig],
    queryFn: () => getRolesList(tableConfig),
    keepPreviousData: true,
  });

  const handleAddRole = async (e) => {
    e.preventDefault();
    setIsAddDrawerOpen(false);
    refetch();
  };
  useEffect(() => {
    setTableConfig((prevConfig) => ({
      ...prevConfig,
      schoolId: currSelectedSchool,
      academicyearId: currSelectedAcademicYear,
      pageNumber: 1, // optional: reset to page 1 on school change
    }));
  }, [currSelectedSchool]);
  return (
    <MainLayout
      pageTitle={"Roles"}
      actionButton={() => (
        <PermissionGuard path={location.pathname} action={2}>
          <button
            className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
            onClick={() => setIsAddDrawerOpen(true)}
          >
            <Plus className="h-4 w-4 text-white" />
            Add Role
          </button>
        </PermissionGuard>
      )}
    >
      <RoleList
        tableConfig={tableConfig}
        setTableConfig={setTableConfig}
        data={data}
        isLoading={isLoading}
        refetch={refetch}
        onRefresh={refetch}
      />

      <Drawer
        isFlexible={true}
        maxWidth="750px"
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Add Role"
      >
        <RoleForm
          onSuccess={() => {
            setIsAddDrawerOpen(false);
            refetch();
          }}
          onSubmit={handleAddRole}
          isSubmitting={false}
        />
      </Drawer>
    </MainLayout>
  );
};
