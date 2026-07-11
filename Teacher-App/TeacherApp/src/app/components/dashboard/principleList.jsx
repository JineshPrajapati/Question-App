import React, { useState, useContext } from "react";

import { DataTable } from "../common/DataTable";

import { useLocation } from "react-router";

export const PrincipleList = ({
  onRefresh,
  data,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const location = useLocation();
  const columns = [
    {
      field: "SchoolName",
      header: "School",
      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">{school.SchoolName}</span>
      ),
    },
    {
      field: "PrincipalName",
      header: "Principal",
      sortable: true,
      render: (school) => (
        <span className="text-sm text-gray-700">{school.PrincipalName}</span>
      ),
    },
  ];

  return (
    <div className="space-y-3 rounded-xl bg-white p-4 shadow-lg sm:px-6 sm:pt-2 sm:pb-6">
      <DataTable
        data={data || []}
        totalItems={data?.totalRecords || 0}
        onPageSizeChange={false}
        onSearch={false}
        onSort={false}
        isLoading={isLoading || isRefetching}
        isShadow={false}
        handleStatusChange={false}
        columns={columns}
        actions={false}
        showMultiSwitch={false}
        showGlobalSearch={false}
        searchPlaceholder="Search principal..."
        noDataMessage="No principals found"
      />
    </div>
  );
};
