import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { AuthContext } from "../../contexts/authContext";
import {
  getDashboardData,
  getLessonPlanDashboardData,
} from "../../api/services/dashboardService";
import {
  BarChart,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  CartesianGrid,
} from "recharts";
import { DashboardLessonPlanList } from "../components/dashboard/DashboardLessonPlanList";
import { DashboardLessionPlan } from "../components/dashboard/DashboardLessionPlan";
import { useNavigate } from "react-router";
import { LessonPlanPercentageChart } from "../components/dashboard/LessonPlanPercentageChart";
import { getSchoolGradeList } from "../../api/services/dropDownMasterService";
import {
  ChartNoAxesCombinedIcon,
  Grid3x3,
  ArrowDownLeft,
  ArrowUpRight,
  SchoolIcon,
  Users,
  UserPlus2Icon,
  GraduationCapIcon,
  BookCheck,
  BookOpen,
  ClockIcon,
  CalendarIcon,
  BookOpenIcon,
  TrendingUpDownIcon,
  TrendingUpIcon,
  MessageSquareIcon,
} from "lucide-react";

export const MyDashboard = () => {
  const { user, currSelectedAcademicYear, currSelectedSchool } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState();
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState(0);

  const [selectedState, setSelectedState] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState(0);
  const [grades, setGrades] = useState([]);
  const [parsedDashboardData, setParsedDashboardData] = useState(null);
  const [isTableView, setIsTableView] = useState(false);

  const userTypeId = user.userTypeId;

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", currSelectedSchool, currSelectedAcademicYear],
    queryFn: () =>
      getDashboardData(
        currSelectedSchool,
        currSelectedAcademicYear,
        user.userId,
      ),
    enabled: !!currSelectedSchool,
  });

  const { data: lessonPlanDashboardData, isLoading: lessonplanisLoading } =
    useQuery({
      queryKey: [
        "LessonPlandashboard",
        currSelectedSchool,
        currSelectedAcademicYear,
      ],
      queryFn: () =>
        getLessonPlanDashboardData(
          currSelectedSchool,
          currSelectedAcademicYear,
        ),
      enabled: !!currSelectedSchool,
    });

  const { data: gradeData, isLoading: gradeLoading } = useQuery({
    queryKey: [
      "gradesData",
      user.userId,
      selectedSchool,
      currSelectedAcademicYear,
    ],
    queryFn: () =>
      getSchoolGradeList(user.userId, selectedSchool, currSelectedAcademicYear),
    enabled: !!selectedSchool,
  });

  useEffect(() => {
    if (gradeData?.isSuccess) {
      setGrades(gradeData?.data?.data ?? []);
    }
  }, [gradeData]);

  useEffect(() => {
    if (dashboardData?.data?.data?.length > 0) {
      const jsonString = dashboardData.data.data[0]?.dataJson;
      if (jsonString) {
        try {
          setParsedDashboardData(JSON.parse(jsonString));
        } catch {
          setParsedDashboardData(null);
        }
      } else {
        setParsedDashboardData(null);
      }
    } else {
      setParsedDashboardData(null);
    }
  }, [dashboardData]);
  const lessonPlan = useMemo(() => {
    if (!parsedDashboardData?.LessonPlan) return null;
    try {
      if (typeof parsedDashboardData.LessonPlan == "object") {
        return parsedDashboardData.LessonPlan;
      } else {
        return JSON.parse(parsedDashboardData.LessonPlan);
      }
    } catch {
      return null;
    }
  }, [parsedDashboardData]);
  const totalGrades = useMemo(() => {
    return parsedDashboardData?.AssignedGradesSubjects
      ? new Set(
          parsedDashboardData.AssignedGradesSubjects.map((g) => g.GradeName),
        ).size
      : 0;
  }, [parsedDashboardData]);

  const totalSubjects = useMemo(() => {
    return parsedDashboardData?.AssignedGradesSubjects
      ? new Set(
          parsedDashboardData.AssignedGradesSubjects.map((s) => s.Subject),
        ).size
      : 0;
  }, [parsedDashboardData]);

  const totalLessonPlans = useMemo(() => {
    return parsedDashboardData?.LessonPlanCount
      ? new Set(parsedDashboardData.LessonPlanCount.map((l) => l.Lessonplan))
          .size
      : 0;
  }, [parsedDashboardData]);

  const states = parsedDashboardData?.StateDistrictSchoolsGrades ?? [];

  const districts = useMemo(() => {
    if (!selectedState) return [];
    return (
      states.find((s) => s.StateId === Number(selectedState))?.Districts ?? []
    );
  }, [states, selectedState]);

  const schools = useMemo(() => {
    if (!selectedDistrict) return [];
    return (
      districts.find((d) => d.DistrictId === Number(selectedDistrict))
        ?.Schools ?? []
    );
  }, [districts, selectedDistrict]);

  useEffect(() => {
    if (states.length === 1) {
      setSelectedState(states[0].StateId);
    }
    if (districts.length === 1) {
      setSelectedDistrict(districts[0].DistrictId);
    }
    if (user.userTypeId === 1 && schools.length == 1) {
      setSelectedSchool(schools[0].SchoolId);
    }
  }, [states, districts, schools, user.userTypeId]);

  const generateColor = (index) => {
    const hue = (index * 137.5 + 200) % 360;
    return `#00446d`;
  };

  if (isLoading || lessonplanisLoading || gradeLoading) {
    return <div>Loading...</div>;
  }

  if (!parsedDashboardData) {
    return <div>No Dashboard Data</div>;
  }

  return (
    <div>
      <div>
        {/* Summary Cards */}

        {userTypeId === 4 || userTypeId === 3 || userTypeId === 2 ? (
          <>
            {/* ====== TOP BANNER ====== */}
            <div className="mb-5 flex items-center justify-between px-2">
              <h2 className="text-2xl font-medium text-gray-800">Dashboard</h2>
              {/* <p className="text-sm font-medium text-gray-500">
                School Year 2021 - 2022
              </p> */}
            </div>

            {/* ====== DASHBOARD CARDS ====== */}
            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Total Schools / Grades */}
              <div className="border-primary flex items-center justify-between rounded-lg border-l-5 bg-white p-4 shadow-sm">
                <SchoolIcon className="text-primary mr-3 h-10 w-10" />
                <div>
                  {userTypeId === 2 ? (
                    <>
                      <p className="text-sm text-gray-500">Grades</p>
                      <p className="text-2xl font-semibold text-gray-800">
                        {parsedDashboardData?.GradesData ?? 0}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">Schools</p>
                      <p className="text-2xl font-semibold text-gray-800">
                        {parsedDashboardData?.SchoolCount ?? 0}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Teachers */}
              <div className="border-primary flex items-center justify-between rounded-lg border-l-5 bg-white p-4 shadow-sm">
                <Users className="text-primary mr-3 h-10 w-10" />
                <div>
                  <p className="text-sm text-gray-500">Teachers</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {parsedDashboardData?.TeachersCount ?? 0}
                  </p>
                </div>
              </div>

              {/* Students */}
              <div className="border-primary flex items-center justify-between rounded-lg border-l-5 bg-white p-4 shadow-sm">
                <GraduationCapIcon className="text-primary mr-3 h-10 w-10" />
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {parsedDashboardData?.StudentsCount ?? 0}
                  </p>
                </div>
              </div>

              {/* Parents */}
              <div className="border-primary flex items-center justify-between rounded-lg border-l-5 bg-white p-4 shadow-sm">
                <UserPlus2Icon className="text-primary mr-3 h-10 w-10" />
                <div>
                  <p className="text-sm text-gray-500">Parents</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {parsedDashboardData?.GuardiansCount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ====== TOP BANNER ====== */}
            <div className="mb-5 flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold text-gray-700">Dashboard</h2>
              {/* <p className="text-sm font-medium text-gray-500">
                School Year 2021 - 2022
              </p> */}
            </div>

            {/* ====== DASHBOARD CARDS ====== */}
            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Students */}
              <div className="border-primary flex items-center justify-between rounded-lg border-l-5 bg-white p-4 shadow-sm">
                <GraduationCapIcon className="text-primary mr-3 h-10 w-10" />
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {parsedDashboardData?.StudentCount ?? 0}
                  </p>
                </div>
              </div>

              {/* Lesson Plans */}
              <div className="border-primary flex items-center justify-between rounded-lg border-l-5 bg-white p-4 shadow-sm">
                <BookCheck className="text-primary mr-3 h-10 w-10" />
                <div>
                  <p className="text-sm text-gray-500">Lesson Plans</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {totalLessonPlans}
                  </p>
                </div>
              </div>

              {/* Grades */}
              <div className="border-primary flex items-center justify-between rounded-lg border-l-5 bg-white p-4 shadow-sm">
                <SchoolIcon className="text-primary mr-3 h-10 w-10" />
                <div>
                  <p className="text-sm text-gray-500">Total Grades</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {totalGrades}
                  </p>
                </div>
              </div>

              {/* Subjects */}
              <div className="border-primary flex items-center justify-between rounded-lg border-l-5 bg-white p-4 shadow-sm">
                <BookOpen className="text-primary mr-3 h-10 w-10" />
                <div>
                  <p className="text-sm text-gray-500">Total Subjects</p>
                  <p className="text-left text-2xl font-semibold text-gray-800">
                    {totalSubjects}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mb-3 grid max-h-100 grid-cols-1 gap-4 md:grid-cols-2">
          {userTypeId === 4 || userTypeId == 3 || userTypeId == 2 ? (
            <>
              <div className="flex max-h-100 min-h-[350px] flex-col overflow-hidden rounded-xl bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpenIcon className="h-5 w-5 text-gray-800" />
                    <span className="text-lg font-semibold text-gray-800">
                      Daily Lesson Plan
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate("/lessonplan")}
                      className="border-primary text-primary cursor-pointer rounded-md border-2 px-2 py-1"
                    >
                      <span className="text-md font-bold">+ </span>
                      Create Plan
                    </button>
                    <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
                      <button
                        onClick={() => setIsTableView(false)}
                        aria-label="Chart View"
                        className={`group focus-visible:ring-primary relative cursor-pointer px-3 py-2 transition-colors duration-200 focus:outline-none focus-visible:z-10 focus-visible:ring-2 ${!isTableView ? "bg-primary" : "hover:bg-gray-100"}`}
                      >
                        <ChartNoAxesCombinedIcon
                          className={`h-5 w-5 transition-colors duration-200 ${!isTableView ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                        />
                      </button>

                      <button
                        onClick={() => setIsTableView(true)}
                        aria-label="Table View"
                        className={`group focus-visible:ring-primary relative cursor-pointer px-3 py-2 transition-colors duration-200 focus:outline-none focus-visible:z-10 focus-visible:ring-2 ${isTableView ? "bg-primary" : "hover:bg-gray-100"}`}
                      >
                        <Grid3x3
                          className={`h-5 w-5 transition-colors duration-200 ${isTableView ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                {isTableView == 0 ? (
                  <DashboardLessionPlan
                    data={lessonPlanDashboardData?.data ?? []}
                    selectedTeacher={selectedTeacher}
                    selectedGrade={selectedGrade}
                  />
                ) : (
                  <DashboardLessonPlanList />
                )}
              </div>

              <div className="overflow-hidden rounded-xl bg-white p-4 shadow-lg">
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-gray-800" />
                    <span className="text-lg font-semibold text-gray-800">
                      Lesson Plan Coverage(%)
                    </span>
                  </div>
                  {states.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* State Dropdown */}

                        <select
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setSelectedDistrict(0);
                            setSelectedSchool(0);
                            setSelectedGrade(0);
                          }}
                          className="w-full rounded-md border border-gray-300 p-2"
                          disabled={
                            selectedState &&
                            (user.userTypeId === 3 ||
                              user.userTypeId === 2 ||
                              user.userTypeId === 1)
                          }
                        >
                          {/* {states.length != 1 && (
                      )} */}
                          <option value="0" className="">
                            Select State
                          </option>
                          {states.map((state) => (
                            <option
                              key={state.StateId}
                              value={state.StateId}
                              className=""
                            >
                              {state.StateName}
                            </option>
                          ))}
                        </select>

                        {/* District Dropdown */}
                        <select
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setSelectedSchool(0);
                            setSelectedGrade(0);
                          }}
                          className="w-full rounded-md border border-gray-300 p-2"
                          disabled={
                            !selectedState ||
                            (selectedDistrict != 0 && user.userTypeId === 2)
                          }
                        >
                          <option value="0">Select District</option>
                          {districts.map((district) => (
                            <option
                              key={district.DistrictId}
                              value={district.DistrictId}
                            >
                              {district.DistrictName}
                            </option>
                          ))}
                        </select>

                        {/* School Dropdown */}
                        <select
                          value={selectedSchool}
                          onChange={(e) => {
                            setSelectedSchool(parseInt(e.target.value));
                            setSelectedGrade(0);
                          }}
                          className="w-full rounded-md border border-gray-300 p-2"
                          disabled={!selectedDistrict}
                        >
                          {/* {schools.length != 1 && (
                      )} */}
                          <option value="0" className="">
                            Select School
                          </option>
                          {schools.map((school) => (
                            <option
                              className=""
                              key={school.SchoolId}
                              value={school.SchoolId}
                            >
                              {school.SchoolName}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className="w-full rounded-md border border-gray-300 p-2"
                          disabled={gradeLoading || grades.length === 0}
                        >
                          <option value="0" className="">
                            Select Grade
                          </option>
                          {grades.map((grade) => (
                            <option
                              key={grade.value}
                              value={grade.value}
                              className=""
                            >
                              {grade.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <LessonPlanPercentageChart
                        selectedSchool={selectedSchool}
                        selectedDistrict={selectedDistrict}
                        selectedState={selectedState}
                        selectedGrade={selectedGrade}
                      />
                    </>
                  ) : (
                    <div className="flex h-[320px] w-full items-center justify-center p-4 text-center text-gray-400">
                      No data available
                    </div>
                  )}
                </>
              </div>
              {userTypeId === 2 && (
                <>
                  <div className="rounded-xl bg-white p-4 shadow-lg">
                    <div className="mb-4 flex items-center gap-2">
                      <GraduationCapIcon className="h-5 w-5 text-gray-800" />
                      <span className="text-lg font-semibold text-gray-800">
                        Grades
                      </span>
                    </div>
                    <div className="max-h-[320px] min-h-[320px] overflow-auto">
                      {parsedDashboardData?.StudentGradeData ? (
                        <ResponsiveContainer
                          width={
                            parsedDashboardData.StudentGradeData.length * 70
                          }
                          height={300}
                        >
                          <BarChart
                            data={parsedDashboardData.StudentGradeData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 60,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="2 2"
                              stroke="pink"
                            />
                            <XAxis
                              dataKey="GradeName"
                              stroke="#555"
                              interval={0}
                              angle={-25}
                              tick={{
                                fill: "hsl(var(--foreground))",
                                fontSize: 12,
                              }}
                              textAnchor="end"
                              height={30}
                              // label={{
                              //   value: "Grades",
                              //   position: "insideBottom",
                              //   offset: -40,
                              // }}
                            />
                            <YAxis
                              label={{
                                value: "Student Count",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                              }}
                              tick={{
                                fill: "hsl(var(--foreground))",
                                fontSize: 12,
                              }}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="StudentCount"
                              radius={[8, 8, 0, 0]}
                              barSize={30}
                            >
                              {parsedDashboardData.StudentGradeData.map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={generateColor(index)}
                                  />
                                ),
                              )}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-[295px] w-full items-center justify-center p-4 text-center text-gray-400">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              <div className="rounded-xl bg-white p-4 shadow-lg">
                {/* Header */}
                <div className="mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-800" />
                  <span className="text-lg font-semibold text-gray-800">
                    Holidays
                  </span>
                </div>

                {parsedDashboardData?.Holidays ? (
                  <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                    {(parsedDashboardData?.Holidays ?? []).map((h, index) => {
                      const start = new Date(h.StartDate);
                      const end = new Date(h.EndDate);
                      const diffTime = Math.abs(end - start);
                      const diffDays =
                        Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl bg-gray-50 p-2 transition hover:shadow-md"
                        >
                          {/* Left Section (Day count + Holiday Info) */}
                          <div className="flex items-center gap-4">
                            {/* Day count circle */}
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f0f5] text-sm font-bold text-[#00446d]">
                              {diffDays}
                            </div>

                            {/* Holiday name + duration */}
                            <div>
                              <h3 className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                                {h.HolidayName}
                              </h3>
                              <p className="flex items-center text-xs text-gray-500">
                                <ClockIcon className="mr-1 h-3 w-3 text-gray-400" />
                                {diffDays} {diffDays > 1 ? "days" : "day"}
                              </p>
                            </div>
                          </div>

                          {/* Right Section (Date Range Badge) */}
                          <div className="rounded-full bg-[#e6f0f5] px-3 py-1 text-xs font-medium whitespace-nowrap text-[#00446d]">
                            {diffDays === 1
                              ? start.toLocaleDateString()
                              : `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-[320px] w-full items-center justify-center p-4 text-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-white p-4 shadow-lg">
                <div className="flex w-full justify-between">
                  <span className="mb-4 block text-xl font-semibold text-gray-800">
                    Today's Lesson Plan
                  </span>
                  {lessonPlan?.Days?.length > 0 && (
                    <button
                      className="text-primary cursor-pointer p-2 px-4 text-sm font-medium hover:underline"
                      onClick={() => navigate("/lessonplan")}
                    >
                      View All
                    </button>
                  )}
                </div>
                {lessonPlan?.Days?.length > 0 ? (
                  <div className="max-h-[320px] min-h-[320px] overflow-y-auto">
                    {lessonPlan?.Days?.map((day, index) => (
                      <div
                        key={index}
                        className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 shadow-sm transition hover:bg-blue-50"
                      >
                        {/* Left side: Date + Day */}
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 px-3 py-2 text-gray-800 shadow">
                            <span>{day.GradeName}</span>
                            {/* <span className="text-lg font-bold">
                            {new Date(day.LessonDate).getDate()}
                          </span>
                          <span className="text-xs">
                            {new Date(day.LessonDate).toLocaleString("en-US", {
                              month: "short",
                            })}
                          </span> */}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {day.Subject}
                            </p>
                          </div>
                        </div>

                        {/* Right side: Topic */}
                        <span className="rounded-full bg-blue-100 px-4 py-1 text-sm text-gray-700">
                          {day.Lesson_Title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[320px] w-full items-center justify-center p-4 text-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white p-4 shadow-lg">
                <>
                  <div className="flex items-center justify-between">
                    <div className="mb-4 flex items-center gap-2">
                      <TrendingUpIcon className="h-5 w-5 text-gray-800" />
                      <span className="text-lg font-semibold text-gray-800">
                        Lesson Plan Coverage(%)
                      </span>
                    </div>
                    {/* <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
                      <button
                        onClick={() => setIsTableView(false)}
                        aria-label="Chart View"
                        className={`group focus-visible:ring-primary relative px-3 py-2 transition-colors duration-200 focus:outline-none focus-visible:z-10 focus-visible:ring-2 ${!isTableView ? "bg-primary" : "hover:bg-gray-100"}`}
                      >
                        <ChartNoAxesCombinedIcon
                          className={`h-5 w-5 transition-colors duration-200 ${!isTableView ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                        />
                      </button>

                      <button
                        onClick={() => setIsTableView(true)}
                        aria-label="Table View"
                        className={`group focus-visible:ring-primary relative px-3 py-2 transition-colors duration-200 focus:outline-none focus-visible:z-10 focus-visible:ring-2 ${isTableView ? "bg-primary" : "hover:bg-gray-100"}`}
                      >
                        <Grid3x3
                          className={`h-5 w-5 transition-colors duration-200 ${isTableView ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                        />
                      </button>
                    </div> */}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* State Dropdown */}

                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        setSelectedDistrict(0);
                        setSelectedSchool(0);
                        setSelectedGrade(0);
                      }}
                      disabled={selectedState && user.userTypeId == 1}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      <option value="0">Select State</option>
                      {states.map((state) => (
                        <option key={state.StateId} value={state.StateId}>
                          {state.StateName}
                        </option>
                      ))}
                    </select>

                    {/* District Dropdown */}
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setSelectedSchool(0);
                        setSelectedGrade(0);
                      }}
                      className="w-full rounded-md border border-gray-300 p-2"
                      disabled={
                        !selectedState ||
                        (districts.length == 1 && user.userTypeId === 1)
                      }
                    >
                      <option value="0">Select District</option>
                      {districts.map((district) => (
                        <option
                          key={district.DistrictId}
                          value={district.DistrictId}
                        >
                          {district.DistrictName}
                        </option>
                      ))}
                    </select>

                    {/* School Dropdown */}
                    <select
                      value={selectedSchool}
                      onChange={(e) => {
                        setSelectedSchool(parseInt(e.target.value));
                        setSelectedGrade(0);
                      }}
                      className="w-full rounded-md border border-gray-300 p-2"
                      disabled={
                        !selectedDistrict ||
                        (selectedDistrict && schools.length == 1)
                      }
                    >
                      <option value="0">Select School</option>
                      {schools.map((school) => (
                        <option key={school.SchoolId} value={school.SchoolId}>
                          {school.SchoolName}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2"
                      disabled={gradeLoading || grades.length === 0}
                    >
                      <option value="0">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <LessonPlanPercentageChart
                    selectedSchool={selectedSchool}
                    selectedDistrict={selectedDistrict}
                    selectedState={selectedState}
                    selectedGrade={selectedGrade}
                  />
                </>
              </div>

              {/* <div className="rounded-xl bg-white p-4 shadow-lg">
                <div className="max-h-[320px] min-h-[320px] overflow-x-auto">
                  <span className="mb-4 block text-left text-xl font-semibold text-gray-800">
                    Grade Subjects
                  </span>
                  {parsedDashboardData?.AssignedGradesSubjects &&
                  parsedDashboardData.AssignedGradesSubjects.length > 0 ? (
                    (() => {
                      const grouped =
                        parsedDashboardData.AssignedGradesSubjects.reduce(
                          (acc, { GradeName, Subject }) => {
                            if (!acc[GradeName]) acc[GradeName] = [];
                            acc[GradeName].push(Subject);
                            return acc;
                          },
                          {},
                        );
                      return (
                        <div className="max-h-[320px] overflow-y-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                                  Grade
                                </th>
                                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                                  Subjects
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(grouped).map(
                                ([grade, subjects], idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-gray-200 transition hover:bg-blue-50"
                                  >
                                    <td className="px-3 py-2 text-left text-sm text-black">
                                      {grade}
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="flex flex-wrap gap-1">
                                        {subjects.map((subject, i) => (
                                          <span
                                            key={i}
                                            className="text-primary border-primary rounded-full border bg-gray-50 px-3 py-0.5 text-sm"
                                          >
                                            {subject}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      );
                    })() // ✅ immediately invoke function
                  ) : (
                    <div className="flex h-[250px] w-full items-center justify-center p-4 text-center text-gray-400">
                      No data available
                    </div>
                  )}
                </div>
              </div> */}

              <div className="rounded-xl bg-white p-4 shadow-lg">
                {/* Header */}
                <div className="mb-4 flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5 text-gray-800" />
                  <span className="text-lg font-semibold text-gray-800">
                    Grade Subjects
                  </span>
                </div>

                {parsedDashboardData?.AssignedGradesSubjects &&
                parsedDashboardData.AssignedGradesSubjects.length > 0 ? (
                  (() => {
                    const grouped =
                      parsedDashboardData.AssignedGradesSubjects.reduce(
                        (acc, { GradeName, Subject }) => {
                          if (!acc[GradeName]) acc[GradeName] = [];
                          acc[GradeName].push(Subject);
                          return acc;
                        },
                        {},
                      );

                    return (
                      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                        {Object.entries(grouped).map(
                          ([grade, subjects], idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between rounded-xl bg-gray-50 p-3 shadow-sm transition hover:shadow-md"
                            >
                              {/* Grade Name */}
                              <div className="min-w-[120px] text-sm font-semibold text-gray-800">
                                {grade}
                              </div>

                              {/* Subjects */}
                              <div className="flex flex-wrap gap-2">
                                {subjects.map((subject, i) => (
                                  <span
                                    key={i}
                                    className="rounded-full border border-[#00446d] bg-[#e6f0f5] px-3 py-0.5 text-xs font-medium text-[#00446d]"
                                  >
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex h-[250px] w-full items-center justify-center p-4 text-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white p-4 shadow-lg">
                {/* Header */}
                <div className="mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-800" />
                  <span className="text-lg font-semibold text-gray-800">
                    Holidays
                  </span>
                </div>

                {parsedDashboardData?.Holidays ? (
                  <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                    {(parsedDashboardData?.Holidays ?? []).map((h, index) => {
                      const start = new Date(h.StartDate);
                      const end = new Date(h.EndDate);
                      const diffTime = Math.abs(end - start);
                      const diffDays =
                        Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl bg-gray-50 p-2 transition hover:shadow-md"
                        >
                          {/* Left Section (Day count + Holiday Info) */}
                          <div className="flex items-center gap-4">
                            {/* Day count circle */}
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f0f5] text-sm font-bold text-[#00446d]">
                              {diffDays}
                            </div>

                            {/* Holiday name + duration */}
                            <div>
                              <h3 className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                                {h.HolidayName}
                              </h3>
                              <p className="flex items-center text-xs text-gray-500">
                                <ClockIcon className="mr-1 h-3 w-3 text-gray-400" />
                                {diffDays} {diffDays > 1 ? "days" : "day"}
                              </p>
                            </div>
                          </div>

                          {/* Right Section (Date Range Badge) */}
                          <div className="rounded-full bg-[#e6f0f5] px-3 py-1 text-xs font-medium whitespace-nowrap text-[#00446d]">
                            {diffDays === 1
                              ? start.toLocaleDateString()
                              : `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-[320px] w-full items-center justify-center p-4 text-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </>
          )}

          <div className="rounded-xl bg-white p-4 shadow-lg">
            <div className="flex flex-col overflow-hidden">
              {/* Header */}
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareIcon className="h-5 w-5 text-gray-800" />
                <span className="text-lg font-semibold text-gray-800">
                  Recent Messages
                </span>
              </div>

              {parsedDashboardData?.LastMessages?.length > 0 ? (
                <ul className="max-h-[320px] min-h-[320px] flex-1 space-y-2 overflow-auto">
                  {parsedDashboardData.LastMessages.map((m, index) => {
                    const time = new Date(m.Time).toLocaleString();

                    return (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm"
                      >
                        {/* Left side */}
                        <div className="flex items-center gap-3">
                          {/* Circle icon */}
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                            {m.MessageType === "S" ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4" />
                            )}
                          </div>

                          {/* Name + time */}
                          <div className="flex flex-col">
                            <span className="text-left text-sm font-semibold text-gray-800">
                              {m.Name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {time}
                            </span>
                          </div>
                        </div>

                        {/* Unread badge */}
                        {!m.IsRead && (
                          <span className="rounded-full border border-red-400 px-3 py-1 text-xs font-medium text-red-400">
                            Unread
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex h-[250px] w-full items-center justify-center p-4 text-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
