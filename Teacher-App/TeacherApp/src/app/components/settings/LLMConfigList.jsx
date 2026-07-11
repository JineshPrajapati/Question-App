import React from "react";
import { DataTable } from "../common/DataTable";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Settings } from "lucide-react";

export const LLMConfigList = ({ llmConfig, onRefresh }) => {
  const columns = [
    { field: "code", header: "Code", width: "50px" },
    { field: "name", header: "Role Name" },
  ];

  const actions = (item) => (
    <div className="flex space-x-3">
      <button className="text-primary hover:text-blue-900">
        <PencilIcon className="text-primary h-5 w-5" />
      </button>
      <button className="text-red-600 hover:text-red-900">
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <DataTable
      data={llmConfig}
      columns={columns}
      actions={actions}
      searchPlaceholder="Search LLM Config..."
      noDataMessage="No LLM Config found"
    />
  );
};
