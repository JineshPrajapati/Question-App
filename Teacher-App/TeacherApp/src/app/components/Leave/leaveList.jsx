import { AuthContext } from "../../../contexts/authContext";
import React, { useState, useContext } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon } from "@heroicons/react/24/outline";
import Drawer from "../common/Drawer";

import Model from "../common/Model";
import { useMutation } from "@tanstack/react-query";
import { UpdateSchoolStatus } from "../../../api/services/schoolService";
import { toast } from "react-toastify";
import ToggleSwitch from "../common/ToggleSwitch";
import { useLocation, useNavigate } from "react-router";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { Tooltip } from "../common/Tooltip";
import { SquarePen } from "lucide-react";
import { LeaveForm } from "./LeaveForm";
import { deleteLeave } from "../../../api/services/leaveService";

export const LeaveList = ({
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
    setConfirmMessage("Are you sure you want to delete this vacation?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDeleteSchool(school));
    setIsConfirmOpen(true);
  };

  const handleDeleteSchool = async (school) => {
    try {
      await deleteLeave({
        Id: school.leaveId,
        IsDelete: true,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("Vacation deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the vacation.",
      );
      console.error("Error deleting vacation:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const columns = [
    {
      field: "startDate",
      isForPending: false,
      header: "Start Date",
      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">
          {school?.startDate?.split("T")[0] || "-"}
        </span>
      ),
    },
    {
      field: "endDate",
      isForPending: true,
      header: "End Date",
      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">
          {school?.endDate?.split("T")[0] || "-"}
        </span>
      ),
    },
    {
      field: "vacationDays",
      isForPending: true,
      header: "Vacation Days",
      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">{school.vacationDays}</span>
      ),
    },
    {
      field: "reason",
      header: "Reason",
      isForPending: true,

      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">{school.reason}</span>
      ),
    },

    {
      field: "createdDate",
      header: "Created Date",
      isForPending: true,

      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">
          {school?.createdDate?.split("T")[0] || "-"}
        </span>
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
          <Tooltip content={<p>Edit</p>}>
            <button
              className="text-primary cursor-pointer hover:text-blue-900"
              onClick={() => handleEdit(school)}
            >
              <SquarePen className="text-primary h-5 w-5" />
            </button>
          </Tooltip>
          <Tooltip content={<p>Delete</p>}>
            <button
              className="text-red-600 hover:text-red-900"
              onClick={() => handleDeleteConfirm(school)}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </Tooltip>
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
        showMultiSwitch={false}
        setTableConfig={setTableConfig}
        onSort={handleSort}
        isShadow={false}
        handleStatusChange={handleStatusChange}
        isLoading={isLoading}
        columns={
          isAllStudents ? columns : columns.filter((col) => col.isForPending)
        }
        actions={actions}
        searchPlaceholder="Search vacation..."
        noDataMessage={
          isAllStudents ? "No vacations found" : "No Pending vacation"
        }
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
        isFlexible={false}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Update Leave"
      >
        <LeaveForm
          leave={selectedSchool}
          onSuccess={() => {
            setIsDrawerOpen(false);
            refetch();
          }}
          onSubmit={handleSubmit}
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
