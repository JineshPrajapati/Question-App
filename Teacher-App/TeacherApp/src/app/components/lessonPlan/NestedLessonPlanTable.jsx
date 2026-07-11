import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import dayjs from "dayjs";

const NestedLessonPlanTable = ({ lessonPlans }) => (
  <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
          <TableCell>
            <b>Level</b>
          </TableCell>
          <TableCell>
            <b>Title</b>
          </TableCell>
          <TableCell>
            <b>Date Range</b>
          </TableCell>
          <TableCell>
            <b>Topics</b>
          </TableCell>
          <TableCell>
            <b>Objectives / Materials</b>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lessonPlans.map((grading, gIdx) => (
          <GradingPeriodRow key={gIdx} grading={grading} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const GradingPeriodRow = ({ grading }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow sx={{ backgroundColor: "#f0f8ff" }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
          <b>Grading Period</b>
        </TableCell>
        <TableCell colSpan={4}>
          <b>{grading.Grading_Period}</b> &mdash; {grading.Domain_Title} <br />
          Weeks: {grading.Weeks_Consider}, Standards:{" "}
          {grading.Standards.join(", ")}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={5} sx={{ padding: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {grading.MonthlyPlans.map((month, mIdx) => (
              <MonthRow key={mIdx} month={month} />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const MonthRow = ({ month }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow sx={{ backgroundColor: "#fef6e4" }}>
        <TableCell sx={{ pl: 4 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
          <b>Month</b>
        </TableCell>
        <TableCell>{month.Month}</TableCell>
        <TableCell colSpan={3}>
          Domain: {month.Domain_Title} | Topics: {month.Topics.join(", ")}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={5} sx={{ padding: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {month.WeeklyPlans.map((week, wIdx) => (
              <WeekRow key={wIdx} week={week} />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const WeekRow = ({ week }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
        <TableCell sx={{ pl: 6 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
          <b>Week</b>
        </TableCell>
        <TableCell>{week.Week}</TableCell>
        <TableCell>
          {dayjs(week.Start_Date).format("DD MMM")} -{" "}
          {dayjs(week.End_Date).format("DD MMM")}
        </TableCell>
        <TableCell>{week.Topics.join(", ")}</TableCell>
        <TableCell>{week.Standards.join(", ")}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={5} sx={{ padding: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {week.DailyPlans.map((day, dIdx) => (
              <DailyRow key={dIdx} day={day} />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const DailyRow = ({ day }) => {
  return (
    <TableRow sx={{ backgroundColor: "#fff" }}>
      <TableCell sx={{ pl: 8 }}>Day</TableCell>
      <TableCell>{day.Day}</TableCell>
      <TableCell>{day.Actual_Date}</TableCell>
      <TableCell>
        <b>{day.Lesson_Title}</b>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          <b>Objectives:</b>
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {day.Objectives.map((obj, idx) => (
            <li key={idx}>{obj}</li>
          ))}
        </ul>
        <Typography variant="body2" mt={1}>
          <b>Materials:</b> {day.Materials_Resources_Needed.join(", ")}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export default NestedLessonPlanTable;
