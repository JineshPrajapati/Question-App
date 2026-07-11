import React, { useContext, useState, useMemo, useCallback } from "react";
import GradeSettings from "../components/SchoolSettings/GradeSettings";
import HolidaySettings from "../components/SchoolSettings/HolidaySettings";
import ManageCurriculum from "../components/SchoolSettings/ManageCurriculum";
import { AuthContext } from "../../contexts/authContext";
import SubjectSettings from "../components/SchoolSettings/SubjectSettings";

const Settings = () => {
  const { permissions } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(null);

  // Helper to check access
  const checkAccessOrNot = useCallback(
    (action, path) => {
      if (permissions?.[path]) {
        const modulePermission = permissions[path].split("");
        return modulePermission[action - 1] === "1";
      }
      return false;
    },
    [permissions],
  );

  // Tab definitions
  const tabs = useMemo(
    () => [
      {
        key: "grade",
        label: "Grade Management",
        path: "/grade",
        component: <GradeSettings />,
      },
      {
        key: "holiday",
        label: "School Calendar",
        path: "/holiday",
        component: <HolidaySettings />,
      },
      {
        key: "manageCurriculum",
        label: "Curriculum Management",
        path: "/lessonplanning",
        component: <ManageCurriculum />,
      },
      {
        key: "manageSubject",
        label: "Subject Management",
        path: "/subject",
        component: <SubjectSettings />,
      },
    ],
    [],
  );

  // Tabs that the user has access to
  const accessibleTabs = useMemo(
    () => tabs.filter((tab) => checkAccessOrNot(1, tab.path)),
    [tabs, checkAccessOrNot],
  );

  // Set initial tab based on permissions
  React.useEffect(() => {
    if (!activeTab && accessibleTabs.length > 0) {
      setActiveTab(accessibleTabs[0].key);
    }
  }, [accessibleTabs, activeTab]);

  return (
    <div className="flex h-full flex-col shadow-sm">
      {/* Top Tab Navigation */}
      <div className="border-b border-gray-300 p-2">
        <div className="flex space-x-4">
          {accessibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-t px-4 py-2 font-medium ${
                activeTab === tab.key
                  ? "border-primary text-primary border-b-2"
                  : "hover:text-primary text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-auto p-4">
        {accessibleTabs.map((tab) =>
          activeTab === tab.key ? (
            <div key={tab.key}>{tab.component}</div>
          ) : null,
        )}
      </div>
    </div>
  );
};

export default Settings;
