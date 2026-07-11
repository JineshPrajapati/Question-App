import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/authContext";
import { useQuery } from "@tanstack/react-query";
import {
  getLessonPlanDashboardData,
  getExportDailyLessonPlanData,
} from "../../../api/services/dashboardService";
import { Button } from "../ui/Button";
import {
  BookCheck,
  ExternalLinkIcon,
  EyeIcon,
  FileDownIcon,
  Plus,
} from "lucide-react";
import { Tooltip } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export const DashboardLessonPlanList = () => {
  const { currSelectedAcademicYear, currSelectedSchool } =
    useContext(AuthContext);
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "asc",
  });

  const {
    data: lessonPlanDashboardData,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [
      "LessonPlandashboard",
      currSelectedSchool,
      currSelectedAcademicYear,
    ],
    queryFn: () =>
      getLessonPlanDashboardData(currSelectedSchool, currSelectedAcademicYear),
    enabled: !!currSelectedSchool,
  });

  useEffect(() => {
    if (
      lessonPlanDashboardData?.data?.data &&
      Array.isArray(lessonPlanDashboardData.data.data)
    ) {
      setTableData(lessonPlanDashboardData.data.data);
    } else {
      setTableData([]);
    }
  }, [lessonPlanDashboardData]);

  const handleExportTablePDF = async (row) => {
    try {
      const response = await getExportDailyLessonPlanData(
        row.dailyLessonPlanId,
      );
      const lessonData = response?.data?.data?.[0];

      if (!lessonData || !lessonData.lessonContent) {
        console.error("No lesson plan data available for export");
        return;
      }

      const day = JSON.parse(lessonData.lessonContent);

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 30;

      const schoolCode = lessonData.schoolCode || "";
      const schoolName = lessonData.schoolName || "";
      const academicYear = lessonData.academicYear || "";
      const actualDate = lessonData.actualDate
        ? format(new Date(lessonData.actualDate), "MMM dd, yyyy")
        : "-";
      const lessonTitle = day.Lesson_Title || "-";
      const subjectName = lessonData.subject || "";
      const gradeName = lessonData.gradeName || "";

      // --- Calculate wrapped Lesson Title height dynamically ---
      const maxTitleWidth = pageWidth - 200;
      const lessonTitleText = pdf.splitTextToSize(
        `${lessonTitle}`,
        maxTitleWidth,
      );

      // --- Header function ---
      const drawHeader = () => {
        let y = 40;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(16);
        pdf.setTextColor(0, 68, 109);
        pdf.text(`${schoolName} (${schoolCode})`, pageWidth / 2, y, {
          align: "center",
        });

        y += 20;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Academic Year: ${academicYear}`, pageWidth / 2, y, {
          align: "center",
        });

        y += 15;
        pdf.setDrawColor(180);
        pdf.line(marginX, y, pageWidth - marginX, y);

        // --- Left Section ---
        let leftY = y + 20;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0, 0.7);
        pdf.text(`Unit Title: ${lessonData.unitTitle || "-"}`, marginX, leftY);

        leftY += 15;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(0, 68, 109);
        pdf.text(`Lesson Title:`, marginX, leftY);
        pdf.text(lessonTitleText, marginX + 70, leftY);

        // since lessonTitleText can be multiline → adjust Y
        leftY += (lessonTitleText.length - 1) * 14 + 15;

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0, 0.7);
        pdf.text(`Prepared By: ${lessonData.userName || "-"}`, marginX, leftY);

        // --- Right Section ---
        let rightY = y + 20;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(`Date: ${actualDate}`, pageWidth - marginX, rightY, {
          align: "right",
        });

        rightY += 15;
        pdf.text(`Subject: ${subjectName}`, pageWidth - marginX, rightY, {
          align: "right",
        });

        rightY += 15;
        pdf.text(`Grade: ${gradeName}`, pageWidth - marginX, rightY, {
          align: "right",
        });

        // ✅ Return the bottom Y of whichever side is taller
        return Math.max(leftY, rightY);
      };

      // --- Footer function ---
      const drawFooter = (pageNumber, totalPages) => {
        pdf.setDrawColor(200);
        pdf.line(
          marginX,
          pageHeight - 40,
          pageWidth - marginX,
          pageHeight - 40,
        );

        pdf.setFontSize(9);
        pdf.setTextColor(100);
        pdf.text(
          `Page ${pageNumber} of ${totalPages}`,
          pageWidth - marginX,
          pageHeight - 20,
          { align: "right" },
        );
      };

      // ✅ First render header to get dynamic bottom Y
      const headerBottomY = drawHeader() + 20;

      // --- Table ---
      autoTable(pdf, {
        startY: headerBottomY, // always below tallest block
        theme: "striped",
        head: [["Section", "Details"]],
        body: [
          [
            "Objectives",
            (day.Objectives || []).map((o) => `• ${o}`).join("\n"),
          ],
          [
            "Materials & Resources",
            (day.Materials_Resources_Needed || [])
              .map((m) => `• ${m}`)
              .join("\n"),
          ],
          ["Anticipatory Set", day.Anticipatory_Set || "-"],
          ["Input", day.Input || "-"],
          ["Model", day.Model || "-"],
          ["Guided Practice", day.Guided_Practice || "-"],
          ["Independent Practice", day.Independent_Practice || "-"],
          ["Closure", day.Closure || "-"],
        ],
        styles: {
          fontSize: 11,
          valign: "top",
          cellPadding: 6,
          lineColor: [220, 220, 220],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [0, 68, 109],
          textColor: 255,
          halign: "center",
          fontSize: 12,
        },
        columnStyles: {
          0: { cellWidth: 150, fontStyle: "normal" },
          1: { cellWidth: "auto" },
        },
        margin: { left: marginX, right: marginX },
        didDrawPage: (data) => {
          drawFooter(data.pageNumber, pdf.internal.getNumberOfPages());
        },
        pageBreak: "auto",
      });

      pdf.save(`${actualDate}-lesson-plan.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  const sortedData = [...tableData].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue === bValue) return 0;

    if (sortConfig.key === "date") {
      const invalidDate = "0001-01-01T00:00:00";

      const aDate = a.date === invalidDate ? null : new Date(a.date);
      const bDate = b.date === invalidDate ? null : new Date(b.date);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1; // push null/invalid dates down
      if (!bDate) return -1;

      return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
  });

  const columns = [
    { key: "date", label: "Date", sortable: true, align: "left" },
    {
      key: "teacherName",
      label: "Teacher Name",
      sortable: true,
      align: "left",
    },
    { key: "gradeName", label: "Grade", sortable: true, align: "center" },
    { key: "subject", label: "Subject", sortable: true, align: "left" },
    { key: "action", label: "Action", sortable: false, align: "center" },
  ];

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      // Toggle sort direction
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  return (
    <>
      {/* <div className="h-[300px] w-full overflow-x-auto overflow-y-auto rounded-lg border border-gray-300 shadow-sm">
      {sortedData.length === 0 ? (
        <div className="flex h-[320px] w-full items-center justify-center p-4 text-center text-gray-400">
          No data available
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-800">
          <thead className="sticky top-0 z-10 bg-gray-200 text-left text-gray-700 shadow-sm">
            <tr>
              {columns.map((col) => {
                const isSorted = sortConfig.key === col.key;
                const sortArrow = isSorted
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : "";

                return (
                  <th
                    key={col.key}
                    className={`px-4 py-3 font-semibold tracking-wide whitespace-nowrap ${
                      col.align ? `text-${col.align}` : "text-left"
                    } ${col.sortable ? "cursor-pointer select-none" : ""}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <span>{sortArrow}</span>}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {sortedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No lesson plans found.
                </td>
              </tr>
            )}

            {sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-left whitespace-nowrap">
                  {row.date && row.date !== "0001-01-01T00:00:00"
                    ? new Date(row.date).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-left whitespace-nowrap">
                  {row.teacherName}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  {row.gradeName ? (
                    <span className="text-primary bg-primary/10 border-primary/20 rounded border px-2 py-0.5 text-sm">
                      {row.gradeName}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-left whitespace-nowrap">
                  {row.subject || "-"}
                </td>

                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {row.lessonPlanCount > 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="group hover:bg-primary hover:text-primary-foreground min-w-[92px] cursor-pointer transition-colors"
                    >
                      <span className="group-hover:text-white">Print</span>
                      <ExternalLinkIcon className="ml-2 h-3 w-3 group-hover:text-white" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="group hover:bg-primary hover:text-primary-foreground min-w-[92px] cursor-pointer transition-colors"
                    >
                      <span className="group-hover:text-white">Add</span>
                      <Plus className="ml-2 h-3 w-3 group-hover:text-white" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div> */}
      <div className="h-[300px] w-full overflow-x-auto overflow-y-auto rounded border border-gray-200 bg-white">
        {sortedData.length === 0 ? (
          <div className="flex h-[295px] w-full items-center justify-center p-4 text-center text-gray-400">
            No data available
          </div>
        ) : (
          <table className="min-w-full text-sm text-gray-800">
            {/* Header */}
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 shadow-sm">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortConfig.key === col.key;
                  const sortArrow = isSorted
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : "";

                  return (
                    <th
                      key={col.key}
                      className={`px-5 py-3 font-semibold tracking-wide whitespace-nowrap ${
                        col.align ? `text-${col.align}` : "text-left"
                      } ${col.sortable ? "cursor-pointer select-none" : ""}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && <span>{sortArrow}</span>}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } text-left transition hover:bg-blue-50`}
                >
                  {/* Date */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    {row.date && row.date !== "0001-01-01T00:00:00"
                      ? new Date(row.date).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Teacher */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    {row.teacherName}
                  </td>

                  {/* Grade */}
                  <td className="px-5 py-3 text-left whitespace-nowrap">
                    {row.gradeName ? (
                      <span className="text-primary inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium">
                        {row.gradeName}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Subject */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    {row.subject || "-"}
                  </td>

                  {/* Action */}
                  <td className="max-w-[140px] px-5 py-3 text-left whitespace-nowrap">
                    {row.lessonPlanCount > 0 ? (
                      <button
                        size="sm"
                        onClick={() => handleExportTablePDF(row)}
                        className="text-primary border-color-primary inline-flex cursor-pointer items-center gap-1 rounded border bg-white px-3 py-1.5 text-sm transition hover:bg-gray-50"
                      >
                        <FileDownIcon className="h-4.5 w-4.5" />
                        Export
                      </button>
                    ) : (
                      <button
                        size="sm"
                        className="border-color-primary inline-flex items-center gap-1 rounded border bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100"
                      >
                        Add
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};
