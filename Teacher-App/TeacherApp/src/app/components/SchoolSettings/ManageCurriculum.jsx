import Drawer from "../common/Drawer";
import { useState, useContext, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import { MainLayout } from "../../layouts/MainLayout";
import { KnowledgebaseForm } from "../knowledgebase/knowledgeBaseForm";
import { ManageCurriculumList } from "./ManageCurriculumList";
import { AuthContext } from "../../../contexts/authContext";
import { getCurriculumList } from "../../../api/services/curriculumService";
import { ManageCurriculumForm } from "./ManageCurriculumForm";
import PermissionGuard from "../../wrappers/PermissionGaurd";

const ManageCurriculum = () => {
  const location = useLocation();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const { currSelectedSchool, currSelectedAcademicYear } =
    useContext(AuthContext);
  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "LessonPlanFileId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicYearId: currSelectedAcademicYear,
    gradeId: null,
  });
  // const memoizedConfig = useMemo(() => tableConfig, [tableConfig]); // or based on inner fields

  const { data, isLoading, isFetching, isRefetching, refetch } = useQuery({
    queryKey: [
      "lessonPlanning",
      [tableConfig, currSelectedAcademicYear, currSelectedSchool],
    ],
      queryFn: () => getCurriculumList(tableConfig),
    cacheTime: 0,
    staleTime: 0,
    keepPreviousData: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
      pageTitle={"Manage Curriculum"}
      actionButton={() => (
        <PermissionGuard path={"/lessonplanning"} action={2}>
          <div className="flex gap-4">
            <button
              className="bg-primary hover:bg-primary cursor-pointer rounded px-2 py-2 text-white shadow-sm sm:px-4"
              onClick={() => setIsAddDrawerOpen(true)}
            >
              Add Academic Curriculum
            </button>
          </div>
        </PermissionGuard>
      )}
    >
      <ManageCurriculumList
        data={data}
        isLoading={isLoading}
        isRefetching={isRefetching}
        refetch={refetch}
        tableConfig={tableConfig}
        setTableConfig={setTableConfig}
      />

      <Drawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Add Academic Curriculum"
      >
        <ManageCurriculumForm
          isSubmitting={false}
          task={null}
          onClose={() => {
            setIsAddDrawerOpen(false);
          }}
          onSuccess={() => {
            setIsAddDrawerOpen(false);
            refetch();
          }}
        />
      </Drawer>
    </MainLayout>
  );
};
export default ManageCurriculum;
