import React, { useState, useContext, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

import Model from "../common/Model";
import { Input } from "../ui/Input";

import {
  BookOpen,
  Pencil,
  Plus,
  Delete,
  Trash2,
  Target,
  Package,
} from "lucide-react";
import { keysToCamelCase } from "../../../lib/utility";
import LessonCollapsible from "./LessonCollapsibleSection";

export const DailyLessonSummary = ({ dailyLessonPlans }) => {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState("");
  const [materials_Resources_Needed, setMaterials_Resources_Needed] = useState(
    [],
  );
  const [newMaterials_Resources_Needed, setNewMaterials_Resources_Needed] =
    useState("");
  const [editableTopics, setEditableTopics] = useState([]);

  const [newStandard, setNewStandard] = useState([]);
  const [dailyLessonPlanList, setDailyLessonPlanList] = useState([]);
  const [isEditDay, setIsEditDay] = useState(false);

  const [data, setData] = useState({
    yearlyLessonPlanId: "",
    gradingPeriod: "",
    index: "",
    domainTitle: "",
    topics: [],
    standards: [],
    weeksConsider: "",
    startDate: "",
    endDate: "",
    lessonContent: "",
    monthlyPlans: [],
  });

  useEffect(() => {
    if (dailyLessonPlans) {
      try {
        const outerList =
          typeof dailyLessonPlans === "string"
            ? JSON.parse(dailyLessonPlans)
            : dailyLessonPlans;

        const parsedList = outerList.map((plan) => ({
          ...plan,
          LessonContent: plan.LessonContent
            ? JSON.parse(plan.LessonContent)
            : {},
        }));

        setDailyLessonPlanList(parsedList);
      } catch (err) {
        console.error("Invalid JSON", err);
      }
    }
  }, [dailyLessonPlans]);

  const handleChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (dailyLessonPlans) {
      try {
        const outerList =
          typeof dailyLessonPlans === "string"
            ? JSON.parse(dailyLessonPlans)
            : dailyLessonPlans;

        const parsedList = outerList.map((plan) => ({
          ...plan,
          LessonContent: plan.LessonContent
            ? JSON.parse(plan.LessonContent)
            : {},
        }));

        setDailyLessonPlanList(parsedList);
      } catch (err) {
        console.error("Invalid JSON", err);
      }
    }
  }, [dailyLessonPlans]);

  const handleSave = (e, index) => {
    // TODO: API call to save updates
    e.stopPropagation();
    const updatedList = [...dailyLessonPlanList];
    updatedList[index] = {
      ...updatedList[index],
      LessonContent: {
        ...updatedList[index].LessonContent,
        Objectives: objectives,
        Materials_Resources_Needed: materials_Resources_Needed,
        Lesson_Title: updatedList[index].LessonContent.Lesson_Title,
      },
    };
    setDailyLessonPlanList(updatedList);
    setEditableTopics(editableTopics.filter((i) => i !== index));
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border-gray-300 py-2">
      {dailyLessonPlanList.length > 0 ? (
        dailyLessonPlanList.map((data, idx) => (
          <>
            <LessonCollapsible
              header={
                <div className="flex flex-col items-start justify-between gap-1">
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600 md:text-base">
                    <span className="font-medium">
                      {data.LessonContent.Day}
                    </span>

                    <span>
                      Date:
                      <span className="font-medium">
                        {data.LessonContent.Actual_Date}
                      </span>
                    </span>
                  </div>
                  <div className="">
                    <h2 className="text-primary text-lg font-semibold">
                      {data.LessonContent.Lesson_Title}
                    </h2>
                  </div>
                </div>
              }
              actions={
                editableTopics.includes(idx) ? (
                  <div className="mt-4 flex justify-end gap-4">
                    <Button
                      variant="outline"
                      className="text-gray-600 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editableTopics.includes(idx)) {
                          setEditableTopics(
                            editableTopics.filter((i) => i !== idx),
                          );
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary rounded px-5 py-2 text-white disabled:opacity-50"
                      onClick={(e) => handleSave(e, idx)}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // setOpen(true);
                      if (editableTopics.includes(idx)) {
                        setEditableTopics(
                          editableTopics.filter((i) => i !== idx),
                        );
                      } else {
                        setEditableTopics([idx]);
                      }
                      // setEditableTopics([...editableTopics,idx])
                      setObjectives(data.LessonContent.Objectives || []);

                      setMaterials_Resources_Needed(
                        data.LessonContent.Materials_Resources_Needed || [],
                      );
                    }}
                    className="flex items-center gap-2 self-start md:self-center"
                  >
                    <Pencil size={16} /> Edit
                  </Button>
                )
              }
              defaultOpen={idx == 0 ? true : false}
            >
              {editableTopics.includes(idx) ? (
                <div
                  key={idx}
                  className="w-full max-w-2xl space-y-6 p-6 sm:mx-2 sm:max-w-full"
                >
                  <div>
                    <h4 className="text-md mb-2 font-medium">Lesson Title</h4>
                    <Input
                      value={data.LessonContent.Lesson_Title}
                      onChange={(e) =>
                        (data.LessonContent.Lesson_Title = e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>

                  <div key={idx}>
                    <h4 className="text-md mb-2 font-medium">Objectives</h4>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {objectives.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={t}
                            onChange={(e) => {
                              const updated = [...objectives];
                              updated[i] = e.target.value;
                              setObjectives(updated);
                            }}
                            className="flex-1"
                          />
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                            onClick={() =>
                              setObjectives(
                                objectives.filter((_, idx) => idx !== i),
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        placeholder="Add new objective"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        className="flex-1"
                      />
                      <div
                        className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                        onClick={() => {
                          if (newObjective.trim() !== "") {
                            setObjectives([...objectives, newObjective]);
                            setNewObjective("");
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div key={idx}>
                    <h4 className="text-md mb-2 font-medium">
                      Materials/Resources Needed
                    </h4>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {materials_Resources_Needed.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={t}
                            onChange={(e) => {
                              const updated = [...materials_Resources_Needed];
                              updated[i] = e.target.value;
                              setMaterials_Resources_Needed(updated);
                            }}
                            className="flex-1"
                          />
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                            onClick={() =>
                              setMaterials_Resources_Needed(
                                materials_Resources_Needed.filter(
                                  (_, idx) => idx !== i,
                                ),
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        placeholder="Add new material"
                        value={newMaterials_Resources_Needed}
                        onChange={(e) =>
                          setNewMaterials_Resources_Needed(e.target.value)
                        }
                        className="flex-1"
                      />
                      <div
                        className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                        onClick={() => {
                          if (newMaterials_Resources_Needed.trim() !== "") {
                            setMaterials_Resources_Needed([
                              ...materials_Resources_Needed,
                              newMaterials_Resources_Needed,
                            ]);
                            setNewMaterials_Resources_Needed("");
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md mb-2 font-medium">Input</h4>
                    <Input
                      value={data.LessonContent.Input}
                      onChange={(e) =>
                        (data.LessonContent.Input = e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>

                  <div>
                    <h4 className="text-md mb-2 font-medium"> Model</h4>
                    <Input
                      value={data.LessonContent.Model}
                      onChange={(e) =>
                        (data.LessonContent.Model = e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                  <div>
                    <h4 className="text-md mb-2 font-medium">
                      {" "}
                      Check for Understanding
                    </h4>
                    <Input
                      value={data.LessonContent.Check_for_Understanding}
                      onChange={(e) =>
                        (data.LessonContent.Check_for_Understanding =
                          e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                  <div>
                    <h4 className="text-md mb-2 font-medium">
                      {" "}
                      Guided Practice
                    </h4>
                    <Input
                      value={data.LessonContent.Guided_Practice}
                      onChange={(e) =>
                        (data.LessonContent.Check_for_UnGuided_Practicederstanding =
                          e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>

                  <div>
                    <h4 className="text-md mb-2 font-medium"> Closure</h4>
                    <Input
                      value={data.LessonContent.Closure}
                      onChange={(e) =>
                        (data.LessonContent.Closure = e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>

                  <div>
                    <h4 className="text-md mb-2 font-medium">
                      {" "}
                      Independent Practice
                    </h4>
                    <Input
                      value={data.LessonContent.Independent_Practice}
                      onChange={(e) =>
                        (data.LessonContent.Independent_Practice =
                          e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 rounded-xl py-2">
                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Objectives
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(data.LessonContent.Objectives || []).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {s}
                          {idx < data.LessonContent.Objectives.length - 1
                            ? ","
                            : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Materials
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(
                        data.LessonContent.Materials_Resources_Needed || []
                      ).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {s}
                          {idx <
                          data.LessonContent.Materials_Resources_Needed.length -
                            1
                            ? ","
                            : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Input
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                      >
                        {data.LessonContent.Input}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Model
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                      >
                        {data.LessonContent.Model}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Check for Understanding
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                      >
                        {data.LessonContent.Check_for_Understanding}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Guided Practice
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                      >
                        {data.LessonContent.Guided_Practice}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Closure
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                      >
                        {data.LessonContent.Closure}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Independent Practice
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                      >
                        {data.LessonContent.Independent_Practice}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </LessonCollapsible>
            {/* <Card
              key={idx}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition hover:shadow-2xl"
            >
              <CardHeader className="px-0 pb-4">
                <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600 md:text-base">
                    <h2 className="text-primary text-lg font-semibold">
                      Day:{" "}
                      <span className="font-medium">
                        {data.LessonContent.Day}
                      </span>
                    </h2>

                    <span>
                      Date:
                      <span className="font-medium">
                        {data.LessonContent.Actual_Date}
                      </span>
                    </span>
                  </div>

                  {isEditDay ? (
                    <div className="mt-4 flex justify-end gap-4">
                      <Button
                        variant="outline"
                        className="text-gray-600 hover:text-red-600"
                        onClick={() => setIsEditDay(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-primary rounded px-5 py-2 text-white disabled:opacity-50"
                        onClick={handleSave}
                      >
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditDay(true);
                        setObjectives(data.LessonContent.Objectives || []);

                        setMaterials_Resources_Needed(
                          data.LessonContent.Materials_Resources_Needed || [],
                        );
                      }}
                      className="flex items-center gap-2 self-start md:self-center"
                    >
                      <Pencil size={16} /> Edit
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {isEditDay ? (
                  <div
                    key={idx}
                    className="w-full max-w-2xl space-y-6 p-6 sm:mx-2 sm:max-w-full"
                  >
                    <div>
                      <h4 className="text-md mb-2 font-medium">Lesson Title</h4>
                      <Input
                        value={data.LessonContent.Lesson_Title}
                        onChange={(e) =>
                          (data.LessonContent.Lesson_Title = e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>

                    <div key={idx}>
                      <h4 className="text-md mb-2 font-medium">Objectives</h4>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {objectives.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={t}
                              onChange={(e) => {
                                const updated = [...objectives];
                                updated[i] = e.target.value;
                                setObjectives(updated);
                              }}
                              className="flex-1"
                            />
                            <Trash2
                              className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                              onClick={() =>
                                setObjectives(
                                  objectives.filter((_, idx) => idx !== i),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          placeholder="Add new objective"
                          value={newObjective}
                          onChange={(e) => setNewObjective(e.target.value)}
                          className="flex-1"
                        />
                        <div
                          className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                          onClick={() => {
                            if (newObjective.trim() !== "") {
                              setObjectives([...objectives, newObjective]);
                              setNewObjective("");
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    <div key={idx}>
                      <h4 className="text-md mb-2 font-medium">
                        Materials/Resources Needed
                      </h4>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {materials_Resources_Needed.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={t}
                              onChange={(e) => {
                                const updated = [...materials_Resources_Needed];
                                updated[i] = e.target.value;
                                setMaterials_Resources_Needed(updated);
                              }}
                              className="flex-1"
                            />
                            <Trash2
                              className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                              onClick={() =>
                                setMaterials_Resources_Needed(
                                  materials_Resources_Needed.filter(
                                    (_, idx) => idx !== i,
                                  ),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          placeholder="Add new material"
                          value={newMaterials_Resources_Needed}
                          onChange={(e) =>
                            setNewMaterials_Resources_Needed(e.target.value)
                          }
                          className="flex-1"
                        />
                        <div
                          className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                          onClick={() => {
                            if (newMaterials_Resources_Needed.trim() !== "") {
                              setMaterials_Resources_Needed([
                                ...materials_Resources_Needed,
                                newMaterials_Resources_Needed,
                              ]);
                              setNewMaterials_Resources_Needed("");
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md mb-2 font-medium">Input</h4>
                      <Input
                        value={data.LessonContent.Input}
                        onChange={(e) =>
                          (data.LessonContent.Input = e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>

                    <div>
                      <h4 className="text-md mb-2 font-medium"> Model</h4>
                      <Input
                        value={data.LessonContent.Model}
                        onChange={(e) =>
                          (data.LessonContent.Model = e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                    <div>
                      <h4 className="text-md mb-2 font-medium">
                        {" "}
                        Check for Understanding
                      </h4>
                      <Input
                        value={data.LessonContent.Check_for_Understanding}
                        onChange={(e) =>
                          (data.LessonContent.Check_for_Understanding =
                            e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                    <div>
                      <h4 className="text-md mb-2 font-medium">
                        {" "}
                        Guided Practice
                      </h4>
                      <Input
                        value={data.LessonContent.Guided_Practice}
                        onChange={(e) =>
                          (data.LessonContent.Check_for_UnGuided_Practicederstanding =
                            e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>

                    <div>
                      <h4 className="text-md mb-2 font-medium"> Closure</h4>
                      <Input
                        value={data.LessonContent.Closure}
                        onChange={(e) =>
                          (data.LessonContent.Closure = e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>

                    <div>
                      <h4 className="text-md mb-2 font-medium">
                        {" "}
                        Independent Practice
                      </h4>
                      <Input
                        value={data.LessonContent.Independent_Practice}
                        onChange={(e) =>
                          (data.LessonContent.Independent_Practice =
                            e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 rounded-xl bg-gray-50 p-4">
                    <div>
                      <h4 className="text-md mb-2 font-medium">Lesson Title</h4>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {data.LessonContent.Lesson_Title}
                      </span>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Objectives
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {(data.LessonContent.Objectives || []).map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                          >
                            {s}
                            {idx < data.LessonContent.Objectives.length - 1
                              ? ","
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Materials
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {(
                          data.LessonContent.Materials_Resources_Needed || []
                        ).map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                          >
                            {s}
                            {idx <
                            data.LessonContent.Materials_Resources_Needed
                              .length -
                              1
                              ? ","
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Input
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {data.LessonContent.Input}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Model
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {data.LessonContent.Model}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Check for Understanding
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {data.LessonContent.Check_for_Understanding}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Guided Practice
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {data.LessonContent.Guided_Practice}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Closure
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {data.LessonContent.Closure}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Independent Practice
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {data.LessonContent.Independent_Practice}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card> */}
          </>
        ))
      ) : (
        <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
          <BookOpen className="mb-3 h-12 w-12 text-gray-400" />
          <h2 className="text-lg font-semibold">No Daily Lesson Plans Found</h2>
          <p className="text-sm text-gray-400">
            No lesson plans are available for the selected lesson format.
          </p>
        </div>
      )}
    </div>
  );
};
