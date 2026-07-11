import React, { useState, useContext, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

import Model from "../common/Model";
import { Input } from "../ui/Input";

import {
  BookOpen,
  Pencil,
  Plus,
  Search,
  Delete,
  Trash2,
  Target,
  Package,
} from "lucide-react";
import { keysToCamelCase } from "../../../lib/utility";
import LessonCollapsible from "./LessonCollapsibleSection";

export const YearlyLessonSummary = ({ yearlyLessonPlans }) => {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [standards, setStandards] = useState([]);

  const [newTopic, setNewTopic] = useState("");
  const [newStandard, setNewStandard] = useState("");

  const [yearlyLessonPlanList, setYearlyLessonPlanList] = useState([]);

  // Parse the JSON prop safely
  useEffect(() => {
    if (yearlyLessonPlans) {
      try {
        const outerList =
          typeof yearlyLessonPlans === "string"
            ? JSON.parse(yearlyLessonPlans)
            : yearlyLessonPlans;

        const parsedList = outerList.map((plan) => ({
          ...plan,
          LessonContent: plan.LessonContent
            ? JSON.parse(plan.LessonContent)
            : {},
        }));

        setYearlyLessonPlanList(parsedList);
      } catch (err) {
        console.error("Invalid JSON", err);
      }
    }
  }, [yearlyLessonPlans]);

  const handleSave = () => {
    // console.log("Updated Topics:", topics);
    // console.log("Updated Standards:", standards);
    setOpen(false);
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border-gray-300 py-2">
      {yearlyLessonPlanList.length > 0 ? (
        yearlyLessonPlanList.map((data, idx) => (
          <LessonCollapsible
            header={
              <div className="flex flex-col items-start justify-between gap-1">
                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600 md:text-base">
                  <span className="font-semibold text-gray-600">
                    Grading Period:{" "}
                    <span className="font-medium">
                      {data.LessonContent.Index}
                    </span>
                  </span>

                  <span>
                    Weeks:{" "}
                    <span className="font-medium">
                      {data.LessonContent.Weeks_Consider}
                    </span>
                  </span>

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
                </div>
              </div>
            }
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);

                  setTopics(data.LessonContent.Topics || []);

                  setStandards(data.LessonContent.Standards || []);
                }}
                className="flex items-center gap-2 self-start md:self-center"
              >
                <Pencil size={16} /> Edit
              </Button>
            }
            defaultOpen={idx == 0 ? true : false}
          >
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
                      {idx < data.LessonContent.Topics.length - 1 ? "," : ""}
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
                      {idx < data.LessonContent.Standards.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </LessonCollapsible>
        ))
      ) : (
        <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
          <BookOpen className="mb-3 h-12 w-12 text-gray-400" />
          <h2 className="text-lg font-semibold">
            No Yearly Lesson Plans Found
          </h2>
          <p className="text-sm text-gray-400">
            No lesson plans are available for the selected lesson format.
          </p>
        </div>
      )}
    </div>
  );
};
