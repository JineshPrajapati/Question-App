import React, { useState, useEffect, useContext } from "react";
import { GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { HolidayList } from "./HolidayList";
import Model from "../common/Model";
import { AuthContext } from "../../../contexts/authContext";
import {
  getHolidayList,
  AddHoliday,
  deleteHoliday,
} from "../../../api/services/SettingsService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import PermissionGuard from "../../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { getDashboardData } from "../../../api/services/dashboardService";
import { Calendar, CalendarClock, CalendarDays } from "lucide-react";

const HolidaySettings = () => {
  const { user, currSelectedSchool, currSelectedAcademicYear } =
    useContext(AuthContext);
  const location = useLocation();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    excludeSaturday: false,
    excludeSunday: false,
  });

  const schoolId = currSelectedSchool;
  const {
    data: holidayListResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["holidayList", schoolId, currSelectedAcademicYear],
    queryFn: () =>
      getHolidayList(schoolId, currSelectedAcademicYear, user.userId),
    enabled: !!schoolId,
  });

  const holidays = (holidayListResponse?.data?.data || []).map((h) => ({
    id: h.id,
    name: h.holidayName,
    startDate: new Date(h.startDate),
    endDate: new Date(h.endDate),
    excludeSaturday: h.exclueSaturday,
    excludeSunday: h.exclueSunday,
  }));
  const resetForm = () => {
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      excludeSaturday: false,
      excludeSunday: false,
    });
    setErrors({});
  };
  const handleAddHoliday = () => setShowModal(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, startDate, endDate, excludeSaturday, excludeSunday } =
      formData;
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Holiday name is required.";
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
      holidayName: name,
      startDate,
      endDate,
      exclueSaturday: excludeSaturday,
      exclueSunday: excludeSunday,
      createdBy: user.userId.toString(),
      academicYearId: currSelectedAcademicYear,
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

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const now = new Date();
  const days = getDaysInMonth(currentDate);

  const isHoliday = (day) =>
    holidays.find(
      (h) =>
        day >= new Date(h.startDate.setHours(0, 0, 0, 0)) &&
        day <= new Date(h.endDate.setHours(23, 59, 59, 999)),
    );

  const upcomingHolidays = holidays.filter((h) => h.endDate >= now);

  const currentMonthHolidays = holidays.filter((h) => {
    const start = h.startDate;
    const end = h.endDate;
    return (
      (start.getMonth() === currentDate.getMonth() &&
        start.getFullYear() === currentDate.getFullYear()) ||
      (end.getMonth() === currentDate.getMonth() &&
        end.getFullYear() === currentDate.getFullYear()) ||
      (start <=
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0) &&
        end >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
    );
  });

  return (
    <div className="flex h-full flex-col px-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-xl p-2">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-left text-gray-800"> Manage School Calendar</h2>
            {/*<p className="text-left text-gray-600">*/}
            {/*  Manage school holidays and academic calendar*/}
            {/*</p>*/}
          </div>
        </div>
        <PermissionGuard path={"/holiday"} action={2}>
          <button
            onClick={handleAddHoliday}
            className="bg-primary rounded px-4 py-2 text-white"
          >
            Add Holiday
          </button>
        </PermissionGuard>
      </div>

      {/* Modal */}
      <Model
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
          setEditingHolidayId(null);
        }}
        title="Add New Holiday"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Holiday Name</label>
            <input
              type="text"
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Enter holiday name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && (
              <p className="mt-1 text-left text-red-600">{errors.name}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="mt-1 w-full rounded border px-3 py-2"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
              {errors.startDate && (
                <p className="mt-1 text-left text-red-600">
                  {errors.startDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                className="mt-1 w-full rounded border px-3 py-2"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
              {errors.endDate && (
                <p className="mt-1 text-left text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Weekend Exclusions
            </label>
            <div className="mt-1 space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.excludeSaturday}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      excludeSaturday: e.target.checked,
                    })
                  }
                />
                <span>Exclude Saturdays</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.excludeSunday}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      excludeSunday: e.target.checked,
                    })
                  }
                />
                <span>Exclude Sundays</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
                setEditingHolidayId(null);
              }}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary rounded px-4 py-2 text-white"
            >
              Add Holiday
            </button>
          </div>
        </form>
      </Model>

      {/* Summary Cards */}
      <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="from-primary to-primary flex items-center rounded-2xl p-4 text-black shadow-md">
          <div className="rounded-lg bg-gray-200 p-4">
            <Calendar className="text-primary h-6 w-6" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium">Total Holidays</p>
            <p className="text-2xl font-bold">{holidays.length ?? 0} </p>
          </div>

          {/*<p className="text-xs font-medium">Total Holidays</p>*/}
          {/*<p className="text-2xl font-bold">{holidays.length}</p>*/}
        </div>
        <div className="from-primary to-primary flex items-center rounded-2xl p-4 text-black shadow-md">
          <div className="rounded-lg bg-gray-200 p-4">
            <CalendarClock className="text-primary h-6 w-6" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium">Upcoming Holidays</p>
            <p className="text-2xl font-bold">
              {upcomingHolidays.length ?? 0}{" "}
            </p>
          </div>
          {/*<p className="text-xs font-medium">Upcoming Holidays</p>*/}
          {/*<p className="text-2xl font-bold">{upcomingHolidays.length}</p>*/}
        </div>
        <div className="from-primary to-primary flex items-center rounded-2xl p-4 text-black shadow-md">
          <div className="rounded-lg bg-gray-200 p-4">
            <CalendarDays className="text-primary h-6 w-6" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium">This Month</p>
            <p className="text-2xl font-bold">
              {currentMonthHolidays.length ?? 0}{" "}
            </p>
          </div>
          {/*<p className="text-xs font-medium">This Month</p>*/}
          {/*<p className="text-2xl font-bold">{currentMonthHolidays.length}</p>*/}
        </div>
      </div>

      {/* Calendar + List */}
      <div className="mb-3 grid max-h-[330px] min-h-[330px] grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigateMonth("prev")}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft />
            </button>
            <h2 className="font-semibold text-gray-800">
              {currentDate.toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronRight />
            </button>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {days.map((day, idx) => {
              if (!day) return <div key={idx}></div>;
              const holiday = isHoliday(new Date(day));
              const today = new Date();
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div
                  key={idx}
                  className={`rounded border border-gray-500 p-2 ${
                    holiday
                      ? "bg-red-50 font-medium text-red-700 ring-2 ring-red-500"
                      : ""
                  } ${isToday ? "ring-primary text-primary bg-gray-50 font-bold ring-2" : "bg-white"}`}
                  title={holiday ? holiday.name : ""}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Holidays of current month */}

        <div className="overflow-y-auto rounded-xl bg-white p-4 shadow-lg">
          <div>
            <h2 className="mb-4 pb-2 text-xl font-semibold text-gray-800">
              Holidays in{" "}
              <span className="text-primary">
                {currentDate.toLocaleString("default", { month: "long" })}
              </span>
            </h2>

            {currentMonthHolidays.length ? (
              <ul className="space-y-2">
                {currentMonthHolidays.map((h) => {
                  const start = new Date(h.startDate);
                  const end = new Date(h.endDate);
                  const diffTime = Math.abs(end - start);
                  const diffDays =
                    Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

                  return (
                    <li
                      key={h.id}
                      className="border-primary relative flex items-center gap-4 rounded-lg border-l-4 bg-gray-100 p-2"
                    >
                      {/* Day count circle */}
                      <div className="text-primary flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 text-sm font-bold shadow">
                        {diffDays}
                      </div>

                      {/* Holiday info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-md font-semibold text-blue-800">
                            {h.name}
                          </h3>
                          {(h.excludeSaturday || h.excludeSunday) && (
                            <p className="text-xs text-gray-600 italic">
                              {h.excludeSaturday && "Excludes Saturdays"}
                              {h.excludeSaturday && h.excludeSunday && ", "}
                              {h.excludeSunday && "Excludes Sundays"}
                            </p>
                          )}
                          <span className="text-primary min-w-[180px] rounded-full bg-blue-100 px-3 py-1 text-xs font-medium">
                            {diffDays === 1
                              ? start.toLocaleDateString()
                              : `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No holidays this month.</p>
            )}
          </div>
        </div>
      </div>
      <div className="max-h-[400px] min-h-[300px] overflow-y-auto shadow-lg">
        <HolidayList
          data={holidayListResponse?.data?.data}
          isLoading={isLoading}
          refetch={refetch}
          onRefresh={refetch}
          onEdit={(holiday) => {
            setFormData({
              name: holiday.holidayName,
              startDate: holiday.startDate?.split("T")[0],
              endDate: holiday.endDate?.split("T")[0],
              excludeSaturday: holiday.exclueSaturday,
              excludeSunday: holiday.exclueSunday,
            });
            setEditingHolidayId(holiday.id);
            setShowModal(true);
          }}
          onDelete={async (id) => {
            try {
              const res = await deleteHoliday(id, user.userId);
              if (res?.isSuccess) {
                toast.success("Holiday deleted successfully!");
                refetch();
              } else {
                toast.error(res?.message || "Delete failed.");
              }
            } catch (err) {
              toast.error("Error deleting holiday.");
              console.error(err);
            }
          }}
        />
      </div>
    </div>
  );
};

export default HolidaySettings;
