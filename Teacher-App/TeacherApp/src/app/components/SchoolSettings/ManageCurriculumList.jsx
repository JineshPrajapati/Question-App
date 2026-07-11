import React, { useState, useContext } from "react";
import Drawer from "../common/Drawer";
import { DataTable } from "../common/DataTable";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../../../contexts/authContext";
import Model from "../common/Model";
import { toast } from "react-toastify";
import { deleteCurriculum } from "../../../api/services/curriculumService";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { Tooltip } from "../../components/common/Tooltip";
import { ManageCurriculumForm } from "./ManageCurriculumForm";

export const ManageCurriculumList = ({
  onRefresh,
  data,
  isLoading,
  isRefetching,
  refetch,
  tableConfig,
  setTableConfig,
}) => {
  const location = useLocation();
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user: currentUser } = useContext(AuthContext);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDrawerOpen(false);
    setSelectedLessonPlan(null);
    onRefresh();
  };

  const columns = [
    {
      field: "Grade",
      header: "Grade",
      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">{lessonPlan.grade}</span>
      ),
    },
    {
      field: "Subject",
      header: "Subject",
      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">{lessonPlan.subject}</span>
      ),
    },
    {
      field: "fileName",
      header: "File",
      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">{lessonPlan.fileName}</span>
      ),
    },
    {
      field: "createdDate",
      header: "Date",
      sortable: true,
      render: (lessonPlan) => (
        <span className="text-sm text-gray-700">
          {lessonPlan?.createdDate?.split("T")[0] || "-"}
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
  const handleDeleteConfirm = (lessonPlan) => {
    setConfirmMessage("Are you sure you want to delete this lesson plan?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDeleteCurriculum(lessonPlan));
    setIsConfirmOpen(true);
  };

  const handleDeleteCurriculum = async (lessonPlan) => {
    try {
      await deleteCurriculum({
        LessonPlanFileId: lessonPlan.lessonPlanFileId,
        StorePath: lessonPlan.storePath || "",
        FileName: lessonPlan.fileName,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("Lesson Plan deleted successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the lesson plan.",
      );
      console.error("Error deleting lesson plan:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const actions = (lessonPlan) => (
    <div className="flex space-x-3">
      <PermissionGuard path={"/lessonplanning"} action={4}>
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
        isLoading={isLoading || isRefetching}
        isShadow={false}
        columns={columns}
        actions={actions}
        showMultiSwitch={false}
        searchPlaceholder="Search Curriculum..."
        noDataMessage="No Curriculum found"
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
          setSelectedLessonPlan(null);
        }}
        title={selectedCurriculum ? "Edit Curriculum" : "Add Curriculum"}
      >
        <ManageCurriculumForm
          curriculum={selectedCurriculum}
          onSubmit={handleSubmit}
          onClose={() => setIsDrawerOpen(false)}
          onSuccess={() => {
            setIsDrawerOpen(false);
            onRefresh();
          }}
        />
      </Drawer>
    </div>
  );
};
