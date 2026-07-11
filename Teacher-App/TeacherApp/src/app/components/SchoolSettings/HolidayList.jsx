import React, { useState, useContext, useMemo } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon } from "@heroicons/react/24/outline";
import Model from "../common/Model";
import { AuthContext } from "../../../contexts/authContext";
import { useLocation } from "react-router";
import { Tooltip } from "../../components/common/Tooltip";
import { SquarePen } from "lucide-react";
import PermissionGuard from "../../wrappers/PermissionGaurd";

export const HolidayList = ({ data = [], isLoading, onEdit, onDelete }) => {
  const location = useLocation();
  const { user: currentUser } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const handleDeleteConfirm = (holiday) => {
    setConfirmMessage("Are you sure you want to delete this holiday?");
    setConfirmAction(() => () => {
      onDelete?.(holiday.id);
      setIsConfirmOpen(false);
    });
    setIsConfirmOpen(true);
  };

  // ✅ Client-side filtering + sorting
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Search
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.holidayName?.toLowerCase().includes(term) ||
          item.startDate?.toLowerCase().includes(term) ||
          item.endDate?.toLowerCase().includes(term),
      );
    }

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, search, sortField, sortDirection]);

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
  };

  const handleSort = (field) => {
    setSortField((prev) => {
      if (prev === field) {
        // Toggle direction
        setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
        return field;
      } else {
        setSortDirection("asc");
        return field;
      }
    });
  };

  const columns = [
    {
      field: "holidayName",
      header: "Holiday",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">{item.holidayName}</span>
      ),
    },
    {
      field: "startDate", // Use this for sorting
      header: "Date Range",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">
          {item.startDate?.split("T")[0]} - {item.endDate?.split("T")[0]}
        </span>
      ),
    },
    {
      field: "exclueSaturday", // Use this as sorting key
      header: "Weekend Exclusions",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">
          {item.exclueSaturday ? "Sat" : ""} {item.exclueSunday ? "Sun" : ""}
        </span>
      ),
    },
  ];

  const actions = (holiday) => (
    <div className="flex space-x-3">
      <PermissionGuard path={"/holiday"} action={3}>
        <Tooltip content={<p>Edit</p>}>
          <button
            className="text-primary hover:text-blue-900"
            onClick={() => onEdit?.(holiday)}
          >
            <SquarePen className="text-primary h-5 w-5" />
          </button>
        </Tooltip>
      </PermissionGuard>
      <PermissionGuard path={"/holiday"} action={4}>
        <Tooltip content={<p>Delete</p>}>
          <button
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDeleteConfirm(holiday)}
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
        data={filteredData}
        onSearch={handleSearch}
        onSort={handleSort}
        isLoading={isLoading}
        columns={columns}
        actions={actions}
        isShadow={false}
        showMultiSwitch={false}
        searchPlaceholder="Search holiday..."
        noDataMessage="No holiday found"
      />

      <Model
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Delete"
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
    </div>
  );
};
