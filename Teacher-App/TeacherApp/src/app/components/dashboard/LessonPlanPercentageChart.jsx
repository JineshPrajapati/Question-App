import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useState, useEffect, useContext } from "react";
import { getLessonPlanPercentagedData } from "../../../api/services/dashboardService";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";

export const LessonPlanPercentageChart = ({
  selectedSchool,
  selectedDistrict,
  selectedState,
  selectedGrade,
}) => {
  const { currSelectedAcademicYear } = useContext(AuthContext);
  const {
    data: lessonPlanDashboardData,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [
      "LessonPlanPercentagedashboard",
      selectedSchool,
      selectedDistrict,
      selectedState,
      selectedGrade,
      currSelectedAcademicYear,
    ],
    queryFn: () =>
      getLessonPlanPercentagedData(
        selectedState,
        selectedDistrict,
        selectedSchool,
        selectedGrade,
      ),
  });
  const rawData = lessonPlanDashboardData?.data?.data ?? [];
  const aggregatedData = Object.values(
    rawData.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = {
          name: curr.name,
          lessonPlanPercentage: curr.lessonPlanPercentage,
        };
      }

      return acc;
    }, {}),
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // comes from aggregated chartData
      // const sign = selectedGrade != 0 ? "%" : ""};
      return (
        <div className="shadow-strong h-auto w-auto rounded-lg border border-gray-300 bg-white p-1">
          {/* Stats */}
          <div className="text-center">
            <p className="text-sm">{data.name ?? 0}</p>
            <p className="text-sm">
              {data.lessonPlanPercentage ?? 0} {selectedGrade == 0 ? "%" : ""}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(
    ...aggregatedData.map((d) => d.lessonPlanPercentage ?? 0),
    0,
  );

  // Decide ticks dynamically
  let yAxisProps = {};
  if (maxValue <= 5) {
    yAxisProps = {
      domain: [0, 5],
      ticks: [0, 1, 2, 3, 4, 5],
    };
  }

  return (
    <>
      {/* Chart */}
      <div className="bg-gradient-card mt-2 max-h-full flex-1 overflow-auto p-2 pb-0">
        <div className="h-[250px]">
          <div className="chart-1">
            <ResponsiveContainer width={"100%"} height={220}>
              <BarChart
                data={aggregatedData}
                margin={{ top: 20, right: 30, left: 0, bottom: 15 }}
                barCategoryGap={30}
              >
                <CartesianGrid strokeDasharray="1 1" stroke="pink" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  angle={-20}
                  height={60}
                  textAnchor="end"
                  interval={0}
                  tickMargin={10}
                />
                <YAxis
                  dataKey="lessonPlanPercentage"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  {...yAxisProps}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#e7e7e7" }}
                />
                <Bar
                  dataKey="lessonPlanPercentage"
                  fill="#00446d"
                  radius={[8, 8, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="data-1"></div>
        </div>
      </div>
    </>
  );
};
