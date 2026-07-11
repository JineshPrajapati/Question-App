import { AuthContext } from "../../../contexts/authContext";
import React, { useState, useContext } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon, TrophyIcon } from "@heroicons/react/24/outline";
import Drawer from "../common/Drawer";
import { StudentForm } from "../students/StudentForm";
import { useLocation, useNavigate } from "react-router";
import Model from "../common/Model";
import { EyeIcon, SquarePen } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  deleteStudent,
  UpdateStudentStatus,
} from "../../../api/services/studentService";
import { toast } from "react-toastify";
import ToggleSwitch from "../common/ToggleSwitch";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { Tooltip } from "../common/Tooltip";
import { generateStudentPteReport } from "../../../api/services/reportService";

export const MyStudentList = ({
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAllStudents, setIsAllStudents] = useState(true);

  const [noteError, setNoteError] = useState(false);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    // After successful submission:
    setIsDrawerOpen(false);
    setSelectedStudent(null);
    onRefresh();
  };

  const columns = [
    {
      field: "studentNumber",
      isForPending: false,
      header: "Student Code",
      sortable: true,
      render: (student) => (
        <span className="text-sm text-gray-700">{student.studentNumber}</span>
      ),
    },

    {
      field: "firstName",
      isForPending: true,
      header: "Name",
      sortable: true,
      render: (student) => (
        <span className="text-sm text-gray-700">
          {`${student.firstName} ${student.lastName}`}
        </span>
      ),
    },
    {
      field: "grade",
      header: "Grade",
      isForPending: true,

      sortable: true,
      render: (student) => (
        <span className="text-sm text-gray-700"> {student.grade || "-"} </span>
      ),
    },
    {
      field: "phoneNumber",
      header: "Phone Number",
      isForPending: false,

      sortable: true,
      render: (student) => (
        <span className="text-sm text-gray-700">
          {student.phoneNumber || "-"}
        </span>
      ),
    },

    // {
    //   field: "isActive",
    //   header: "Status",
    //   render: (student) => (
    //     <ToggleSwitch
    //       isOn={student.isActive}
    //       onToggle={() => handleStatusConfirm(student)}
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
      pageNumber: 1,
    }));
  };

  const handleStatusChange = (activeStatus) => {
    setTableConfig((prev) => ({
      ...prev,
      activeOnly: activeStatus,
    }));
  };

  const actions = (student) => {
    if (isAllStudents) {
      return (
        <div className="flex space-x-3">
          <Tooltip content={<p>View</p>}>
            <button
              className="text-primary cursor-pointer hover:text-blue-900"
              onClick={() => {
                navigate("/mystudents/View", {
                  state: {
                    studentId: student.studentId,
                    isEdit: false,
                    isView: true,
                  },
                });
              }}
            >
              <EyeIcon className="text-primary h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      );
    }
  };

  return (
    <div className="space-y-3 rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <DataTable
        // enableSelect={true}
        selectedRows={selectedRows}
        // handleSelectedDelete={handleSelectedDelete}
        rowIdAccessor={(student) => student.studentId}
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
        searchPlaceholder="Search students..."
        noDataMessage={
          isAllStudents ? "No students found" : "No Pending Student"
        }
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedStudent(null);
        }}
        title={selectedStudent ? "Edit Student" : "Add Student"}
      >
        <StudentForm
          student={selectedStudent}
          onSubmit={handleSubmit}
          isEdit={true}
          onSuccess={() => {
            setIsDrawerOpen(false);
            onRefresh();
          }}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedStudent(null);
          }}
          isSubmitting={false}
        />
      </Drawer>
    </div>
  );
};
