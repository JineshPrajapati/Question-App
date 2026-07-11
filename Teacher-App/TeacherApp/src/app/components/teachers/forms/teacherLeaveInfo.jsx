import React, { useContext, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "../../form/FormElements";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { teacherLeaveFormValidation } from "../../form/validationSchema";
import { Plus } from "lucide-react";
import { Tooltip } from "../../common/Tooltip";
import { SquarePen } from "lucide-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import Model from "../../common/Model";

const jsonKey = "TeachersVacation";

export const TeacherLeaveInfo = ({
  handleSubmitForm,
  myDetails: teacherDetails,
  submitingData,
  isLoading,
}) => {
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isDuplicateWarningOpen, setIsDuplicateWarningOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [duplicateReason, setDuplicateReason] = useState("");

  const [duplicateDates, setDuplicateDates] = useState([]);

  useEffect(() => {
    if (teacherDetails?.[jsonKey]) {
      const leaves = (teacherDetails[jsonKey] || []).map((g) => ({
        leaveDate: g?.LeaveDate || "",
        reason: g?.Reason || "",
      }));

      const initialValues = {
        leaveStartDate: "",
        leaveEndDate: "",
        reason: "",
      };

      setFormInitialValues(initialValues);
      setLeaveData(leaves);
      setIsDataReady(true);
    }
  }, [teacherDetails]);

  const formik = useFormik({
    initialValues: formInitialValues,
    enableReinitialize: true,
    validationSchema: teacherLeaveFormValidation,
    // validateOnMount: true,
    onSubmit: (values) => {
      const start = new Date(values.leaveStartDate);
      const end = new Date(values.leaveEndDate);
      const reason = values.reason;

      const newLeaves = [];

      for (
        let date = new Date(start);
        date <= end;
        date.setDate(date.getDate() + 1)
      ) {
        const day = date.getDay();
        if (day === 0 || day === 6) continue;
        const dateStr = date.toISOString().split("T")[0]; // format: YYYY-MM-DD
        newLeaves.push({
          leaveDate: dateStr,
          reason: reason,
        });
      }

      if (editIndex !== null) {
        const updatedLeaves = [...leaveData];
        updatedLeaves[editIndex] = newLeaves[0]; // only use the first date in case of edit
        setLeaveData(updatedLeaves);
        setEditIndex(null);
      } else {
        setLeaveData((prev) => {
          const existingDates = new Set(prev.map((leave) => leave.leaveDate));
          const filteredNewLeaves = newLeaves.filter(
            (leave) => !existingDates.has(leave.leaveDate),
          );

          const skipped = newLeaves
            .filter((leave) => existingDates.has(leave.leaveDate))
            .map((leave) => leave.leaveDate);

          if (skipped.length > 0) {
            setDuplicateDates(skipped);
            setDuplicateReason(reason);
            setIsDuplicateWarningOpen(true);
          }

          return [...prev, ...filteredNewLeaves];
        });
      }

      formik.resetForm();
      setIsConfirmOpen(false);
    },
  });

  const handleAddLeave = () => {
    const payload = leaveData.map((leave) => ({
      ...leave,
    }));

    handleSubmitForm(payload, jsonKey);
  };

  const handleEditLeave = (index) => {
    const selectedLeave = leaveData[index];

    formik.setValues({
      leaveStartDate: selectedLeave.leaveDate,
      leaveEndDate: selectedLeave.leaveDate,
      reason: selectedLeave.reason,
    });

    setEditIndex(index);
    setIsConfirmOpen(true);
  };

  const handleDeleteLeave = (index) => {
    setDeleteIndex(index);
    setIsConfirmDelete(true);
  };

  const confirmDeleteLeave = () => {
    const updated = [...leaveData];
    updated.splice(deleteIndex, 1);
    setLeaveData(updated);
    setDeleteIndex(null);
    setIsConfirmDelete(false);
  };

  const handleUpdateDuplicateReasons = () => {
    const updated = [...leaveData];

    duplicateDates.forEach((dupDate) => {
      const index = updated.findIndex((leave) => leave.leaveDate === dupDate);
      if (index !== -1) {
        updated[index].reason = duplicateReason; // use saved reason
      }
    });

    setLeaveData(updated);
    setIsDuplicateWarningOpen(false);
    setDuplicateDates([]);
    setDuplicateReason(""); // clear after use
  };

  if (!isDataReady || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex max-h-full flex-col gap-2 overflow-hidden">
      {/* Add Leave Button */}
      <div className="flex w-full justify-end gap-2">
        <button
          type="button"
          className="bg-primary hover:bg-primary flex items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
          onClick={() => {
            setEditIndex(null); // clear edit state
            formik.resetForm(); // reset form before open
            setIsConfirmOpen(true);
          }}
        >
          <Plus className="h-4 w-4 text-white" />
          Add New Leave
        </button>
      </div>

      {/* Leave Table */}

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Leave Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Reason
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {leaveData.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-left text-gray-700">
                  No leave entries
                </td>
              </tr>
            ) : (
              leaveData.map((leave, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-left text-gray-700">
                    {leave.leaveDate}
                  </td>
                  <td className="px-6 py-4 text-left text-gray-700">
                    {leave.reason}
                  </td>
                  <td
                    className={`px-6 py-4 text-left ${
                      new Date() > new Date(leave.leaveDate)
                        ? "pointer-events-none cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <div className="flex space-x-3">
                      <Tooltip content={<p>Edit</p>}>
                        <button
                          className={`h-5 w-5 text-red-600 hover:text-red-900 ${
                            new Date() > new Date(leave.leaveDate)
                              ? "pointer-events-none cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          type="button"
                          onClick={() => handleEditLeave(index)}
                        >
                          <SquarePen className="h-5 w-5" />
                        </button>
                      </Tooltip>
                      <Tooltip content={<p>Delete</p>}>
                        <button
                          className="text-red-600 hover:text-red-900"
                          type="button"
                          onClick={() => handleDeleteLeave(index)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Leave Modal */}
      <Model
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={editIndex !== null ? "Update Leave" : "Add Leave"}
      >
        <form className="form" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FormLabel htmlFor="leaveStartDate">
                {editIndex !== null ? "Leave Date" : "Start Date"}
              </FormLabel>
              <FormInput
                id="leaveStartDate"
                type="date"
                name="leaveStartDate"
                {...formik.getFieldProps("leaveStartDate")}
                disabled={editIndex !== null}
                min={new Date().toISOString().split("T")[0]}
              />
              {formik.touched.leaveStartDate &&
                formik.errors.leaveStartDate && (
                  <div className="mt-1 text-sm text-red-500">
                    {formik.errors.leaveStartDate}
                  </div>
                )}
            </div>
            {editIndex == null && (
              <div>
                <FormLabel htmlFor="leaveEndDate">End Date</FormLabel>
                <FormInput
                  id="leaveEndDate"
                  type="date"
                  name="leaveEndDate"
                  {...formik.getFieldProps("leaveEndDate")}
                  min={new Date().toISOString().split("T")[0]}
                />
                {formik.touched.leaveEndDate && formik.errors.leaveEndDate && (
                  <div className="mt-1 text-sm text-red-500">
                    {formik.errors.leaveEndDate}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <FormLabel htmlFor="reason">Reason</FormLabel>
            <FormTextarea
              id="reason"
              name="reason"
              maxLength="500"
              {...formik.getFieldProps("reason")}
            />
            {formik.touched.reason && formik.errors.reason && (
              <div className="mt-1 text-sm text-red-500">
                {formik.errors.reason}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-primary mt-3 rounded px-4 py-2 text-white"
            style={{ cursor: "pointer" }}
            disabled={formik.errors.reason == ""}
          >
            {editIndex !== null ? "Update Leave" : "Add Leave"}
          </button>
        </form>
      </Model>

      {/* Delete Confirmation Modal */}
      <Model
        isOpen={isConfirmDelete}
        onClose={() => setIsConfirmDelete(false)}
        title="Confirm Delete?"
      >
        <p>Are you sure you want to delete this leave entry?</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            className="rounded bg-gray-300 px-4 py-2"
            onClick={() => setIsConfirmDelete(false)}
          >
            Cancel
          </button>
          <button
            className="bg-primary rounded px-4 py-2 text-white"
            onClick={confirmDeleteLeave}
          >
            Delete
          </button>
        </div>
      </Model>

      {/* Duplicate Date Warning Modal */}
      <Model
        isOpen={isDuplicateWarningOpen}
        onClose={() => setIsDuplicateWarningOpen(false)}
        title="Duplicate Leave Entries – Update or Skip"
      >
        <p className="mb-2">Modify reason or skip existing leave entries?</p>
        {duplicateDates.map((date, idx) => (
          <p key={idx}>{date}</p>
        ))}

        <div className="mt-4 flex justify-end gap-3">
          <button
            className="rounded bg-gray-300 px-4 py-2"
            onClick={() => setIsDuplicateWarningOpen(false)}
          >
            Skip
          </button>
          <button
            className="bg-primary rounded px-4 py-2 text-white"
            onClick={handleUpdateDuplicateReasons}
          >
            Update
          </button>
        </div>
      </Model>

      {/* Final Submit Button */}
      <div className="flex w-full justify-end gap-2">
        <button
          type="button"
          disabled={submitingData}
          onClick={() => {
            // Trigger final submission here
            handleAddLeave();
          }}
          className="bg-primary flex gap-2 rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitingData && (
            <LoadingSpinner fullHeight={false} color="white" size={4} />
          )}
          Save & Continue
        </button>
      </div>
    </div>
  );
};
