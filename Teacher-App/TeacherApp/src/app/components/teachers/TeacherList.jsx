import { AuthContext } from "../../../contexts/authContext";
import React, { useState, useContext } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon } from "@heroicons/react/24/outline";
import Drawer from "../common/Drawer";
import { TeacherForm } from "./TeacherForm";
import { useLocation, useNavigate } from "react-router";
import Model from "../common/Model";
import { useMutation } from "@tanstack/react-query";
import {
  deleteTeacher,
  UpdateTeacherStatus,
} from "../../../api/services/teacherService";
import { toast } from "react-toastify";
import ToggleSwitch from "../common/ToggleSwitch";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { Tooltip } from "../common/Tooltip";
import { EyeIcon, SquarePen, User } from "lucide-react";

export const TeacherList = ({
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
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAllStudents, setIsAllStudents] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsDrawerOpen(false);
    setSelectedTeacher(null);
    onRefresh();
  };
  const handleDeleteConfirm = (teacher) => {
    setConfirmMessage("Are you sure you want to delete this teacher?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDeleteTeacher(teacher));
    setIsConfirmOpen(true);
  };

  const handleStatusConfirm = (teacher) => {
    setConfirmMessage(
      `Are you sure you want to ${teacher.isActive ? "deactivate" : "activate"} this teacher?`,
    );
    setConfirmation(`Update Status`);
    setConfirmAction(() => () => handleStatusToggle(teacher));
    setIsConfirmOpen(true);
  };

  const handleDeleteTeacher = async (teacher) => {
    try {
      await deleteTeacher({
        Id: teacher.teacherId,
        IsDelete: true,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("Teacher deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the teacher.",
      );
      console.error("Error deleting teacher:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleStatusToggle = async (teacher) => {
    try {
      const teacherDetail = {
        Id: teacher?.teacherId || "",
        isActive: !teacher.isActive,
        createdBy: currentUser.UserId || "",
      };
      await UpdateTeacherStatus(teacherDetail);
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
      field: "userCode",
      isForPending: false,
      header: "Teacher Code",
      sortable: true,
      render: (teacher) => (
        <span className="text-sm text-gray-700">{teacher.userCode}</span>
      ),
    },
    {
      field: "firstName",
      isForPending: true,
      header: "Name",
      sortable: true,
      render: (teacher) => (
        <span className="text-sm text-gray-700">
          {`${teacher.firstName} ${teacher.lastName}`}
        </span>
      ),
    },
    // {
    //   field: "phoneNumber",
    //   header: "Phone Number",
    //   isForPending: false,

    //   sortable: true,
    //   render: (teacher) => (
    //     <span className="text-sm text-gray-700">
    //       {teacher.phoneNumber || "-"}
    //     </span>
    //   ),
    // },
    {
      field: "emailAddress",
      header: "Email",
      isForPending: true,

      sortable: true,
      render: (teacher) => (
        <span className="text-sm text-gray-700">{teacher.email}</span>
      ),
    },
    // {
    //   field: "address",
    //   header: "Address",
    //   isForPending: false,

    //   sortable: true,
    //   render: (teacher) => (
    //     <span className="text-sm text-gray-700">{teacher.address || "-"}</span>
    //   ),
    // },
    // {
    //   field: "createdDate",
    //   header: "Created Date",
    //   isForPending: true,

    //   sortable: true,
    //   render: (teacher) => (
    //     <span className="text-sm text-gray-700">
    //       {teacher?.createdDate?.split("T")[0] || "-"}
    //     </span>
    //   ),
    // },
    {
      field: "isActive",
      header: "Status",
      render: (teacher) => (
        <ToggleSwitch
          isOn={teacher.isActive}
          onToggle={() => handleStatusConfirm(teacher)}
        />
      ),
    },
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

  const actions = (teacher) => {
    if (isAllStudents) {
      return (
        <div className="flex space-x-3">
          <Tooltip content={<p>Profile</p>}>
            <button
              className="text-primary cursor-pointer hover:text-blue-900"
              onClick={() => {
                // navigate("/teacher-profile");
                navigate("/teacher-profile", {
                  state: {
                    teacherId: teacher.teacherId,
                  },
                });
              }}
            >
              <User className="text-primary h-5 w-5" />
            </button>
          </Tooltip>

          {/*<Tooltip content={<p>View</p>}>*/}
          {/*  <button*/}
          {/*    className="text-primary cursor-pointer hover:text-blue-900"*/}
          {/*    onClick={() => {*/}
          {/*      navigate("/teachers/Update", {*/}
          {/*        state: {*/}
          {/*          teacherId: teacher.teacherId,*/}
          {/*          isEdit: true,*/}
          {/*          isView: true,*/}
          {/*        },*/}
          {/*      });*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <EyeIcon className="text-primary h-5 w-5" />*/}
          {/*  </button>*/}
          {/*</Tooltip>*/}
          <PermissionGuard path={location.pathname} action={3}>
            <Tooltip content={<p>Edit</p>}>
              <button
                className="text-primary cursor-pointer hover:text-blue-900"
                onClick={() => {
                  navigate("/teachers/Update", {
                    state: {
                      teacherId: teacher.teacherId,
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
                onClick={() => handleDeleteConfirm(teacher)}
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
        rowIdAccessor={(teacher) => teacher.teacherId}
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
        searchPlaceholder="Search teachers..."
        noDataMessage={
          isAllStudents ? "No teachers found" : "No Pending Teacher"
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
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTeacher(null);
        }}
        title={selectedTeacher ? "Edit Teacher" : "Add Teacher"}
      >
        <TeacherForm
          teacher={selectedTeacher}
          onSubmit={handleSubmit}
          isEdit={true}
          onSuccess={() => {
            setIsDrawerOpen(false);
            onRefresh();
          }}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedTeacher(null);
          }}
          isSubmitting={false}
        />
      </Drawer>
    </div>
  );
};
