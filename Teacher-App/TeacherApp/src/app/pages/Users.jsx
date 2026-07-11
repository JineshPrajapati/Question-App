import React, { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserList } from "../components/users/UserList";
import { getUsersList } from "../../api/services/userService";
import Drawer from "../components/common/Drawer";
import { UserForm } from "../components/users/UserForm";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { AuthContext } from "../../contexts/authContext";
import { Plus } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";

export const Users = () => {
  const location = useLocation();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);
  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "UserId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicyearId: currSelectedAcademicYear,
    userId: user.userId,
  });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", tableConfig],
    queryFn: () => getUsersList(tableConfig),
    keepPreviousData: true,
  });
  const handleAddUser = async (e) => {
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
  }, [currSelectedSchool, currSelectedAcademicYear]);

  return (
    <MainLayout
      pageTitle={"Users"}
      actionButton={() => (
        <button
          className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
          onClick={() => setIsAddDrawerOpen(true)}
        >
          <Plus className="h-4 w-4 text-white" />
          Add User
        </button>
      )}
    >
      <UserList
        tableConfig={tableConfig}
        setTableConfig={setTableConfig}
        data={data}
        isLoading={isLoading}
        refetch={refetch}
        onRefresh={refetch}
      />

      <Drawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Add User"
      >
        <UserForm
          onSuccess={() => {
            setIsAddDrawerOpen(false);
            refetch();
          }}
          onSubmit={handleAddUser}
          isSubmitting={false}
        />
      </Drawer>
    </MainLayout>
  );
};
