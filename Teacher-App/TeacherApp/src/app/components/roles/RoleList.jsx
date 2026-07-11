import React, { useState, useContext } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon } from "@heroicons/react/24/outline";
import Drawer from "../common/Drawer";
import { RoleForm } from "./roleForm";
import Model from "../common/Model";
import {
  deleteRole,
  updateRoleStatus,
} from "../../../api/services/roleService";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { Tooltip } from "../../components/common/Tooltip";
import { SquarePen } from "lucide-react";

export const RoleList = ({
  onRefresh,
  tableConfig,
  setTableConfig,
  data,
  isLoading,
  refetch,
}) => {
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user: currentUser } = useContext(AuthContext);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const handleEdit = (role) => {
    setSelectedRole(role);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDrawerOpen(false);
    setSelectedRole(null);
    onRefresh();
  };

  const handleDeleteConfirm = (role) => {
    setConfirmMessage("Are you sure you want to delete this role?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDelete(role));
    setIsConfirmOpen(true);
  };

  const handleStatusConfirm = (role) => {
    setConfirmMessage(
      `Are you sure you want to ${role.isActive ? "deactivate" : "activate"} this role?`,
    );
    setConfirmation(`Update Status`);
    setConfirmAction(() => () => handleStatusToggle(role));
    setIsConfirmOpen(true);
  };

  const handleDelete = async (role) => {
    try {
      await deleteRole({
        RoleIdentityId: role.roleId,
        IsDelete: true,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("Role deleted successfully!");
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the role.",
      );
      console.error("Error deleting user:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleStatusToggle = async (role) => {
    try {
      const roleDetail = {
        RoleIdentityId: role?.roleId || "",
        isActive: !role.isActive,
        createdBy: currentUser.userId || "",
      };
      await updateRoleStatus(roleDetail);
      toast.success("Status updated successfully!");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const columns = [
    {
      field: "roleCode",
      header: "Code",
      sortable: true,
      render: (role) => (
        <span className="text-sm text-gray-700">{role.roleCode}</span>
      ),
    },
    {
      field: "roleName",
      header: "Name",
      sortable: true,
      render: (role) => (
        <span className="text-sm text-gray-700">{role.roleName}</span>
      ),
    },
    {
      field: "userType",
      header: "User Type",
      sortable: true,
      render: (role) => (
        <span className="text-sm text-gray-700">{role.userType}</span>
      ),
    },
    {
      field: "isActive",
      header: "Status",
      render: (role) => (
        <ToggleSwitch
          isOn={role.isActive}
          onToggle={() => handleStatusConfirm(role)}
        />
      ),
    },
  ];

  const handleSearch = (searchTerm) => {
    setTableConfig((prev) => ({
      ...prev,
      search: searchTerm,
      pageNumber: 1, // Reset to first page on search
    }));
  };

  const handleSort = (field, direction) => {
    setTableConfig((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection: direction,
      pageNumber: 1,
    }));
  };

  const handlePageChange = (page) => {
    setTableConfig((prev) => ({
      ...prev,
      pageNumber: page,
    }));
  };

  const handlePageSizeChange = (newSize) => {
    setTableConfig((prev) => ({
      ...prev,
      pageSize: newSize,
      pageNumber: 1, // Reset to first page when changing page size
    }));
  };

  const handleStatusChange = (activeStatus) => {
    setTableConfig((prev) => ({
      ...prev,
      activeOnly: activeStatus,
    }));
  };
  const actions = (role) => (
    <div className="flex space-x-3">
      <PermissionGuard path={location.pathname} action={3}>
        <Tooltip content={<p>Edit</p>}>
          <button
            className="text-primary hover:text-blue-900"
            onClick={() => handleEdit(role)}
          >
            <SquarePen className="text-primary h-5 w-5" />
          </button>
        </Tooltip>
      </PermissionGuard>
      <PermissionGuard path={location.pathname} action={4}>
        <Tooltip content={<p>Delete</p>}>
          <button
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDeleteConfirm(role)}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </Tooltip>
      </PermissionGuard>
    </div>
  );

  return (
    <div className="space-y-3 rounded-xl bg-white p-4 shadow-lg sm:px-6 sm:pt-2 sm:pb-6">
      <DataTable
        data={data?.data || []}
        totalItems={data?.totalRecords || 0}
        currentPage={tableConfig.pageNumber}
        pageSize={tableConfig.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        searchTerm={tableConfig.search}
        onSort={handleSort}
        isLoading={isLoading}
        columns={columns}
        handleStatusChange={handleStatusChange}
        isShadow={false}
        actions={actions}
        searchPlaceholder="Search roles..."
        noDataMessage="No roles found"
      />

      <Model
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmation}
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

      <Drawer
        isFlexible={true}
        maxWidth="750px"
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedRole(null);
        }}
        title={selectedRole ? "Edit Role" : "Add Role"}
      >
        <RoleForm
          role={selectedRole}
          isEdit={true}
          onSubmit={handleSubmit}
          onSuccess={() => {
            setIsDrawerOpen(false);
            onRefresh();
          }}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedRole(null);
          }}
          isSubmitting={false}
        />
      </Drawer>
    </div>
  );
};
