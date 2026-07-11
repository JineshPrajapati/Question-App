import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Grid,
  IconButton,
  Button,
  Divider,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Add, Delete, AutoAwesome } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import dayjs from "dayjs";
import { Save, ChevronDown } from "lucide-react";
import { addLessonPlan } from "../../../api/services/lessonPlanService";
import { LessonPlanExport } from "../lessonPlan/LessonPlanExport";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";

const isValidJson = (str) => {
  if (typeof str !== "string") return false;
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) || typeof parsed === "object";
  } catch (e) {
    return false;
  }
};

export const LessonPlanEditor = ({
  lessonFormat,
  lessonData,
  onGeneratePlan,
}) => {
  const [expandedParentId, setExpandedParentId] = useState(null);
  const [showGenerateButton, setShowGenerateButton] = useState(true);
  const [openCollapsibles, setOpenCollapsibles] = useState([]);
  const [lessonPlanData, setLessonPlanData] = useState(lessonData || null);
  const [loading, setLoading] = useState(false);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [previewMode, setPreviewMode] = useState(true);
  const {
    user: currentUser,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);

  useEffect(() => {
    if (lessonData) {
      const content = lessonData?.plannedLessonContent;

      if (content && typeof content === "string" && isValidJson(content)) {
        try {
          const parsedContent = JSON.parse(content);
          if (Array.isArray(parsedContent)) {
            const periods = parsedContent
              ? (() => {
                  switch (lessonFormat) {
                    case "Yearly":
                      return Array.from(
                        new Map(
                          parsedContent.map((item, index) => [
                            item.Grading_Period,
                            {
                              Period:
                                "Grading Period " +
                                (index + 1) +
                                " : " +
                                item.Grading_Period,
                              Index: index + 1,
                              Start_Date: item.Start_Date,
                              End_Date: item.End_Date,
                              Domain_Title: item.Domain_Title,
                              Topics: item.Topics || [],
                              Standards: item.Standards || [],
                            },
                          ]),
                        ).values(),
                      );

                    case "Monthly":
                      return Array.from(
                        new Map(
                          parsedContent.map((item, index) => [
                            dayjs(item.Start_Date).format("MMMM YYYY"),
                            {
                              Period: dayjs(item.Start_Date).format(
                                "MMMM YYYY",
                              ),
                              Index: index + 1,
                              Start_Date: item.Start_Date,
                              End_Date: item.End_Date,
                              Domain_Title: item.Domain_Title,
                              Topics: item.Topics || [],
                              Standards: item.Standards || [],
                              Activities: item.Activities || [],
                              Assessments: item.Assessments || [],
                            },
                          ]),
                        ).values(),
                      );

                    case "Weekly":
                      return Array.from(
                        new Map(
                          parsedContent.map((item, index) => [
                            `Week ${dayjs(item.Start_Date).week()} (${dayjs(item.Start_Date).format("DD MMM")})`,
                            {
                              Period: `Week ${dayjs(item.Start_Date).week()}`,
                              Index: index + 1,
                              Start_Date: item.Start_Date,
                              End_Date: item.End_Date,
                              Domain_Title: item.Domain_Title,
                              Topics: item.Topics || [],
                              Standards: item.Standards || [],
                              Materials: item.Materials || [],
                              Activities: item.Activities || [],
                              Assessments: item.Assessments || [],
                            },
                          ]),
                        ).values(),
                      );

                    case "Daily":
                      return parsedContent.map((item, index) => ({
                        Period: dayjs(item.Actual_Date).format("DD MMM YYYY"),
                        Index: index + 1,
                        Day: item.Day,
                        Lesson_Title: item.Lesson_Title,
                        Objectives: item.Objectives || [],
                        Materials_Resources_Needed:
                          item.Materials_Resources_Needed || [],
                        Anticipatory_Set: item.Anticipatory_Set || [],
                        Objective_Purpose: item.Objective_Purpose || [],
                        Input: item.Input || [],
                        Model: item.Model || [],
                        Check_for_Understanding:
                          item.Check_for_Understanding || [],
                        Guided_Practice: item.Guided_Practice || [],
                        Closure: item.Closure || [],
                        Independent_Practice: item.Independent_Practice || [],
                        Actual_Date: item.Actual_Date || "",
                      }));

                    default:
                      return [];
                  }
                })()
              : [];

            const filteredPeriods =
              lessonData?.periodValue == "" ||
              lessonData?.periodValue == "all" ||
              lessonData?.periodValue == null
                ? periods
                : periods.filter((p) =>
                    p.Period.toLowerCase().includes(
                      lessonData?.periodValue.toLowerCase(),
                    ),
                  );

            setLessonPlans(filteredPeriods);
          }
        } catch (error) {
          console.error("Failed to parse {Lesson Plan Content}:", error);
        }
      } else if (Array.isArray(content)) {
        setLessonPlans(content);
      } else {
        console.warn("No valid {Lesson Plan Content} found.");
        setLessonPlans([]);
      }

      setPreviewMode(true);
    }
  }, [lessonData]);

  const handleExportPreview = () => {
    setPreviewMode(true);
  };

  const mutation = useMutation({
    mutationFn: addLessonPlan,
    onSuccess: (data) => {
      setLoading(false);
      toast.success("Saved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Lesson Plan added successfully");
    },
  });

  const handleSaveLessonPlan = () => {
    setLoading(true);

    const payload = {
      userId: currentUser.userId || "",
      schoolId: parseInt(lessonData.schoolId),
      gradeId: parseInt(lessonData.gradeId),
      subjectId: parseInt(lessonData.subjectId),
      lessonFormat: lessonFormat || "",
      startDate: lessonData.startDate,
      endDate: lessonData.endDate,
      plannedLessonContent: JSON.stringify(lessonPlans),
      academicYearId: lessonData.academicYearId || "",
    };
    try {
      setLoading(true);
      mutation.mutateAsync(payload);
    } catch (error) {}
  };

  const handleNextLevelLesson = () => {
    const values = {
      academicYearId: parseInt(currSelectedAcademicYear || 0),
      schoolId: formData.schoolId,
      gradeId: formData.gradeId,
      lessonFormat: formData.lessonFormat,
      startDate: formData.dateRange.from,
      endDate: formData.dateRange.to,
      subjectId: formData.subjectId,
      periodValue: formData.periodValue,
      userId: formData.userIdentityKey,
    };

    onGeneratePlan();
  };

  const handleChange = (index, field, value) => {
    const updated = [...lessonPlans];
    updated[index][field] = value;
    setLessonPlans(updated);
  };

  const handleArrayChange = (index, field, arrIndex, value) => {
    const updated = [...lessonPlans];
    updated[index][field][arrIndex] = value;
    setLessonPlans(updated);
  };

  const addArrayItem = (index, field) => {
    const updated = [...lessonPlans];
    updated[index][field].push("");
    setLessonPlans(updated);
  };

  const removeArrayItem = (index, field, arrIndex) => {
    const updated = [...lessonPlans];
    updated[index][field].splice(arrIndex, 1);
    setLessonPlans(updated);
  };

  const onDragEnd = (result, planIndex, field) => {
    if (!result.destination) return;
    const updated = [...lessonPlans];
    const items = Array.from(updated[planIndex][field]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updated[planIndex][field] = items;
    setLessonPlans(updated);
  };

  const getWeeksBetweenDates = (startDate, endDate) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return Math.ceil(end.diff(start, "day") / 7);
  };
  const MemoizedLessonPlanExport = React.memo(LessonPlanExport);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full max-h-full flex-1 flex-col overflow-hidden rounded-xl border border-gray-300">
      <div className="flex items-center justify-between p-4">
        <Typography className="font-bold" variant="h6">
          {"Generated Lesson Plan"}
        </Typography>

        <div className="flex items-center gap-2">
          <FormControlLabel
            control={
              <Switch
                checked={previewMode}
                onChange={() => setPreviewMode(!previewMode)}
              />
            }
            label="Preview Mode"
            sx={{}} // remove extra margin to align properly
          />

          <Button
            sx={{}}
            color="primary"
            variant="outline"
            onClick={handleSaveLessonPlan}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Plan
          </Button>
        </div>
      </div>
      <Divider />
      {previewMode && (
        <MemoizedLessonPlanExport
          lessonFormat={lessonFormat}
          lessonPlans={lessonPlans}
          lessonData={lessonData}
        />
      )}

      {!previewMode &&
        lessonPlans &&
        lessonPlans.map((plan, index) => (
          <Collapsible
            key={index}
            open={openCollapsibles[index] ?? false}
            onOpenChange={(isOpen) =>
              setOpenCollapsibles((prev) => ({ ...prev, [index]: isOpen }))
            }
            className="animate-fade-in"
          >
            <CollapsibleTrigger
              className="flex w-full items-center justify-between rounded-lg transition-colors"
              style={{
                backgroundColor: "#eef0f1",
                padding: "5px 12px",
                margin: "5px 5px",
                cursor: "pointer",
                border: "1px solid #c4c6c9",
              }}
            >
              <Typography sx={{ color: "#000" }} variant="subtitle1">
                {plan.Period}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                {/* Generate / Deep Down Button */}
                {(lessonFormat === "Monthly" || lessonFormat === "Weekly") && (
                  <IconButton
                    size="small"
                    color="primary"
                    title="Next Level Detail"
                    sx={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <AutoAwesome fontSize="small" />
                  </IconButton>
                )}

                <ChevronDown className="h-4 w-4 transition-transform duration-300 data-[state=closed]:rotate-180" />
              </Box>
            </CollapsibleTrigger>
            <CollapsibleContent
              className="overflow-hidden transition-all duration-300 ease-in-out"
              data-state-open-style={{
                maxHeight: "1000px",
              }}
            >
              <div className="mt-2">
                <Card key={index} sx={{ mb: 4 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label="Start Date"
                            value={
                              plan.Start_Date ? dayjs(plan.Start_Date) : null
                            }
                            onChange={(date) => {
                              const formattedDate = date
                                ? date.format("YYYY-MM-DD")
                                : "";
                              handleChange(index, "Start_Date", formattedDate);

                              if (plan.End_Date) {
                                const weeks = Math.ceil(
                                  (new Date(plan.End_Date) -
                                    new Date(formattedDate)) /
                                    (1000 * 60 * 60 * 24 * 7),
                                );
                                handleChange(
                                  index,
                                  "Weeks_Consider",
                                  weeks > 0 ? weeks : 0,
                                );
                              }
                            }}
                            slotProps={{
                              textField: { size: "small", sx: { width: 200 } },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label="End Date"
                            value={plan.End_Date ? dayjs(plan.End_Date) : null}
                            onChange={(date) => {
                              const formattedDate = date
                                ? date.format("YYYY-MM-DD")
                                : "";
                              handleChange(index, "End_Date", formattedDate);

                              // Auto-update Weeks_Consider when Start Date is available
                              if (plan.Start_Date) {
                                const weeks = Math.ceil(
                                  (new Date(formattedDate) -
                                    new Date(plan.Start_Date)) /
                                    (1000 * 60 * 60 * 24 * 7),
                                );
                                handleChange(
                                  index,
                                  "Weeks_Consider",
                                  weeks > 0 ? weeks : 0,
                                );
                              }
                            }}
                            slotProps={{
                              textField: { size: "small", sx: { width: 200 } },
                            }}
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        size="small"
                        sx={{ minHeight: 40 }}
                        label="Domain Title"
                        value={plan.Domain_Title}
                        onChange={(e) =>
                          handleChange(index, "Domain_Title", e.target.value)
                        }
                      />
                    </Grid>

                    <Divider sx={{ my: 2 }} />
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle1" align="left">
                        Topics
                      </Typography>
                      <Button
                        className="bg-primary transition-smooth h-[30px] w-full text-white hover:opacity-90"
                        startIcon={<Add />}
                        onClick={() => addArrayItem(index, "Topics")}
                        sx={{ mt: 1 }}
                      >
                        Add Topic
                      </Button>
                    </Box>

                    <DragDropContext
                      onDragEnd={(result) => onDragEnd(result, index, "Topics")}
                    >
                      <Droppable droppableId={`topics-${index}`}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {plan.Topics.map((topic, tIndex) => (
                              <Draggable
                                key={`topic-${tIndex}`}
                                draggableId={`topic-${tIndex}`}
                                index={tIndex}
                              >
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    mt={1}
                                  >
                                    <TextField
                                      fullWidth
                                      value={topic}
                                      size="small"
                                      sx={{ minHeight: 40 }}
                                      onChange={(e) =>
                                        handleArrayChange(
                                          index,
                                          "Topics",
                                          tIndex,
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        removeArrayItem(index, "Topics", tIndex)
                                      }
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <Divider sx={{ my: 2 }} />
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle1" align="left">
                        Standards
                      </Typography>
                      <Button
                        className="bg-primary transition-smooth h-[30px] w-full text-white hover:opacity-90"
                        startIcon={<Add />}
                        onClick={() => addArrayItem(index, "Standards")}
                        sx={{ mt: 1 }}
                      >
                        Add Standard
                      </Button>
                    </Box>

                    <DragDropContext
                      onDragEnd={(result) =>
                        onDragEnd(result, index, "Standards")
                      }
                    >
                      <Droppable droppableId={`standards-${index}`}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {plan.Standards.map((std, sIndex) => (
                              <Draggable
                                key={`standard-${sIndex}`}
                                draggableId={`standard-${sIndex}`}
                                index={sIndex}
                              >
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    mt={1}
                                  >
                                    <TextField
                                      fullWidth
                                      value={std}
                                      size="small"
                                      sx={{ minHeight: 40 }}
                                      onChange={(e) =>
                                        handleArrayChange(
                                          index,
                                          "Standards",
                                          sIndex,
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        removeArrayItem(
                                          index,
                                          "Standards",
                                          sIndex,
                                        )
                                      }
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>
                    {(lessonFormat === "Monthly" ||
                      lessonFormat === "Weekly") && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography variant="subtitle1" align="left">
                            Activities
                          </Typography>
                          <Button
                            className="bg-primary transition-smooth h-[30px] w-full text-white hover:opacity-90"
                            startIcon={<Add />}
                            onClick={() => addArrayItem(index, "Activities")}
                            sx={{ mt: 1 }}
                          >
                            Add Activity
                          </Button>
                        </Box>
                        <DragDropContext
                          onDragEnd={(result) =>
                            onDragEnd(result, index, "Activities")
                          }
                        >
                          <Droppable droppableId={`activities-${index}`}>
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {plan.Activities.map((std, sIndex) => (
                                  <Draggable
                                    key={`activity-${sIndex}`}
                                    draggableId={`activity-${sIndex}`}
                                    index={sIndex}
                                  >
                                    {(provided) => (
                                      <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        mt={1}
                                      >
                                        <TextField
                                          fullWidth
                                          value={std}
                                          size="small"
                                          sx={{ minHeight: 40 }}
                                          onChange={(e) =>
                                            handleArrayChange(
                                              index,
                                              "Activities",
                                              sIndex,
                                              e.target.value,
                                            )
                                          }
                                        />
                                        <IconButton
                                          color="error"
                                          onClick={() =>
                                            removeArrayItem(
                                              index,
                                              "Activities",
                                              sIndex,
                                            )
                                          }
                                        >
                                          <Delete />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            )}
                          </Droppable>
                        </DragDropContext>

                        <Divider sx={{ my: 2 }} />
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography variant="subtitle1" align="left">
                            Assessments
                          </Typography>
                          <Button
                            className="bg-primary transition-smooth h-[30px] w-full text-white hover:opacity-90"
                            startIcon={<Add />}
                            onClick={() => addArrayItem(index, "Assessments")}
                            sx={{ mt: 1 }}
                          >
                            Add Assessment
                          </Button>
                        </Box>
                        <DragDropContext
                          onDragEnd={(result) =>
                            onDragEnd(result, index, "Assessments")
                          }
                        >
                          <Droppable droppableId={`assessments-${index}`}>
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {plan.Activities.map((std, sIndex) => (
                                  <Draggable
                                    key={`assessment-${sIndex}`}
                                    draggableId={`assessment-${sIndex}`}
                                    index={sIndex}
                                  >
                                    {(provided) => (
                                      <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        mt={1}
                                      >
                                        <TextField
                                          fullWidth
                                          value={std}
                                          size="small"
                                          sx={{ minHeight: 40 }}
                                          onChange={(e) =>
                                            handleArrayChange(
                                              index,
                                              "Assessments",
                                              sIndex,
                                              e.target.value,
                                            )
                                          }
                                        />
                                        <IconButton
                                          color="error"
                                          onClick={() =>
                                            removeArrayItem(
                                              index,
                                              "Assessments",
                                              sIndex,
                                            )
                                          }
                                        >
                                          <Delete />
                                        </IconButton>
                                      </Box>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
              {plan.ParentPeriod && (
                <Box display="flex" justifyContent="flex-end" mb={1}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => handleBackToParent(plan, index)}
                  >
                    ← Back to {plan.ParentPeriod}
                  </Button>
                </Box>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
    </div>
  );
};
