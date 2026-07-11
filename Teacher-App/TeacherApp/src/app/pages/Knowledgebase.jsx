import Drawer from "../components/common/Drawer";
import { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { KnowledgebaseForm } from "../components/knowledgebase/knowledgeBaseForm";
import { KnowledgebaseList } from "../components/knowledgebase/knowledgebaseList";
import { getKnowledgebaseList } from "../../api/services/knowledgebaseService";
import { AuthContext } from "../../contexts/authContext";
import PermissionGuard from "../wrappers/PermissionGaurd";
import { useLocation } from "react-router";
import { MainLayout } from "../layouts/MainLayout";

export const Knowledgebase = () => {
  const location = useLocation();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const { currSelectedSchool, currSelectedAcademicYear, user } =
    useContext(AuthContext);
  const [tableConfig, setTableConfig] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
    activeOnly: -1,
    sortBy: "KnowledgebaseId",
    sortDirection: "ASC",
    schoolId: currSelectedSchool,
    academicYearId: currSelectedAcademicYear,
    userId: user.userId,
    gradeId: null,
  });

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["knowledgebase", [tableConfig, currSelectedAcademicYear]],
    queryFn: () => getKnowledgebaseList(tableConfig),
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
      pageTitle={"Knowledgebase"}
      actionButton={() => (
        <div className="flex gap-4">
          <PermissionGuard path={location.pathname} action={2}>
            <button
              className="bg-primary hover:bg-primary cursor-pointer rounded px-2 py-2 text-white shadow-sm sm:px-4"
              onClick={() => setIsAddDrawerOpen(true)}
            >
              Add Knowledgebase
            </button>
          </PermissionGuard>
        </div>
      )}
    >
      <KnowledgebaseList
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
        title="Add Knowledgebase"
      >
        <KnowledgebaseForm
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

export default Knowledgebase;
