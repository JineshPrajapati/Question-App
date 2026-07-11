import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useState, useEffect } from "react";

// Custom Tooltip Component

export const DashboardLessionPlan = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");

  const [dateOptions, setDateOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // comes from aggregated chartData

      return (
        <div className="shadow-strong min-w-[250px] rounded-lg border border-gray-300 bg-white p-4">
          {/* Teacher Avatar + Name */}
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-gradient-primary flex h-12 w-12 items-center justify-center rounded-full">
              <span className="text-lg font-bold text-white">
                {data.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <h3 className="text-foreground text-lg font-bold">{data.name}</h3>
              <p className="text-muted-foreground text-sm">
                Grade {data.grade} • {data.subject}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-success/10 rounded-lg p-2">
              <p className="text-success text-lg font-bold">
                {data.completedPlans ?? 0}
              </p>
              <p className="text-muted-foreground text-xs">Total Plans</p>
            </div>
            <div className="bg-chart-secondary/10 rounded-lg p-2">
              <p className="text-chart-secondary text-lg font-bold">
                {data.totalGrades ?? 0}
              </p>
              <p className="text-muted-foreground text-xs">Total Grade</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (!data || !data.data || !data.data.length) return;

    // Format data
    const formatted = data.data.map((item) => {
      let formattedDate = "";
      if (item.date) {
        const dateObj = new Date(item.date);
        formattedDate = dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }

      return {
        name: item.teacherName || "",
        date: formattedDate || "", // formatted date string
        grade: item.gradeName || "",
        subject: item.subject || "N/A",
        plans: item.lessonPlanCount || 0,
        totalPlans: item.totalLessonPlans || 0,
        completedPlans: item.gradeLessonPlanCount || 0,
        totalGrades: item.gradeLessonPlanCount || 0,
      };
    });

    setChartData(formatted);

    // Get distinct options
    const dates = [...new Set(formatted.map((i) => i.date))].filter(Boolean);
    const teachers = [...new Set(formatted.map((i) => i.name))].filter(Boolean);
    const grades = [...new Set(formatted.map((i) => i.grade))].filter(Boolean);

    setDateOptions([
      { label: "All Dates", value: "all" },
      ...dates.map((d) => ({ label: d, value: d })),
    ]);

    setTeacherOptions([
      { label: "All Teachers", value: "all" },
      ...teachers.map((t) => ({ label: t, value: t })),
    ]);
    setGradeOptions([
      { label: "All Grades", value: "all" },
      ...grades.map((g) => ({ label: g, value: g })),
    ]);
  }, [data]);

  // Filtering
  const filteredData = chartData.filter((item) => {
    if (selectedDate !== "all" && item.date !== selectedDate) return false;
    if (selectedTeacher !== "all" && item.name !== selectedTeacher)
      return false;
    if (selectedGrade !== "all" && item.grade !== selectedGrade) return false;
    return true;
  });
  const aggregatedData = Object.values(
    filteredData.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = {
          name: curr.name,
          grade: curr.grade,
          subject: curr.subject,
          plans: 0,
          totalPlans: 0,
          completedPlans: 0,
          totalGrades: curr.totalGrades,
        };
      }
      acc[curr.name].plans += curr.plans;
      acc[curr.name].totalPlans += curr.totalPlans;
      acc[curr.name].completedPlans += curr.completedPlans;
      return acc;
    }, {}),
  );

  return (
    <>
      <div className="h-[300px] w-full overflow-x-auto overflow-y-auto">
        {/* Filters */}

        <div className="bg-card mb-4 rounded-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              {/* <option value="all">All Date</option> */}
              {dateOptions.map((date) => (
                <option key={date.value} value={date.value} className="">
                  {date.label}
                </option>
              ))}
            </select>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              {/* <option value="all">All Teachers</option> */}
              {teacherOptions.map((teacher) => (
                <option key={teacher.value} value={teacher.value} className="">
                  {teacher.label}
                </option>
              ))}
            </select>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              {/* <option value="all">All Grades</option> */}
              {gradeOptions.map((grade) => (
                <option key={grade.value} value={grade.value} className="">
                  {grade.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gradient-card mt-2 max-h-full flex-1 overflow-auto p-2">
          {aggregatedData.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={aggregatedData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  barCategoryGap={30}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="pink" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    dataKey="plans"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "#e7e7e7" }}
                  />
                  <Bar
                    dataKey="plans"
                    fill="#00446d"
                    radius={[8, 8, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[200px] w-full items-center justify-center p-4 text-center text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </>
  );
};
