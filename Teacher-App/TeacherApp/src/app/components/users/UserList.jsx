import { AuthContext } from "../../../contexts/authContext";
import React, { useState, useContext } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon } from "@heroicons/react/24/outline";
import Drawer from "../common/Drawer";
import { UserForm } from "./UserForm";
import { useLocation } from "react-router";
import { ApproveUserForm } from "./ApproveUserForm";
import Model from "../common/Model";
import { CheckCircleIcon, SquarePen, XCircleIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  deleteUser,
  UpdateUserStatus,
  rejactPendingApprovals,
} from "../../../api/services/userService";
import { toast } from "react-toastify";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { Tooltip } from "../../components/common/Tooltip";

export const UserList = ({
  onRefresh,
  tableConfig,
  setTableConfig,
  data,
  isLoading,
  refetch,
}) => {
  const location = useLocation();

  const { user: currentUser } = useContext(AuthContext);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isApproveUserOpen, setIsApproveUserOpen] = useState(false);
  const [isAllUsers, setIsAllUsers] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleDeleteConfirm1 = (userIdentityId) => {
    setConfirmMessage("Are you sure you want to delete this pending approval?");
    setConfirmation("Confirm Delete");
    setConfirmAction(
      () => () => rejectUnapprovedUserMutation({ userIdentityId }),
    );
    setIsConfirmOpen(true);
  };

  const { mutate: rejectUnapprovedUserMutation, isPending: deletingUsers } =
    useMutation({
      mutationFn: (payload) => rejactPendingApprovals(payload),
      onSuccess: (response) => {
        if (response.isSuccess) {
          try {
            toast.success("Users rejected successfully!");
            setIsConfirmOpen(false);
            setSelectedRows([]);
            refetch();
          } catch (e) {
            console.error(e);
          }
        } else {
          toast.error(response.message || "An error occurred");
        }
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred");
      },
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    // After successful submission:
    setIsDrawerOpen(false);
    setSelectedUser(null);
    onRefresh();
  };
  const handleDeleteConfirm = (user) => {
    setConfirmMessage("Are you sure you want to delete this user?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDeleteUser(user));
    setIsConfirmOpen(true);
  };

  const handleStatusConfirm = (user) => {
    setConfirmMessage(
      `Are you sure you want to ${user.isActive ? "deactivate" : "activate"} this user?`,
    );
    setConfirmation(`Update Status`);
    setConfirmAction(() => () => handleStatusToggle(user));
    setIsConfirmOpen(true);
  };

  const handleDeleteUser = async (user) => {
    try {
      await deleteUser({
        UserIdentityId: user.userId,
        IsDelete: true,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("User deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the user.",
      );
      console.error("Error deleting user:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const userDetail = {
        UserIdentityId: user?.userId || "",
        isActive: !user.isActive,
        createdBy: currentUser.userId || "",
      };
      await UpdateUserStatus(userDetail);
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
      header: "User Code",
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-700">{user.userCode}</span>
      ),
    },
    {
      field: "firstName",
      isForPending: true,
      header: "Name",
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-700">
          {`${user.firstName} ${user.lastName}`}
        </span>
      ),
    },
    {
      field: "email",
      header: "Email",
      isForPending: true,

      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-700">{user.email}</span>
      ),
    },
    // {
    //   field: "userType",
    //   isForPending: false,

    //   header: "Type",
    //   sortable: true,
    //   render: (user) => (
    //     <span className="text-sm text-gray-700">{user.userType}</span>
    //   ),
    // },
    {
      field: "roleName",
      header: "Role",
      isForPending: false,

      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-700">{user.roleName || "-"}</span>
      ),
    },
    // {
    //   field: "phoneNumber",
    //   header: "Contact",
    //   isForPending: false,

    //   sortable: true,
    //   render: (user) => (
    //     <span className="text-sm text-gray-700">{user.phoneNumber || "-"}</span>
    //   ),
    // },
    // {
    //   field: "address",
    //   header: "Address",
    //   isForPending: false,

    //   sortable: true,
    //   render: (user) => (
    //     <span className="text-sm text-gray-700">{user.address || "-"}</span>
    //   ),
    // },
    // {
    //   field: "createdDate",
    //   header: "Created Date",
    //   isForPending: true,

    //   sortable: true,
    //   render: (user) => (
    //     <span className="text-sm text-gray-700">
    //       {user?.createdDate?.split("T")[0] || "-"}
    //     </span>
    //   ),
    // },
    {
      field: "isActive",
      header: "Status",
      render: (user) => (
        <ToggleSwitch
          isOn={user.isActive}
          onToggle={() => handleStatusConfirm(user)}
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

  const handleSelectedDelete = async () => {
    rejectUnapprovedUserMutation({
      userIdentityId: selectedRows.join(","),
    });
  };
  const handleStatusChange = (activeStatus) => {
    setTableConfig((prev) => ({
      ...prev,
      activeOnly: activeStatus,
    }));
  };

  const actions = (user) => {
    if (isAllUsers) {
      return (
        <div className="flex space-x-3">
          <PermissionGuard path={location.pathname} action={3}>
            <Tooltip content={<p>Edit</p>}>
              <button
                className="text-primary cursor-pointer hover:text-blue-900"
                onClick={() => handleEdit(user)}
              >
                <SquarePen className="text-primary h-5 w-5" />
              </button>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard path={location.pathname} action={4}>
            <Tooltip content={<p>Delete</p>}>
              <button
                className="text-red-600 hover:text-red-900"
                onClick={() => handleDeleteConfirm(user)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </Tooltip>
          </PermissionGuard>
        </div>
      );
    } else {
      return (
        <div className="flex space-x-3">
          <Tooltip content={<p>Approve</p>}>
            <button
              className="text-primary cursor-pointer hover:text-blue-900"
              onClick={() => {
                setSelectedUser(user);
                setIsApproveUserOpen(true);
              }}
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
          </Tooltip>
          <Tooltip content={<p>Disgard</p>}>
            <button
              onClick={() => handleDeleteConfirm1(user.userId)}
              className="cursor-pointer text-red-600 hover:text-red-900"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      );
    }
  };

  return (
    <div className="space-y-3 rounded-xl bg-white p-4 shadow-lg sm:px-6 sm:pt-2 sm:pb-6">
      <div className="flex items-center gap-0 border-b border-gray-300 pb-2">
        <button
          className={`cursor-pointer px-4 py-2 outline-none ${isAllUsers ? "text-primary border-primary border-b-2 font-bold" : "text-gray-700"}`}
          onClick={() => {
            setIsAllUsers(true);
            setTableConfig((prev) => ({
              ...prev,
              activeOnly: 3,
              pageNumber: 1,
            }));
          }}
        >
          All Users
        </button>
        <button
          className={`cursor-pointer px-4 py-2 ${!isAllUsers ? "text-primary border-primary border-b-2 font-bold" : "text-gray-700"}`}
          onClick={() => {
            setIsAllUsers(false);
            setTableConfig((prev) => ({
              ...prev,
              activeOnly: 4,
              pageNumber: 1,
            }));
          }}
        >
          Pending Approval
        </button>
      </div>

      <DataTable
        enableSelect={isAllUsers ? false : true}
        selectedRows={selectedRows}
        handleSelectedDelete={handleSelectedDelete}
        rowIdAccessor={(user) => user.userId}
        onRowSelectChange={setSelectedRows}
        data={data?.data || []}
        totalItems={data?.totalRecords || 0}
        currentPage={tableConfig.pageNumber}
        pageSize={tableConfig.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        searchTerm={tableConfig.search}
        showMultiSwitch={isAllUsers ? true : false}
        setTableConfig={setTableConfig}
        onSort={handleSort}
        isShadow={false}
        handleStatusChange={handleStatusChange}
        isLoading={isLoading}
        columns={
          isAllUsers ? columns : columns.filter((col) => col.isForPending)
        }
        actions={actions}
        searchPlaceholder="Search users..."
        noDataMessage={isAllUsers ? "No users found" : "No Pending User"}
      />
      <Model
        isOpen={isApproveUserOpen}
        onClose={() => setIsApproveUserOpen(false)}
        title="Verify User"
      >
        <ApproveUserForm
          user={selectedUser}
          onSubmit={() => {}}
          isSubmitting={false}
          onClose={() => setIsApproveUserOpen(false)}
          onSuccess={() => {
            setIsApproveUserOpen(false);
            onRefresh();
          }}
        />
      </Model>

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
        isFlexible={true}
        maxWidth="1250px"
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? "Edit User" : "Add User"}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleSubmit}
          isEdit={true}
          onSuccess={() => {
            setIsDrawerOpen(false);
            onRefresh();
          }}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedUser(null);
          }}
          isSubmitting={false}
        />
      </Drawer>
    </div>
  );
};
