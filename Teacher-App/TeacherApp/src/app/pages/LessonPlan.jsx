import React, { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { LessonPlanList } from "../components/lessonPlan/LessonPlanList";
import { getLessonPlanList } from "../../api/services/lessonPlanService";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { AuthContext } from "../../contexts/authContext";
import { Plus } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { useNavigate } from "react-router";

export const LessonPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);
  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "lessonPlanId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicYearId: currSelectedAcademicYear,
    userId: user.userId,
    gradeId: null,
  });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["lessonPlans", [tableConfig, currSelectedAcademicYear]],
    queryFn: () => getLessonPlanList(tableConfig),
    keepPreviousData: true,
  });

  useEffect(() => {
    setTableConfig((prevConfig) => ({
      ...prevConfig,
      schoolId: currSelectedSchool,
      academicYearId: currSelectedAcademicYear,
      pageNumber: 1,
    }));
  }, [currSelectedSchool, currSelectedAcademicYear]);

  return (
    <MainLayout
      pageTitle={"Lesson Plans"}
      actionButton={() => (
        <div className="flex gap-4">
          <PermissionGuard path={location.pathname} action={2}>
            <button
              className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-1 rounded px-4 py-2 text-white shadow-sm"
              onClick={() => {
                navigate("/lessonplan/Create", {
                  state: {
                    lessonPlanId: 0,
                    isEdit: false,
                  },
                });
              }}
            >
              <Plus className="h-4 w-4 text-white" />
              Create Lesson Plan
            </button>
          </PermissionGuard>
        </div>
      )}
    >
      <LessonPlanList
        tableConfig={tableConfig}
        setTableConfig={setTableConfig}
        data={data}
        isLoading={isLoading}
        refetch={refetch}
        onRefresh={refetch}
      />
    </MainLayout>
  );
};
