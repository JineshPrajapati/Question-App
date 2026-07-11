import { BookOpen, FileDownIcon, Pencil } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Button } from "../../ui/Button";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../../../../contexts/authContext";
import { getExportDailyLessonPlanData } from "../../../../api/services/dashboardService";
import { format, set } from "date-fns";
import LessonEditForm from "./LessonEditForm";
import { use } from "react";

const LessonDetailContainer = ({
  currLessonPlan,
  lessonFormatType,
  loadingLessonplanData,
}) => {
  const { currSelectedAcademicYear, currSelectedSchool } =
    useContext(AuthContext);

  useEffect(() => {
    setEditableState(null);
  }, [lessonFormatType]);

  const [editableState, setEditableState] = useState(null);
  useEffect(() => {
    setEditableState(null);
  }, [lessonFormatType, currLessonPlan]);
  //   const [lessonPlanList, setLessonPlanList] = useState([]);
  if (loadingLessonplanData) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-gray-300 text-center text-gray-500">
        <LoadingSpinner fullHeight={false} size={12} />
      </div>
    );
  }
  if (!currLessonPlan?.LessonContent) {
    return null;
  }

  const handleExportTablePDF = async (dailyLessonPlanId) => {
    try {
      const response = await getExportDailyLessonPlanData(dailyLessonPlanId);
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
  return (
    <div className="h-full flex-1 space-y-6 overflow-auto rounded-xl p-2 shadow-md">
      <div className="flex items-center justify-between border-b border-gray-300 p-2">
        {lessonFormatType == 3 ? (
          <div className="flex flex-col items-start justify-between gap-1">
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600 md:text-base">
              <span className="font-medium">
                {currLessonPlan.LessonContent.Day}
              </span>

              <span>
                Date:
                <span className="font-medium">
                  {currLessonPlan.LessonContent.Actual_Date}
                </span>
              </span>
            </div>
            <div className="">
              <h2 className="text-primary text-lg font-semibold">
                {currLessonPlan.LessonContent.Lesson_Title}
              </h2>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-between gap-1">
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600 md:text-base">
              <span className="font-semibold text-gray-600">
                {lessonFormatType == 0
                  ? `Grading Period: ${currLessonPlan.LessonContent.Index}`
                  : lessonFormatType == 1
                    ? `Month: ${currLessonPlan.LessonContent.Month}`
                    : lessonFormatType == 2
                      ? `${currLessonPlan.LessonContent.Week}`
                      : `${currLessonPlan.LessonContent.Day}`}
              </span>

              <span>
                Duration:{" "}
                <span className="font-medium">
                  {currLessonPlan.LessonContent.Start_Date} to{" "}
                  {currLessonPlan.LessonContent.End_Date}
                </span>
              </span>
            </div>
            <div className="">
              <h2 className="text-primary text-lg font-semibold">
                {currLessonPlan.LessonContent.Domain_Title}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{`${currLessonPlan?.LessonContent?.Topics?.length || 0} Topics`}</span>
              <span>{`${currLessonPlan?.LessonContent?.Standards?.length || 0} Standards`}</span>
              <span>{`${currLessonPlan?.LessonContent?.Activities?.length || 0} Activities`}</span>
              <span>{`${currLessonPlan?.LessonContent?.Assessments?.length || 0} Assessments`}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {lessonFormatType == 3 && (
            <button
              size="sm"
              onClick={() =>
                handleExportTablePDF(
                  currLessonPlan?.LessonContent?.DailyLessonPlanId,
                )
              }
              className="text-primary border-color-primary inline-flex cursor-pointer items-center gap-1 rounded border bg-white px-3 py-1.5 text-sm transition hover:bg-gray-50"
            >
              <FileDownIcon className="h-4.5 w-4.5" />
              Export
            </button>
          )}
          {!editableState && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // debugger;
                let currState = {
                  LessonContent: { ...currLessonPlan.LessonContent },
                  lists: {
                    Topics: currLessonPlan.LessonContent?.Topics || [],
                    Standards: currLessonPlan.LessonContent?.Standards || [],
                    Activities: currLessonPlan.LessonContent?.Activities || [],
                    Assessments:
                      currLessonPlan.LessonContent?.Assessments || [],
                    Objectives: currLessonPlan.LessonContent?.Objectives || [],
                    Materials_Resources_Needed:
                      currLessonPlan.LessonContent
                        ?.Materials_Resources_Needed || [],
                  },
                };
                setEditableState(currState);
              }}
              // }}
              className="border-primary flex items-center gap-2 self-start rounded-md border px-4 py-1.5 md:self-center"
            >
              <Pencil size={16} /> Edit
            </button>
          )}
        </div>
      </div>
      {editableState ? (
        <LessonEditForm
          onCancel={() => setEditableState(null)}
          editableState={editableState}
          formatType={
            lessonFormatType == 0
              ? `yearly`
              : lessonFormatType == 1
                ? `monthly`
                : lessonFormatType == 2
                  ? `weekly`
                  : `daily`
          }
        />
      ) : (
        <>
          {currLessonPlan?.LessonContent?.Topics?.length > 0 && (
            <div className="px-2">
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Topics
              </h5>
              <div className="flex flex-wrap gap-2">
                {(currLessonPlan.LessonContent.Topics || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-gray-200 px-2 py-1 text-sm text-gray-800"
                  >
                    {t}
                    {idx < currLessonPlan.LessonContent.Topics.length - 1
                      ? ","
                      : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currLessonPlan?.LessonContent?.Standards?.length > 0 && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Standards
              </h5>
              <div className="flex flex-wrap gap-2">
                {(currLessonPlan.LessonContent.Standards || []).map(
                  (s, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                    >
                      {s}
                      {idx < currLessonPlan.LessonContent.Standards.length - 1
                        ? ","
                        : ""}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
          {currLessonPlan?.LessonContent?.Activities?.length > 0 && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Activities
              </h5>
              <div className="flex flex-wrap gap-2">
                {(currLessonPlan.LessonContent.Activities || []).map(
                  (s, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                    >
                      {s}
                      {idx < currLessonPlan.LessonContent.Activities.length - 1
                        ? ","
                        : ""}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
          {currLessonPlan?.LessonContent?.Assessments?.length > 0 && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Assessments
              </h5>
              <div className="flex flex-wrap gap-2">
                {(currLessonPlan.LessonContent.Assessments || []).map(
                  (s, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                    >
                      {s}
                      {idx < currLessonPlan.LessonContent.Assessments.length - 1
                        ? ","
                        : ""}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
          {currLessonPlan?.LessonContent?.Objectives?.length > 0 && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Objectives
              </h5>
              <div className="flex flex-wrap gap-2">
                {(currLessonPlan.LessonContent.Objectives || []).map(
                  (s, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                    >
                      {s}
                      {idx < currLessonPlan.LessonContent.Objectives.length - 1
                        ? ","
                        : ""}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
          {currLessonPlan?.LessonContent?.Materials_Resources_Needed?.length >
            0 && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Materials
              </h5>
              <div className="flex flex-wrap gap-2">
                {(
                  currLessonPlan.LessonContent.Materials_Resources_Needed || []
                ).map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                  >
                    {s}
                    {idx <
                    currLessonPlan.LessonContent.Materials_Resources_Needed
                      .length -
                      1
                      ? ","
                      : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
          {currLessonPlan?.LessonContent?.Input && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Input
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800">
                  {currLessonPlan.LessonContent.Input}
                </span>
              </div>
            </div>
          )}

          {currLessonPlan.LessonContent.Model && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Model
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800">
                  {currLessonPlan.LessonContent.Model}
                </span>
              </div>
            </div>
          )}
          {currLessonPlan.LessonContent.Check_for_Understanding && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Check for Understanding
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800">
                  {currLessonPlan.LessonContent.Check_for_Understanding}
                </span>
              </div>
            </div>
          )}
          {currLessonPlan.LessonContent.Guided_Practice && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Guided Practice
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800">
                  {currLessonPlan.LessonContent.Guided_Practice}
                </span>
              </div>
            </div>
          )}
          {currLessonPlan.LessonContent.Closure && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Closure
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800">
                  {currLessonPlan.LessonContent.Closure}
                </span>
              </div>
            </div>
          )}
          {currLessonPlan.LessonContent.Independent_Practice && (
            <div>
              <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                Independent Practice
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800">
                  {currLessonPlan.LessonContent.Independent_Practice}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LessonDetailContainer;
