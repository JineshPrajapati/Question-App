import React, { useState, useContext } from "react";
import Drawer from "../common/Drawer";
import { DataTable } from "../common/DataTable";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { KnowledgebaseForm } from "./knowledgeBaseForm";
import { AuthContext } from "../../../contexts/authContext";
import Model from "../common/Model";
import { toast } from "react-toastify";
import {
  deleteKnowledgebase,
  updateKnowledgebaseStatus,
} from "../../../api/services/knowledgebaseService";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { Tooltip } from "../../components/common/Tooltip";

export const KnowledgebaseList = ({
  onRefresh,
  data,
  isLoading,
  isRefetching,
  refetch,
  tableConfig,
  setTableConfig,
}) => {
  const location = useLocation();
  const [selectedKnowledgebase, setSelectedKnowledgebase] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user: currentUser } = useContext(AuthContext);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [knowledgebaseToDelete, setKnowledgebaseToDelete] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const getStatusColor = (status) => {
    return status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    // After successful submission:
    setIsDrawerOpen(false);
    setSelectedKnowledgebase(null);
    onRefresh();
  };

  const handleEdit = (knowledgebase) => {
    setSelectedKnowledgebase(knowledgebase);
    setIsDrawerOpen(true);
  };
  const statusColorMap = {
    Unassigned: "bg-yellow-200 text-yellow-800",
    "In Progress": "bg-green-200 text-green-800",
    Completed: "bg-blue-200 text-blue-800",
    Failed: "bg-gray-300 text-gray-700",
  };
  const getFileStatusColor = (fileStatus) => {
    return statusColorMap[fileStatus] || "bg-gray-200 text-gray-800";
  };
  const columns = [
    {
      field: "knowledgebaseCode",
      header: "Code",
      sortable: true,
      render: (knowledgebase) => (
        <span className="text-sm text-gray-700">
          {knowledgebase.knowledgebaseCode}
        </span>
      ),
    },
    // {
    //   field: "Grade",
    //   header: "Grade",
    //   sortable: true,
    //   render: (knowledgebase) => (
    //     <span className="text-sm text-gray-700">{knowledgebase.grade}</span>
    //   ),
    // },

    {
      field: "fileName",
      header: "File",
      sortable: true,
      render: (knowledgebase) => (
        <span className="text-sm text-gray-700">{knowledgebase.fileName}</span>
      ),
    },
    {
      field: "heading",
      header: "File heading",
      sortable: true,
      render: (knowledgebase) => (
        <span className="text-sm text-gray-700">{knowledgebase.heading}</span>
      ),
    },

    // {
    //   field: "fileStatus",
    //   header: "File Status",
    //   sortable: true,
    //   render: (knowledgebase) => (
    //     <span
    //       className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getFileStatusColor(knowledgebase.fileStatus)}`}
    //     >
    //       {knowledgebase.fileStatus || "-"}
    //     </span>
    //   ),
    // },
    // {
    //   field: "isActive",
    //   header: "Status",
    //   render: (knowledgebase) => (
    //     <ToggleSwitch
    //       isOn={knowledgebase.isActive}
    //       onToggle={() => handleStatusConfirm(knowledgebase)}
    //     />
    //   ),
    // },
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
  const handleDeleteConfirm = (knowledgebase) => {
    setConfirmMessage("Are you sure you want to delete this knowledgebase?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDeleteKnowledgebase(knowledgebase));
    setIsConfirmOpen(true);
  };

  const handleStatusConfirm = (knowledgebase) => {
    setConfirmMessage(
      `Are you sure you want to ${knowledgebase.isActive ? "deactivate" : "activate"} this knowledgebase?`,
    );
    setConfirmation(`Update Status`);
    setConfirmAction(() => () => handleStatusToggle(knowledgebase));
    setIsConfirmOpen(true);
  };
  const handleDeleteKnowledgebase = async (knowledgebase) => {
    try {
      await deleteKnowledgebase({
        KnowledgebaseId: knowledgebase.knowledgebaseId,
        StorePath: knowledgebase.storePath,
        FileName: knowledgebase.fileName,
        IsDelete: true,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("Knowledgebase deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the knowledgebase.",
      );
      console.error("Error deleting user:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };
  const handleStatusToggle = async (knowledgebase) => {
    try {
      const knowledgebaseDetail = {
        Id: knowledgebase?.knowledgebaseId || "",
        isActive: !knowledgebase.isActive,
        createdBy: currentUser.userId || "",
      };
      await updateKnowledgebaseStatus(knowledgebaseDetail);
      toast.success("Status updated successfully!");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setIsConfirmOpen(false);
    }
  };
  const handleStatusChange = (activeStatus) => {
    setTableConfig((prev) => ({
      ...prev,
      activeOnly: activeStatus,
    }));
  };
  const actions = (knowledgebase) => (
    <div className="flex space-x-3">
      <PermissionGuard path={location.pathname} action={4}>
        <Tooltip content={<p>Delete</p>}>
          <button
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDeleteConfirm(knowledgebase)}
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
        handleStatusChange={handleStatusChange}
        columns={columns}
        actions={actions}
        showMultiSwitch={false}
        searchPlaceholder="Search Knowledgebases..."
        noDataMessage="No Knowledgebases found"
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
          setSelectedKnowledgebase(null);
        }}
        title={
          selectedKnowledgebase ? "Edit Knowledgebase" : "Add Knowledgebase"
        }
      >
        <KnowledgebaseForm
          knowledgebase={selectedKnowledgebase}
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
