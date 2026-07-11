import React from "react";
import {
  ArrowUpWideNarrowIcon,
  CalendarCheckIcon,
  CalendarCog,
  CalendarCogIcon,
  ChevronDown,
  ChevronRight,
  ClockIcon,
  Flag,
  FlagIcon,
  InfoIcon,
  TrashIcon,
  UserCheckIcon,
  Users,
} from "lucide-react";
import {
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "./Tooltip";
import { formatTimeLabel } from "../../../lib/utility";
import ToggleSwitch from "./ToggleSwitch";

const CollapsibleSection = ({
  title,
  items,
  openConfigDrawer,
  isRowList = true,
  movedTaskIds = [],
  onToggleSwitch = () => {},
  taskGroupIndex,
  finalResidentTasks,
  preSelectedIds,
  renderFamilyTrackble = () => {},
  taskGroups,
  selectedTaskIds,
  onChange,
  openedTask,
  renderStatusChip,
  renderToggleSwitch,
  onToggle,
}) => {
  const handleToggleItem = (item) => {
    if (selectedTaskIds.includes(item.taskId)) {
      onChange(selectedTaskIds.filter((i) => i !== item.taskId));
    } else {
      onChange([...selectedTaskIds, item.taskId]);
    }
  };
  const handleToggleAll = (e) => {
    e.stopPropagation();
    if (
      taskGroups[title].filter((task) => selectedTaskIds.includes(task.taskId))
        .length === taskGroups[title].length
    ) {
      onChange(
        selectedTaskIds.filter(
          (item) =>
            !taskGroups[title]
              .map((task) => task.taskId)
              .filter((pre) => !preSelectedIds.includes(pre))
              .includes(item),
        ),
      );
    } else {
      onChange([...selectedTaskIds, ...items.map((i) => i.taskId)]);
    }
  };
  if (
    !isRowList &&
    taskGroups[title].filter((moveTask) =>
      movedTaskIds.includes(moveTask.taskId),
    ).length === 0
  ) {
    return null;
  }

  const statusColorMap = {
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800",
    Medium: "bg-green-100 text-green-800",
    Low: "bg-blue-100 text-blue-800",
  };
  const getStatusColor = (statusName) => {
    return statusColorMap[statusName] || "bg-gray-200 text-gray-800";
  };
  if (items.length <= 0) {
    return null;
  }
  return (
    <div
      className={`w-full rounded ${taskGroupIndex % 2 == 0 ? "bg-white" : "bg-white"} p-4 shadow-sm`}
    >
      <div
        className="flex cursor-pointer items-center justify-between select-none"
        onClick={() => onToggle(taskGroupIndex)}
      >
        <label
          className="flex cursor-pointer items-center gap-2"
          // onClick={(e) => e.stopPropagation()}
        >
          {isRowList && (
            <input
              type="checkbox"
              checked={
                taskGroups[title].filter((task) =>
                  selectedTaskIds.includes(task.taskId),
                ).length === taskGroups[title].length
              }
              onChange={handleToggleAll}
              className="accent-primary"
            />
          )}

          <span className="text-sm font-semibold">{title}</span>
        </label>

        {taskGroupIndex == openedTask ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </div>

      {/* Collapsible body */}
      {taskGroupIndex == openedTask && (
        <div className="mt-3 space-y-2">
          <hr className="text-gray-400" />
          {items.map((task, index) => {
            if (!isRowList && !movedTaskIds.includes(task.taskId)) {
              return null;
            }
            return (
              <div
                key={task.taskId}
                className="flex justify-between gap-1 rounded border border-gray-300 px-2 py-1"
              >
                <div className="flex w-full flex-col gap-2 py-1">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {
                        isRowList && (
                          <input
                            type="checkbox"
                            disabled={preSelectedIds.includes(task.taskId)}
                            checked={
                              selectedTaskIds.includes(task.taskId) ||
                              preSelectedIds.includes(task.taskId)
                            }
                            onChange={() => handleToggleItem(task)}
                            className="accent-primary"
                          />
                        )
                        //  : (
                        //   <input
                        //     type="checkbox"
                        //     checked={selectedTaskIds.includes(task.taskId)}
                        //     onChange={() => handleToggleItem(task)}
                        //     className="accent-primary"
                        //   />
                        // )
                      }

                      <span className="">
                        ({task.taskCode}) {task.title}
                      </span>
                    </div>
                    {!isRowList ? (
                      <button
                        onClick={() => openConfigDrawer(task)}
                        className="group hover:border-primary hover:bg-primary/10 hover:text-primary focus:ring-primary mt-1 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all duration-150 focus:ring-2 focus:ring-offset-1 focus:outline-none"
                      >
                        <CalendarCogIcon className="group-hover:text-primary h-4 w-4 text-gray-500 transition-colors duration-150" />
                        Configure Schedule
                      </button>
                    ) : (
                      task.taskInstruction && (
                        <Tooltip
                          content={
                            <div className="p-2">
                              <p className="font-bold">Task Instruction</p>
                              {task.taskInstruction}
                            </div>
                          }
                        >
                          <InfoIcon className="h-5 w-5 cursor-pointer text-gray-700" />
                        </Tooltip>
                      )
                    )}

                    {/* {!isRowList && (
                      <TrashIcon className="h-4 w-4 text-red-400" />
                    )} */}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div
                        className={`flex items-center gap-1 ${getStatusColor(task.taskPriority)} rounded-full px-3 py-1 text-xs`}
                      >
                        {/* <FlagIcon className="h-4 w-4 text-gray-800" /> */}
                        {task.taskPriority}
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700">
                        <ClockIcon className="h-3 w-3 text-gray-800" />
                        {formatTimeLabel(
                          task?.generalTaskDurationInMinutes || "00:00:00",
                        )}
                      </div>
                      {task?.taskExecutionGroup && (
                        <div className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700">
                          <UserCheckIcon className="h-3 w-3 text-gray-800" />
                          {task?.taskExecutionGroup}
                        </div>
                      )}
                    </div>

                    {/* <div className="flex items-center gap-3">
                    
                      
                    </div>  */}

                    {/* <div className="flex items-center gap-1">
                    <InfoIcon className="h-4 w-4 text-gray-800" />
                    {"Instructions"}
                  </div> */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {renderToggleSwitch(task.taskId)}
                      {renderStatusChip(task.taskId)}

                      {/* {!isRowList && (
                        <ToggleSwitch
                          needToCheckPermission={false}
                          isOn={true}
                          mainColor="bg-[rgba(21,128,61,0.5)]"
                          onToggle={() => onToggleSwitch(task.taskId)}
                        />
                      )} */}
                    </div>
                  </div>
                  {!isRowList && renderFamilyTrackble(task.taskId)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
