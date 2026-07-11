"use client";
import React, { useState } from "react";
import { SearchBar } from "./SearchBar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FunnelIcon,
} from "lucide-react";
import clsx from "clsx";
import { LoadingSpinner } from "./LoadingSpinner";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { Multitoggle } from "./MultiToggle";

export const DataTable = ({
  data,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearch,
  handleStatusChange,
  searchTerm,
  onSort,
  isLoading,
  columns,
  actions,
  isShadow = true,
  searchPlaceholder = "Search...",
  noDataMessage = "No data found",
  showGlobalSearch = true,
  handleSelectedDelete,
  handleFilterAction = false,
  showMultiSwitch = true,
  filter = false,
  filterCount = 1,
  selectedRows = [],
  onRowSelectChange = () => {},
  onSelectAllChange = () => {},
  onSelectRowChange = () => {},
  enableSelect = false,
  rowIdAccessor = (item) => item.id,
}) => {
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: null,
  });

  const handleSearch = (e) => {
    onSearch?.(e.target.value);
  };

  const handleSort = (field) => {
    onSort?.(field, sortConfig.direction === "asc" ? "DESC" : "ASC");
    setSortConfig({
      field: field,
      direction: sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const rowIds = data.map(rowIdAccessor);
  const isAllSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedRows.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onRowSelectChange?.([]);
    } else {
      onRowSelectChange?.(rowIds);
    }
  };

  const toggleSelectRow = (id) => {
    const newSelection = selectedRows.includes(id)
      ? selectedRows.filter((itemId) => itemId !== id)
      : [...selectedRows, id];

    onRowSelectChange?.(newSelection);
  };

  return (
    <div
      className={`rounded-xl bg-white ${isShadow ? "shadow-lg" : ""} w-full space-y-4 sm:space-y-6`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {showGlobalSearch && (
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full sm:w-72"
          />
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            {enableSelect && selectedRows.length > 0 && (
              <button
                onClick={handleSelectedDelete}
                className="border-primary text-primary hover:bg-primary/10 flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
              >
                Reject
              </button>
            )}
            {showMultiSwitch && <Multitoggle onChange={handleStatusChange} />}
          </div>
          <div className="flex items-center">
            {filter && (
              <button
                className="border-primary text-primary relative flex cursor-pointer items-center gap-1 rounded border px-3 py-1 shadow-sm hover:bg-blue-50"
                onClick={() => handleFilterAction(true)}
              >
                <FunnelIcon className="h-4 w-4" />
                Filter
                {filterCount > 0 && (
                  <div className="bg-primary absolute -top-2 -right-2 flex h-4.5 w-4.5 items-center justify-center rounded-full">
                    <p className="text-[11px] font-bold text-white">
                      {filterCount}
                    </p>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner fullHeight={false} />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {enableSelect && (
                  <th className="py-4 pl-2">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={clsx(
                      "px-6 py-4 text-left text-sm font-semibold text-gray-900",
                      column.sortable && "cursor-pointer hover:bg-gray-100",
                    )}
                    style={column.width ? { width: column.width } : {}}
                    onClick={() => column.sortable && handleSort(column.field)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable &&
                        sortConfig.field === column.field &&
                        (sortConfig.direction !== "asc" ? (
                          <ArrowDownIcon className="text-primary h-4 w-4" />
                        ) : (
                          <ArrowUpIcon className="text-primary h-4 w-4" />
                        ))}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
                    style={{ width: "50px" }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {data?.length > 0 ? (
                data.map((item, rowIndex) => {
                  const rowId = rowIdAccessor(item);
                  return (
                    <tr key={rowId ?? rowIndex} className="hover:bg-gray-50">
                      {enableSelect && (
                        <td className="py-4 pl-2">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowId)}
                            onChange={() => toggleSelectRow(rowId)}
                          />
                        </td>
                      )}
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 text-left whitespace-nowrap"
                        >
                          {column.render ? (
                            column.render(item)
                          ) : (
                            <span className="text-gray-700">
                              {item[column.field]}
                            </span>
                          )}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {actions(item)}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (actions ? 1 : 0) +
                      (enableSelect ? 1 : 0)
                    }
                    className="px-6 py-8 text-center text-gray-700"
                  >
                    {noDataMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of <span className="font-semibold">{totalItems}</span> results
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Smart Pagination */}
            {(() => {
              const pageCount = Math.ceil(totalItems / pageSize);
              const pageNumbers = [];

              if (pageCount <= 5) {
                for (let i = 1; i <= pageCount; i++) pageNumbers.push(i);
              } else {
                if (currentPage <= 3) {
                  pageNumbers.push(1, 2, 3, 4, "...", pageCount);
                } else if (currentPage >= pageCount - 2) {
                  pageNumbers.push(
                    1,
                    "...",
                    pageCount - 3,
                    pageCount - 2,
                    pageCount - 1,
                    pageCount,
                  );
                } else {
                  pageNumbers.push(
                    1,
                    "...",
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    "...",
                    pageCount,
                  );
                }
              }

              return pageNumbers.map((page, index) =>
                page === "..." ? (
                  <span key={index} className="px-2 text-sm text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={clsx(
                      "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium",
                      currentPage === page
                        ? "bg-primary text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    {page}
                  </button>
                ),
              );
            })()}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalItems / pageSize)}
              className="pagination-btn"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.ceil(totalItems / pageSize))}
              disabled={currentPage === Math.ceil(totalItems / pageSize)}
              className="pagination-btn"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="outline-primary rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
