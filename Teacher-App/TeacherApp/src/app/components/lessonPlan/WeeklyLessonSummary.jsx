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

export const WeeklyLessonSummary = ({ weeklyLessonPlans }) => {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [standards, setStandards] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [newStandard, setNewStandard] = useState("");
  const [weeklyLessonPlanList, setWeeklyLessonPlanList] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newAssessment, setNewAssessment] = useState("");
  const [newActivity, setNewActivity] = useState("");

  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState("");
  const [isEditWeek, setIsEditWeek] = useState(false);
  const [editableTopics, setEditableTopics] = useState([]);

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

  const handleChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (weeklyLessonPlans) {
      try {
        const outerList =
          typeof weeklyLessonPlans === "string"
            ? JSON.parse(weeklyLessonPlans)
            : weeklyLessonPlans;

        const parsedList = outerList.map((plan) => ({
          ...plan,
          LessonContent: plan.LessonContent
            ? JSON.parse(plan.LessonContent)
            : {},
        }));

        setWeeklyLessonPlanList(parsedList);
      } catch (err) {
        console.error("Invalid JSON", err);
      }
    }
  }, [weeklyLessonPlans]);

  const handleSave = (e, index) => {
    e.stopPropagation();
    // Update the specific lesson content in the list
    const updatedList = [...weeklyLessonPlanList];
    updatedList[index].LessonContent.Topics = topics;
    updatedList[index].LessonContent.Standards = standards;
    updatedList[index].LessonContent.Activities = activities;

    updatedList[index].LessonContent.Assessments = assessments;
    updatedList[index].LessonContent.Materials = materials;

    // Update the lesson content in the state
    setWeeklyLessonPlanList(updatedList);
    // Update the data object with the new values
    setData((prev) => ({
      ...prev,
      topics: topics,
      standards: standards,
      activities: activities,

      assessments: assessments,

      materials: materials,
    }));

    // TODO: API call to save updates

    setEditableTopics(editableTopics.filter((i) => i !== index)); // Remove the index from editableTopics after saving
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border-gray-300 py-2">
      {weeklyLessonPlanList.length > 0 ? (
        weeklyLessonPlanList.map((data, idx) => (
          <>
            <LessonCollapsible
              header={
                <div className="flex flex-col items-start justify-between gap-1">
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600 md:text-base">
                    <h2 className="font-semibold">
                      Week:{" "}
                      <span className="font-medium">
                        {data.LessonContent.Index}
                      </span>
                    </h2>

                    <span>
                      Duration:{" "}
                      <span className="font-medium">
                        {data.LessonContent.Start_Date} to{" "}
                        {data.LessonContent.End_Date}
                      </span>
                    </span>
                  </div>
                  <div className="">
                    <h2 className="text-primary text-lg font-semibold">
                      {data.LessonContent.Domain_Title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span>{`${data?.LessonContent?.Topics?.length || 0} Topics`}</span>
                    <span>{`${data?.LessonContent?.Standards?.length || 0} Standards`}</span>
                    <span>{`${data?.LessonContent?.Activities?.length || 0} Activities`}</span>
                    <span>{`${data?.LessonContent?.Assessments?.length || 0} Assessments`}</span>
                    <span>{`${data?.LessonContent?.Materials?.length || 0} Materials`}</span>
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
                      setTopics(data.LessonContent.Topics || []);
                      setStandards(data.LessonContent.Standards || []);
                      setActivities(data.LessonContent.Activities || []);
                      setAssessments(data.LessonContent.Assessments || []);
                      setMaterials(data.LessonContent.Materials || []);
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
                    <h4 className="text-md mb-2 font-medium">Domain Title</h4>
                    <Input
                      value={data.LessonContent.Domain_Title}
                      onChange={(e) =>
                        (data.LessonContent.Domain_Title = e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>

                  <div key={idx}>
                    <h4 className="text-md mb-2 font-medium">Topics</h4>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {topics.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={t}
                            onChange={(e) => {
                              const updated = [...topics];
                              updated[i] = e.target.value;
                              setTopics(updated);
                            }}
                            className="flex-1"
                          />
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                            onClick={() =>
                              setTopics(topics.filter((_, idx) => idx !== i))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        placeholder="Add new topic"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="flex-1"
                      />
                      <div
                        className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                        onClick={() => {
                          if (newTopic.trim() !== "") {
                            setTopics([...topics, newTopic]);
                            setNewTopic("");
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md mb-2 font-medium">Standards</h4>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {standards.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={s}
                            onChange={(e) => {
                              const updated = [...standards];
                              updated[i] = e.target.value;
                              setStandards(updated);
                            }}
                            className="flex-1"
                          />
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                            onClick={() =>
                              setStandards(
                                standards.filter((_, idx) => idx !== i),
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        placeholder="Add new standard"
                        value={newStandard}
                        onChange={(e) => setNewStandard(e.target.value)}
                        className="flex-1"
                      />
                      <div
                        className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                        onClick={() => {
                          if (newStandard.trim() !== "") {
                            setStandards([...standards, newStandard]);
                            setNewStandard("");
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md mb-2 font-medium">Activities</h4>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {activities.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={t}
                            onChange={(e) => {
                              const updated = [...activities];
                              updated[i] = e.target.value;
                              setActivities(updated);
                            }}
                            className="flex-1"
                          />
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                            onClick={() =>
                              setActivities(
                                topics.filter((_, idx) => idx !== i),
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        placeholder="Add new activity"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        className="flex-1"
                      />
                      <div
                        className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                        onClick={() => {
                          if (newActivity.trim() !== "") {
                            setActivities([...activities, newActivity]);
                            setNewActivity("");
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md mb-2 font-medium">Assessments</h4>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {assessments.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={t}
                            onChange={(e) => {
                              const updated = [...assessments];
                              updated[i] = e.target.value;
                              setAssessments(updated);
                            }}
                            className="flex-1"
                          />
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                            onClick={() =>
                              setAssessments(
                                assessments.filter((_, idx) => idx !== i),
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        placeholder="Add new assessment"
                        value={newAssessment}
                        onChange={(e) => setNewAssessment(e.target.value)}
                        className="flex-1"
                      />
                      <div
                        className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                        onClick={() => {
                          if (newAssessment.trim() !== "") {
                            setAssessments([...topics, newAssessment]);
                            setNewAssessment("");
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md mb-2 font-medium">Materials</h4>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {materials.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={t}
                            onChange={(e) => {
                              const updated = [...materials];
                              updated[i] = e.target.value;
                              setMaterials(updated);
                            }}
                            className="flex-1"
                          />
                          <Trash2
                            className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                            onClick={() =>
                              setMaterials(topics.filter((_, idx) => idx !== i))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        placeholder="Add new material"
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e.target.value)}
                        className="flex-1"
                      />
                      <div
                        className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                        onClick={() => {
                          if (newMaterial.trim() !== "") {
                            setActivities([...materials, newMaterial]);
                            setNewMaterial("");
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 rounded-xl py-2">
                  {/* <div>
                  <h3 className="text-md mb-2 font-semibold">Domain Title</h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {data.LessonContent.Domain_Title}
                  </span>
                </div> */}

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Topics
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(data.LessonContent.Topics || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-gray-200 px-2 py-1 text-sm text-gray-800"
                        >
                          {t}
                          {idx < data.LessonContent.Topics.length - 1
                            ? ","
                            : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Standards
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(data.LessonContent.Standards || []).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {s}
                          {idx < data.LessonContent.Standards.length - 1
                            ? ","
                            : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Activities
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(data.LessonContent.Activities || []).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {s}
                          {idx < data.LessonContent.Activities.length - 1
                            ? ","
                            : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-muted-foreground text-md mb-2 flex items-center font-medium">
                      <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                      Assessments
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(data.LessonContent.Assessments || []).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                        >
                          {s}
                          {idx < data.LessonContent.Assessments.length - 1
                            ? ","
                            : ""}
                        </span>
                      ))}
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
                      Week:{" "}
                      <span className="font-medium">
                        {data.LessonContent.Index}
                      </span>
                    </h2>

                    <span>
                      Duration:{" "}
                      <span className="font-medium">
                        {data.LessonContent.Start_Date} to{" "}
                        {data.LessonContent.End_Date}
                      </span>
                    </span>
                  </div>

                  {isEditWeek ? (
                    <div className="mt-4 flex justify-end gap-4">
                      <Button
                        variant="outline"
                        className="text-gray-600 hover:text-red-600"
                        onClick={() => setIsEditWeek(false)}
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
                        setIsEditWeek(true);
                        setTopics(data.LessonContent.Topics || []);
                        setStandards(data.LessonContent.Standards || []);
                        setActivities(data.LessonContent.Activities || []);
                        setAssessments(data.LessonContent.Assessments || []);
                        setMaterials(data.LessonContent.Materials || []);
                      }}
                      className="flex items-center gap-2 self-start md:self-center"
                    >
                      <Pencil size={16} /> Edit
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {isEditWeek ? (
                  <div
                    key={idx}
                    className="w-full max-w-2xl space-y-6 p-6 sm:mx-2 sm:max-w-full"
                  >
                    <div>
                      <h4 className="text-md mb-2 font-medium">Domain Title</h4>
                      <Input
                        value={data.LessonContent.Domain_Title}
                        onChange={(e) =>
                          (data.LessonContent.Domain_Title = e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>

                    <div key={idx}>
                      <h4 className="text-md mb-2 font-medium">Topics</h4>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {topics.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={t}
                              onChange={(e) => {
                                const updated = [...topics];
                                updated[i] = e.target.value;
                                setTopics(updated);
                              }}
                              className="flex-1"
                            />
                            <Trash2
                              className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                              onClick={() =>
                                setTopics(topics.filter((_, idx) => idx !== i))
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          placeholder="Add new topic"
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                          className="flex-1"
                        />
                        <div
                          className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                          onClick={() => {
                            if (newTopic.trim() !== "") {
                              setTopics([...topics, newTopic]);
                              setNewTopic("");
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md mb-2 font-medium">Standards</h4>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {standards.map((s, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={s}
                              onChange={(e) => {
                                const updated = [...standards];
                                updated[i] = e.target.value;
                                setStandards(updated);
                              }}
                              className="flex-1"
                            />
                            <Trash2
                              className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                              onClick={() =>
                                setStandards(
                                  standards.filter((_, idx) => idx !== i),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          placeholder="Add new standard"
                          value={newStandard}
                          onChange={(e) => setNewStandard(e.target.value)}
                          className="flex-1"
                        />
                        <div
                          className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                          onClick={() => {
                            if (newStandard.trim() !== "") {
                              setStandards([...standards, newStandard]);
                              setNewStandard("");
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md mb-2 font-medium">Activities</h4>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {activities.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={t}
                              onChange={(e) => {
                                const updated = [...activities];
                                updated[i] = e.target.value;
                                setActivities(updated);
                              }}
                              className="flex-1"
                            />
                            <Trash2
                              className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                              onClick={() =>
                                setActivities(
                                  topics.filter((_, idx) => idx !== i),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          placeholder="Add new activity"
                          value={newActivity}
                          onChange={(e) => setNewActivity(e.target.value)}
                          className="flex-1"
                        />
                        <div
                          className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                          onClick={() => {
                            if (newActivity.trim() !== "") {
                              setActivities([...activities, newActivity]);
                              setNewActivity("");
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md mb-2 font-medium">Assessments</h4>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {assessments.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={t}
                              onChange={(e) => {
                                const updated = [...assessments];
                                updated[i] = e.target.value;
                                setAssessments(updated);
                              }}
                              className="flex-1"
                            />
                            <Trash2
                              className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                              onClick={() =>
                                setAssessments(
                                  assessments.filter((_, idx) => idx !== i),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          placeholder="Add new assessment"
                          value={newAssessment}
                          onChange={(e) => setNewAssessment(e.target.value)}
                          className="flex-1"
                        />
                        <div
                          className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                          onClick={() => {
                            if (newAssessment.trim() !== "") {
                              setAssessments([...topics, newAssessment]);
                              setNewAssessment("");
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md mb-2 font-medium">Materials</h4>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {materials.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={t}
                              onChange={(e) => {
                                const updated = [...materials];
                                updated[i] = e.target.value;
                                setMaterials(updated);
                              }}
                              className="flex-1"
                            />
                            <Trash2
                              className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-800"
                              onClick={() =>
                                setMaterials(
                                  topics.filter((_, idx) => idx !== i),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          placeholder="Add new material"
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                          className="flex-1"
                        />
                        <div
                          className="flex cursor-pointer items-center justify-center rounded-full bg-green-400 p-2 hover:bg-green-700"
                          onClick={() => {
                            if (newMaterial.trim() !== "") {
                              setActivities([...materials, newMaterial]);
                              setNewMaterial("");
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 rounded-xl bg-gray-50 p-4">
                    <div>
                      <h3 className="text-md mb-2 font-semibold">
                        Domain Title
                      </h3>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {data.LessonContent.Domain_Title}
                      </span>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Topics
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {(data.LessonContent.Topics || []).map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                          >
                            {t}
                            {idx < data.LessonContent.Topics.length - 1
                              ? ","
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Standards
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {(data.LessonContent.Standards || []).map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                          >
                            {s}
                            {idx < data.LessonContent.Standards.length - 1
                              ? ","
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Activities
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {(data.LessonContent.Activities || []).map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                          >
                            {s}
                            {idx < data.LessonContent.Activities.length - 1
                              ? ","
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Assessments
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {(data.LessonContent.Assessments || []).map(
                          (s, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                            >
                              {s}
                              {idx < data.LessonContent.Assessments.length - 1
                                ? ","
                                : ""}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <h6 className="text-muted-foreground mb-2 flex items-center text-lg font-medium">
                        <BookOpen className="mr-2 h-5 w-5 text-gray-500" />
                        Materials
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {(data.LessonContent.Materials || []).map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-800"
                          >
                            {s}
                            {idx < data.LessonContent.Materials.length - 1
                              ? ","
                              : ""}
                          </span>
                        ))}
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
          <h2 className="text-lg font-semibold">
            No Weekly Lesson Plans Found
          </h2>
          <p className="text-sm text-gray-400">
            No lesson plans are available for the selected lesson format.
          </p>
        </div>
      )}
    </div>
  );
};
