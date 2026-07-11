import { AuthContext } from "../../../contexts/authContext";
import React, { useState, useContext } from "react";
import { DataTable } from "../common/DataTable";
import { TrashIcon, TrophyIcon } from "@heroicons/react/24/outline";
import Drawer from "../common/Drawer";
import { StudentForm } from "./StudentForm";
import { useLocation, useNavigate } from "react-router";
import Model from "../common/Model";
import { EyeClosed, EyeIcon, SquarePen, User } from "lucide-react";
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

export const StudentList = ({
  onRefresh,
  tableConfig,
  setTableConfig,
  data,
  isLoading,
  refetch,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, currSelectedAcademicYear } =
    useContext(AuthContext);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAllStudents, setIsAllStudents] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [skipNote, setSkipNote] = useState(false);
  const [studentForReport, setStudentForReport] = useState(null);
  const [conferenceType, setConferenceType] = useState("InPerson");
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
  const handleDeleteConfirm = (student) => {
    setConfirmMessage("Are you sure you want to delete this student?");
    setConfirmation(`Confirm Delete`);
    setConfirmAction(() => () => handleDeleteStudent(student));
    setIsConfirmOpen(true);
  };

  const handleStatusConfirm = (student) => {
    setConfirmMessage(
      `Are you sure you want to ${student.isActive ? "deactivate" : "activate"} this student?`,
    );
    setConfirmation(`Update Status`);
    setConfirmAction(() => () => handleStatusToggle(student));
    setIsConfirmOpen(true);
  };

  const handleDeleteStudent = async (student) => {
    try {
      await deleteStudent({
        Id: student.studentId,
        IsDelete: true,
        CreatedIdentityBy: currentUser.userId,
      });
      toast.success("Student deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting the student.",
      );
      console.error("Error deleting student:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleGetStudentPteReport = (student) => {
    setNoteError(false);
    setStudentForReport(student);
    setIsNoteModalOpen(true);
  };

  const handleNoteAndDownload = async () => {
    try {
      if (!skipNote && noteText.trim() === "") {
        setNoteError(true);

        return;
      }
      setIsNoteModalOpen(false);
      await downloadStudentPteReport(studentForReport);
    } catch (error) {
      toast.error("Error adding note or downloading report.");
      console.error(error);
    } finally {
      setNoteText("");
      setSkipNote(false);
      setStudentForReport(null);
    }
  };

  const downloadStudentPteReport = async (student) => {
    try {
      const response = await generateStudentPteReport(
        student.studentNumber,
        skipNote ? "" : noteText,
        conferenceType,
        student.gradeId,
        currSelectedAcademicYear,
      );
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);

      const contentDisposition = response.headers["content-disposition"];
      let fileName = `PT-Conference Report_ ${student.firstName + "_" + student.lastName}`; // fallback

      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (match != null && match[1]) {
          fileName = match[1].replace(/['"]/g, "");
        }
      }

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Student report generated and downloaded!");
      refetch();
    } catch (error) {
      if (error.MSG_CODE == "NO_CONTENT") {
        toast.error("No result found");
      } else {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while Generating the student report.",
        );
      }

      console.error("Error generating student report:", error);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleStatusToggle = async (student) => {
    try {
      const studentDetail = {
        id: student?.studentId || "",
        isActive: !student.isActive,
        createdBy: currentUser.userId || "",
      };
      await UpdateStudentStatus(studentDetail);
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
      header: "First Name",
      sortable: true,
      render: (student) => (
        <span className="text-sm text-gray-700">{student.firstName}</span>
      ),
    },
    {
      field: "lastName",
      isForPending: true,
      header: "Last Name",
      sortable: true,
      render: (student) => (
        <span className="text-sm text-gray-700">{student.lastName}</span>
      ),
    },
    {
      field: "grade",
      isForPending: true,
      header: "Grade",
      sortable: true,
      render: (student) => (
        <span className="text-sm text-gray-700">{student.grade}</span>
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
    //   field: "emailAddress",
    //   header: "Email",
    //   isForPending: true,

    //   sortable: true,
    //   render: (student) => (
    //     <span className="text-sm text-gray-700">{student.email}</span>
    //   ),
    // },
    // {
    //   field: "address",
    //   header: "Address",
    //   isForPending: false,

    //   sortable: true,
    //   render: (student) => (
    //     <span className="text-sm text-gray-700">{student.address || "-"}</span>
    //   ),
    // },
    // {
    //   field: "createdDate",
    //   header: "Created Date",
    //   isForPending: true,

    //   sortable: true,
    //   render: (student) => (
    //     <span className="text-sm text-gray-700">
    //       {student?.createdDate?.split("T")[0] || "-"}
    //     </span>
    //   ),
    // },
    {
      field: "isActive",
      header: "Status",
      render: (student) => (
        <ToggleSwitch
          isOn={student.isActive}
          onToggle={() => handleStatusConfirm(student)}
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

  const actions = (student) => {
    if (isAllStudents) {
      return (
        <div className="flex space-x-3">
          <Tooltip content={<p>Profile</p>}>
            <button
              className="text-primary cursor-pointer hover:text-blue-900"
              onClick={() => {
                navigate("/student-profile", {
                  state: {
                    studentId: student.studentId,
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
          {/*      navigate("/students/Update", {*/}
          {/*        state: {*/}
          {/*          studentId: student.studentId,*/}
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
                  navigate("/students/Update", {
                    state: {
                      studentId: student.studentId,
                      isEdit: true,
                    },
                  });
                }}
              >
                <SquarePen className="text-primary h-5 w-5" />
              </button>
            </Tooltip>

            <Tooltip content={<p>Progress Report</p>}>
              <button
                className="hover:text-Green-500 text-yellow-600"
                onClick={() => handleGetStudentPteReport(student)}
              >
                <TrophyIcon className="h-5 w-5" />
              </button>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard path={location.pathname} action={4}>
            <Tooltip content={<p>Delete</p>}>
              <button
                className="text-red-600 hover:text-red-900"
                onClick={() => handleDeleteConfirm(student)}
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
        searchPlaceholder="Search students..."
        noDataMessage={
          isAllStudents ? "No students found" : "No Pending Student"
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

      {/* for add note to progress card */}
      <Model
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setConferenceType("InPerson");
        }}
        title="Progress Report Inputs"
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-start text-sm font-medium text-gray-700">
              Conference Type
            </label>
            <select
              value={conferenceType}
              onChange={(e) => setConferenceType(e.target.value)}
              className="w-full rounded border px-3 py-2"
            >
              <option value="InPerson">In Person</option>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="NoConference">No Conference</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={skipNote}
              onChange={(e) => setSkipNote(e.target.checked)}
              id="skipNote"
            />
            <label htmlFor="skipNote">Do not want to add notes</label>
          </div>

          {!skipNote && (
            <>
              <textarea
                className={`mb-0 w-full rounded border p-2 ${
                  noteError ? "border-red-500" : "border-gray-300"
                }`}
                rows="3"
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                  if (e.target.value.trim()) {
                    setNoteError(false); // clear error if valid
                  }
                }}
                placeholder="Enter note for student report..."
              />
              {noteError && (
                <p className="text-start text-sm text-red-500">
                  Note is required before generating report.
                </p>
              )}
            </>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button
              className="rounded bg-gray-300 px-4 py-2"
              onClick={() => setIsNoteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="bg-primary rounded px-4 py-2 text-white"
              onClick={handleNoteAndDownload}
            >
              Download
            </button>
          </div>
        </div>
      </Model>

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
