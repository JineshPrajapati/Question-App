import React, { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { SchoolList } from "../components/schools/SchoolList";
import { getSchoolsList } from "../../api/services/schoolService";
import Drawer from "../components/common/Drawer";
import { SchoolForm } from "../components/schools/SchoolForm";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { AuthContext } from "../../contexts/authContext";
import { Plus } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { LeaveList } from "../components/Leave/leaveList";
import { getLeavesList } from "../../api/services/leaveService";
import Model from "../components/common/Model";
import { LeaveForm } from "../components/Leave/LeaveForm";

export const Leaves = () => {
  const location = useLocation();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [formData, setFormData] = useState({
    reason: "",
    startDate: "",
    endDate: "",
  });
  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "LeaveId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicyearId: currSelectedAcademicYear,
    userId: user.userId,
  });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["leaves", tableConfig],
    queryFn: () => getLeavesList(tableConfig),
    keepPreviousData: true,
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { reason, startDate, endDate } = formData;
    const newErrors = {};

    if (!reason.trim()) newErrors.name = "reason name is required.";
    if (!startDate) newErrors.startDate = "Start date is required.";
    if (!endDate) newErrors.endDate = "End date is required.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date cannot be before start date.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const payload = {
      id: editingHolidayId || 0,
      schoolId: currSelectedSchool,
      reason: reason,
      startDate,
      endDate,
      createdBy: user.userId.toString(),
    };

    try {
      const res = await AddHoliday(payload);
      if (res?.isSuccess) {
        setShowModal(false);
        await refetch();
        toast.success(res?.message);
        resetForm();
        setEditingHolidayId(null);
      } else {
        toast.error(res?.message || "Failed to add holiday.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to save holiday");
    }
  };
  const resetForm = () => {
    setFormData({
      reason: "",
      startDate: "",
      endDate: "",
    });
    setErrors({});
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    setIsAddDrawerOpen(false);
    refetch();
  };

  useEffect(() => {
    setTableConfig((prevConfig) => ({
      ...prevConfig,
      schoolId: currSelectedSchool,
      academicYearId: currSelectedAcademicYear,
      pageNumber: 1,
    }));
  }, [currSelectedSchool, currSelectedAcademicYear]);
  return (
    <MainLayout
      pageTitle={"Vacation"}
      actionButton={() => (
        <div className="flex gap-4">
          <button
            className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
            onClick={() => setIsAddDrawerOpen(true)}
          >
            <Plus className="h-4 w-4 text-white" />
            Add Vacation
          </button>
        </div>
      )}
    >
      <LeaveList
        tableConfig={tableConfig}
        setTableConfig={setTableConfig}
        data={data}
        isLoading={isLoading}
        refetch={refetch}
        onRefresh={refetch}
      />

      <Drawer
        isFlexible={false}
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Leave Form"
      >
        <LeaveForm
          onSuccess={() => {
            setIsAddDrawerOpen(false);
            refetch();
          }}
          onSubmit={handleAddLeave}
          isSubmitting={false}
        />
      </Drawer>
    </MainLayout>
  );
};
