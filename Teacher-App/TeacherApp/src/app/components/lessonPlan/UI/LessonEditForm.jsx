import { useContext, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AuthContext } from "../../../../contexts/authContext";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    updateLessonPlan
} from "../../../../api/services/lessonPlanService";

const formConfig = {
  daily: [
    { key: "Lesson_Title", label: "Lesson Title", type: "text" },
    { key: "Objectives", label: "Objectives", type: "list" },
    {
      key: "Materials_Resources_Needed",
      label: "Materials / Resources Needed",
      type: "list",
    },
    { key: "Input", label: "Input", type: "text" },
    { key: "Model", label: "Model", type: "text" },
    {
      key: "Check_for_Understanding",
      label: "Check for Understanding",
      type: "text",
    },
    { key: "Guided_Practice", label: "Guided Practice", type: "text" },
    { key: "Closure", label: "Closure", type: "text" },
    {
      key: "Independent_Practice",
      label: "Independent Practice",
      type: "text",
    },
  ],
  weekly: [
    { key: "Domain_Title", label: "Domain Title", type: "text" },
    { key: "Topics", label: "Topics", type: "list" },
    { key: "Standards", label: "Standards", type: "list" },
    { key: "Activities", label: "Activities", type: "list" },
    { key: "Assessments", label: "Assessments", type: "list" },
  ],
  monthly: [
    { key: "Domain_Title", label: "Domain Title", type: "text" },
    { key: "Topics", label: "Topics", type: "list" },
    { key: "Standards", label: "Standards", type: "list" },
    { key: "Activities", label: "Activities", type: "list" },
    { key: "Assessments", label: "Assessments", type: "list" },
  ],
  yearly: [
    { key: "Domain_Title", label: "Domain Title", type: "text" },
    { key: "Topics", label: "Topics", type: "list" },
    { key: "Standards", label: "Standards", type: "list" },
  ],
};

export default function LessonEditForm({
  formatType,
  editableState = null,
  //   onSave,
  onCancel,
}) {
  const fields = formConfig[formatType];
  const {
    user: currentUser,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const [formState, setFormState] = useState(null);
  const [newItem, setNewItem] = useState({});
  // console.log("formState", formState);
  useEffect(() => {
    let newState = {};
    newState[formatType] = editableState;
    setFormState(newState);
  }, [editableState, formatType]);


    const mutation = useMutation({
        mutationFn: updateLessonPlan,
        onSuccess: (data) => {
            toast.success("Lesson plan updated successfully");   
            onCancel();
        },
        onError: (error) => {
            toast.error("Lesson plan update failed");      
            onCancel();
        },
    });

  const saveData = () => {
    if (!formState) return;

    const currentData = formState[formatType] || {};
    const { LessonContent = {}, lists = {} } = currentData;

    const validListKeys = formConfig[formatType]
      .filter((field) => field.type === "list")
      .map((field) => field.key);

    const filteredLists = {};
    validListKeys.forEach((key) => {
      if (lists[key]) {
        filteredLists[key] = lists[key];
      }
    });

    // Final merged object
    const finalData = {
      ...LessonContent,
      ...filteredLists,
    };


      const payload = {         
        academicYearId: parseInt(currSelectedAcademicYear),
      schoolId: currSelectedSchool,
      userIdentityKey: currentUser.userId || "",
      lessonFormat: formatType,
      lessonPlanId:
        formatType === "yearly"
              ? parseInt(finalData.YearlyLessonPlanId)
          : formatType === "monthly"
                  ? parseInt(finalData.MonthlyLessonPlanId)
            : formatType === "weekly"
                      ? parseInt(finalData.WeeklyLessonPlanId)
                      : parseInt(finalData.DailyLessonPlanId),

        yearlyLessonObj: formatType === "yearly" ? finalData : null,
        monthlyLessonObj: formatType === "monthly" ? finalData : null,
        weeklyLessonObj: formatType === "weekly" ? finalData : null,
        dailyLessonObj: formatType === "daily" ? finalData : null,
    };

  
   
          try {
              mutation.mutateAsync(payload);
      } catch (error) { }


  };

  const handleTextChange = (formatType, key, value) => {
    setFormState((prev) => ({
      ...prev,
      [formatType]: {
        ...prev[formatType],
        LessonContent: {
          ...prev[formatType].LessonContent,
          [key]: value,
        },
        lists: { ...prev[formatType].lists },
      },
    }));
  };

  const handleListChange = (formatType, key, index, value) => {
    setFormState((prev) => {
      const updated = [...(prev[formatType].lists[key] || [])];
      updated[index] = value;
      return {
        ...prev,
        [formatType]: {
          ...prev[formatType],
          lists: { ...prev[formatType].lists, [key]: updated },
          LessonContent: { ...prev[formatType].LessonContent },
        },
      };
    });
  };

  const handleAddListItem = (formatType, key) => {
    if (newItem[key]?.trim()) {
      setFormState((prev) => ({
        ...prev,
        [formatType]: {
          ...prev[formatType],
          lists: {
            ...prev[formatType].lists,
            [key]: [...(prev[formatType].lists[key] || []), newItem[key]],
          },
          LessonContent: { ...prev[formatType].LessonContent },
        },
      }));
      setNewItem((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleRemoveListItem = (formatType, key, index) => {
    setFormState((prev) => ({
      ...prev,
      [formatType]: {
        ...prev[formatType],
        lists: {
          ...prev[formatType].lists,
          [key]: prev[formatType].lists[key].filter((_, i) => i !== index),
        },
        LessonContent: { ...prev[formatType].LessonContent },
      },
    }));
  };

  const currentData = formState ? formState[formatType] : editableState;

  return (
    <div className="relative w-full rounded-2xl bg-white">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white px-4 py-3 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700">Edit Lesson</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => saveData()}
            className="bg-primary hover:bg-primary rounded-lg px-4 py-2 text-sm text-white"
          >
            Save
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-4 px-4 py-6">
        {fields &&
          fields.length > 0 &&
          fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label
                htmlFor={field.key}
                className="block text-left text-sm font-medium text-gray-700"
              >
                {field.label}
              </label>

              {field.type === "text" && (
                <input
                  id={field.key}
                  type="text"
                  value={currentData.LessonContent[field.key] || ""}
                  onChange={(e) =>
                    handleTextChange(formatType, field.key, e.target.value)
                  }
                  className="focus:border-primary w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring focus:ring-blue-200"
                />
              )}

              {field.type === "list" && (
                <>
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
                    {currentData.lists[field.key]?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            handleListChange(
                              formatType,
                              field.key,
                              i,
                              e.target.value,
                            )
                          }
                          className="focus:border-primary flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring focus:ring-blue-200"
                        />
                        <button
                          type="button"
                          className="rounded-lg p-1 text-red-500 hover:bg-red-100"
                          onClick={() =>
                            handleRemoveListItem(formatType, field.key, i)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Add new ${field.label.toLowerCase()}`}
                      value={newItem[field.key] || ""}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="focus:border-primary flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring focus:ring-blue-200"
                    />
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-lg bg-green-500 p-2 text-white hover:bg-green-600"
                      onClick={() => handleAddListItem(formatType, field.key)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
