import { AuthContext } from "../../../contexts/authContext";
import React, { useState, useContext } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon } from "@heroicons/react/24/outline";
import Drawer from "../common/Drawer";
import { SchoolForm } from "./SchoolForm";
import Model from "../common/Model";
import { useMutation } from "@tanstack/react-query";
import {
  deleteSchool,
  UpdateSchoolStatus,
} from "../../../api/services/schoolService";
import { toast } from "react-toastify";
import ToggleSwitch from "../common/ToggleSwitch";
import { useLocation, useNavigate } from "react-router";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { Tooltip } from "../common/Tooltip";
import { SquarePen } from "lucide-react";

export const SchoolList = ({
  onRefresh,
  tableConfig,
  setTableConfig,
  data,
  isLoading,
  refetch,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user: currentUser } = useContext(AuthContext);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAllStudents, setIsAllStudents] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const handleEdit = (school) => {
    setSelectedSchool(school);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsDrawerOpen(false);
    setSelectedSchool(null);
    onRefresh();
  };
  const handleDeleteConfirm = (school) => {
    setConfirmMessage("Are you sure you want to delete this school?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDeleteSchool(school));
    setIsConfirmOpen(true);
  };

  const handleStatusConfirm = (school) => {
    setConfirmMessage(
      `Are you sure you want to ${school.isActive ? "deactivate" : "activate"} this school?`,
    );
    setConfirmation(`Update Status`);
    setConfirmAction(() => () => handleStatusToggle(school));
    setIsConfirmOpen(true);
  };

  const handleDeleteSchool = async (school) => {
    try {
      await deleteSchool({
        Id: school.schoolId,
        IsDelete: true,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("School deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the school.",
      );
      console.error("Error deleting school:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleStatusToggle = async (school) => {
    try {
      const schoolDetail = {
        id: school?.schoolId || "",
        isActive: !school.isActive,
        createdBy: currentUser.UserId || "",
      };
      await UpdateSchoolStatus(schoolDetail);
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
      field: "schoolCode",
      isForPending: false,
      header: "School Code",
      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">{school.schoolCode}</span>
      ),
    },
    {
      field: "name",
      isForPending: true,
      header: "School",
      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">{school.name}</span>
      ),
    },
    {
      field: "email",
      header: "Email",
      isForPending: true,

      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">{school.email}</span>
      ),
    },
    {
      field: "contactNumber",
      header: "Contact Number",
      isForPending: false,

      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">
          {school.contactNumber || "-"}
        </span>
      ),
    },
    // {
    //   field: "createdDate",
    //   header: "Created Date",
    //   isForPending: true,

    //   sortable: true,
    //   render: (school) => (
    //     <span className="text-sm text-gray-700">
    //       {school?.createdDate?.split("T")[0] || "-"}
    //     </span>
    //   ),
    // },
    {
      field: "isActive",
      header: "Status",
      render: (school) => (
        <ToggleSwitch
          isOn={school.isActive}
          onToggle={() => handleStatusConfirm(school)}
        />
      ),
    },
  ];

  const handleSearch = (searchTerm) => {
    setTableConfig((prev) => ({
      ...prev,
      search: searchTerm,
      pageNumber: 1,
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
      pageNumber: 1,
    }));
  };

  const handleStatusChange = (activeStatus) => {
    setTableConfig((prev) => ({
      ...prev,
      activeOnly: activeStatus,
    }));
  };

  const actions = (school) => {
    if (isAllStudents) {
      return (
        <div className="flex space-x-3">
          <PermissionGuard path={location.pathname} action={3}>
            <Tooltip content={<p>Edit</p>}>
              <button
                className="text-primary cursor-pointer hover:text-blue-900"
                onClick={() => handleEdit(school)}
              >
                <SquarePen className="text-primary h-5 w-5" />
              </button>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard path={location.pathname} action={4}>
            <Tooltip content={<p>Delete</p>}>
              <button
                className="text-red-600 hover:text-red-900"
                onClick={() => handleDeleteConfirm(school)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </Tooltip>
          </PermissionGuard>
        </div>
      );
    }
  };

  return (
    <div className="space-y-3 rounded-xl bg-white p-4 shadow-lg sm:px-6 sm:pt-2 sm:pb-6">
      <DataTable
        enableSelect={isAllStudents ? false : true}
        selectedRows={selectedRows}
        // handleSelectedDelete={handleSelectedDelete}
        rowIdAccessor={(school) => school.schoolId}
        onRowSelectChange={setSelectedRows}
        data={data?.data || []}
        totalItems={data?.totalRecords || 0}
        currentPage={tableConfig.pageNumber}
        pageSize={tableConfig.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        searchTerm={tableConfig.search}
        showMultiSwitch={isAllStudents ? true : false}
        setTableConfig={setTableConfig}
        onSort={handleSort}
        isShadow={false}
        handleStatusChange={handleStatusChange}
        isLoading={isLoading}
        columns={
          isAllStudents ? columns : columns.filter((col) => col.isForPending)
        }
        actions={actions}
        searchPlaceholder="Search schools..."
        noDataMessage={isAllStudents ? "No schools found" : "No Pending School"}
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
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedSchool(null);
        }}
        title={selectedSchool ? "Edit School" : "Add School"}
      >
        <SchoolForm
          school={selectedSchool}
          onSubmit={handleSubmit}
          isEdit={true}
          onSuccess={() => {
            setIsDrawerOpen(false);
            onRefresh();
          }}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedSchool(null);
          }}
          isSubmitting={false}
        />
      </Drawer>
    </div>
  );
};
