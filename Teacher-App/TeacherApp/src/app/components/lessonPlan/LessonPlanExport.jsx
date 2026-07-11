import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import NestedLessonPlanTable from "./NestedLessonPlanTable";
import { DUMMY_LESSON_PLAN } from "./dummyLessonPlan";
import LessonPlanTable from "./NestedLessonPlanList";

export const LessonPlanExport = ({ lessonFormat, lessonPlans, lessonData }) => {
  const [exportMode, setExportMode] = useState(false);
  const formatTitle = lessonFormat + "- Lesson Format";
  const [lessonPlanList, setLessonPlanList] = useState([]);

  useEffect(() => {
    if (lessonPlans) {
      try {
        if (Array.isArray(lessonPlans)) {
          setLessonPlanList(lessonPlans);
        }
      } catch (error) {
        console.error("Failed to parse {Lesson Plan Content}:", error);
      }
    }
  }, [lessonPlans]);

  const handleExportMode = () => {
    setExportMode(true);
    exportPDF();
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("Lesson Plan Export", 14, 15);

    const headers = [
      [
        formatTitle,
        "Start Date",
        "End Date",
        "Domain Title",
        "Topics",
        "Standards",
      ],
    ];

    const data = lessonPlanList.map((gp) => [
      gp.Period,
      gp.Start_Date ? dayjs(gp.Start_Date).format("DD MMM YYYY") : "-",
      gp.End_Date ? dayjs(gp.End_Date).format("DD MMM YYYY") : "-",
      gp.Domain_Title || "-",
      gp.Topics.length > 0 ? "- " + gp.Topics.join("\n- ") : "-",
      gp.Standards.length > 0 ? "- " + gp.Standards.join("\n- ") : "-",
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 25,
      styles: { fontSize: 9, cellPadding: 3, valign: "top" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 30 }, // Grading Period
        1: { cellWidth: 35 }, // Start Date
        2: { cellWidth: 35 }, // End Date
        3: { cellWidth: 50 }, // Domain Title
        4: { cellWidth: 80 }, // Topics
        5: { cellWidth: 80 }, // Standards
      },
      didDrawCell: (data) => {
        // Optional: Add custom styling if needed
      },
    });

    doc.save("LessonPlan.pdf");
  };

  return (
    <>
      {/* Export Button */}

      <Box className="h-full flex-1 overflow-hidden">
        {/* <div className="flex items-center justify-between">
          <Typography variant="h5" gutterBottom>
            ({formatTitle})
          </Typography>
          <Button variant="contained" sx={{ mb: 2 }} onClick={handleExportMode}>
            Export to PDF
          </Button>
        </div> */}

        {/* <Divider sx={{ mb: 2 }} /> */}

        {/* {lessonPlanList.length === 0 ? (
          <Typography>No lesson plans available.</Typography>
        ) : (
          // <NestedLessonPlanTable lessonPlans={DUMMY_LESSON_PLAN} />
          <LessonPlanTable lessonPlans={DUMMY_LESSON_PLAN} />
        )} */}
        <LessonPlanTable lessonPlans={DUMMY_LESSON_PLAN} />
      </Box>
    </>
  );
};
