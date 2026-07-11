import { AuthContext } from "../../../contexts/authContext";
import React, { useState, useContext } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon } from "@heroicons/react/24/outline";
import Drawer from "../common/Drawer";
import Model from "../common/Model";
import { useMutation } from "@tanstack/react-query";
import {
  deleteLessonPlan,
  updateLessonPlan,
} from "../../../api/services/lessonPlanService";
import { toast } from "react-toastify";
import ToggleSwitch from "../common/ToggleSwitch";
import { useLocation, useNavigate } from "react-router";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { Tooltip } from "../common/Tooltip";
import { FunnelIcon, SquarePen } from "lucide-react";
import { LessonPlanFilterForm } from "./LessonPlanFilterForm";

export const LessonPlanList = ({
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
  const [isAllLessonPlans, setIsAllLessonPlans] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [filterCount, setFilterCount] = useState(null);
  const handleEdit = (lessonPlan) => {};
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };
  const handleDeleteConfirm = (LessonPlan) => {
    setConfirmMessage("Are you sure you want to delete this Lesson Plan?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDeleteLessonPlan(LessonPlan));
    setIsConfirmOpen(true);
  };

  const handleStatusConfirm = (LessonPlan) => {
    setConfirmMessage(
      `Are you sure you want to ${LessonPlan.isActive ? "deactivate" : "activate"} this Lesson Plan?`,
    );
    setConfirmation(`Update Status`);
    setConfirmAction(() => () => handleStatusToggle(LessonPlan));
    setIsConfirmOpen(true);
  };

  const handleDeleteLessonPlan = async (LessonPlan) => {
    try {
      await deleteLessonPlan({
        Id: LessonPlan.lessonPlanId,
        IsDelete: true,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("Lesson Plan deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the Lesson Plan.",
      );
      console.error("Error deleting Lesson Plan:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleStatusToggle = async (lessonPlan) => {
    try {
      const lessonPlanDetail = {
        id: lessonPlan?.lessonPlanId || "",
        isActive: lessonPlan?.isActive,
        createdBy: currentUser.UserId || "",
      };
      await UpdateLessonPlanStatus(lessonPlanDetail);
      toast.success("Status updated successfully!");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const columns = [
    // {
    //   field: "SchoolName",
    //   isForPending: false,
    //   header: "School Name",
    //   sortable: true,
    //   render: (lessonPlan) => (
    //     <span className="text-sm text-gray-700">{lessonPlan.schoolName}</span>
    //   ),
    // },
    {
      field: "GradeName",
      isForPending: true,
      header: "Grade",
      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">{lessonPlan.gradeName}</span>
      ),
    },
    {
      field: "Subject",
      header: "Subject",
      isForPending: true,

      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">{lessonPlan.subject}</span>
      ),
    },
    {
      field: "LessonFormat",
      header: "Lesson format",
      isForPending: true,

      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">
          {lessonPlan?.lessonFormat}
        </span>
      ),
    },
    {
      field: "CreatedBy",
      header: "Created By",
      isForPending: true,
      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">{lessonPlan?.createdBy}</span>
      ),
    },
    {
      field: "StartDate",
      header: "Start Date",
      isForPending: true,

      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">
          {lessonPlan?.startDate?.split("T")[0] || "-"}
        </span>
      ),
    },
    {
      field: "EndDate",
      header: "End Date",
      isForPending: true,

      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">
          {lessonPlan?.endDate?.split("T")[0] || "-"}
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

  const actions = (lessonPlan) => {
    if (isAllLessonPlans) {
      return (
        <div className="flex space-x-3">
          <PermissionGuard path={location.pathname} action={3}>
            <Tooltip content={<p>Edit</p>}>
              <button
                className="text-primary cursor-pointer hover:text-blue-900"
                onClick={() => {
                  navigate("/lessonPlan/update", {
                    state: {
                      lessonPlanId: lessonPlan.lessonPlanId,
                      isEdit: true,
                    },
                  });
                }}
              >
                <SquarePen className="text-primary h-5 w-5" />
              </button>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard path={location.pathname} action={4}>
            <Tooltip content={<p>Delete</p>}>
              <button
                className="text-red-600 hover:text-red-900"
                onClick={() => handleDeleteConfirm(lessonPlan)}
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
        enableSelect={isAllLessonPlans ? false : true}
        selectedRows={selectedRows}
        rowIdAccessor={(lessonPlan) => lessonPlan.lessonPlanId}
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
        filter={![1, 5, 6].includes(currentUser.userTypeId)}
        setFilterCount={setFilterCount}
        filterCount={filterCount}
        handleFilterAction={(flag) => setIsAddDrawerOpen(flag)}
        columns={
          isAllLessonPlans ? columns : columns.filter((col) => col.isForPending)
        }
        searchPlaceholder="Search lesson Plan..."
        noDataMessage={
          isAllLessonPlans ? "No lesson Plan found" : "No Pending lesson Plan"
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
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title={"Filter"}
      >
        <LessonPlanFilterForm
          refetch={refetch}
          onClose={() => setIsAddDrawerOpen(false)}
          onSuccess={() => {
            setIsAddDrawerOpen(false);
            refetch();
          }}
          tableConfig={tableConfig}
          setTableConfig={setTableConfig}
          setFilterCount={setFilterCount}
          filterCount={filterCount}
          isAllLessonPlans={false}
        />
      </Drawer>
    </div>
  );
};
