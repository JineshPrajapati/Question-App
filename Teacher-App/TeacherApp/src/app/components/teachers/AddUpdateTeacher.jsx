import { ArrowRight, ChevronRight, HomeIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Dashboard } from "../../pages/Dashboard";
import { MainLayout } from "../../layouts/MainLayout";
import NestedStepper from "../ui/NestedStepper";

import { PersonalInfoForm } from "./forms/personalInfoForm";
import { TeacherLeaveInfo } from "./forms/teacherLeaveInfo";
import { TeacherOtherInfo } from "./forms/teacherOtherInfo";
import { AcademicInfo } from "./forms/academicInfo";
import { TeacherGradeSubjectAllocation } from "./forms/TeacherGradeSubjectAllocation";
import {
  addTeacher,
  getTeacherDetail,
} from "../../../api/services/teacherService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";

import { TeacherCourses } from "./forms/teacherCourses";
import { Volunteer } from "./forms/volunteer";
import { Extracurriculars } from "./forms/extracurriculars";
import { HealthInfo } from "./forms/healthInfo";
import { toast } from "react-toastify";
import { GradeWiseStudents } from "./forms/GradeWiseStudents";

// import { TempStepper } from "./tempStepperComponent";

export const AddUpdateTeacher = () => {
  const {
    user: currentUser,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { teacherId, isEdit, isView } = location.state || {};
  const [activeStep, setActiveStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);
  const [currentTeacherId, setCurrentTeacherId] = useState(teacherId);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const {
    data: teacherData,
    isLoading: myDetailsLoading,
    refetch: refetchTeacherDetails,
    error,
  } = useQuery({
    queryKey: ["getTeacherDetails", currentTeacherId],
    queryFn: () =>
      getTeacherDetail(
        isEdit ? teacherId : currentTeacherId,
        currSelectedSchool,
        currSelectedAcademicYear,
      ),
    enabled: currentTeacherId > 0,
  });
  const steps = [
    {
      title: "Personal Information",
      subSteps: [
        {
          step: "Teacher Info",
          isOptional: false,
          component: <PersonalInfoForm isView={isView} />,
        },
        // {
        //   step: "Teacher Other Info",
        //   isOptional: false,
        //   component: <TeacherOtherInfo />,
        // },

        // Removed as per request on 5-Sep-2025
        // {
        //   step: "Academic Info",
        //   isOptional: false,
        //   component: <AcademicInfo isView={isView} />,
        // },
        {
          step: "Position",
          isOptional: false,
          component: <TeacherGradeSubjectAllocation isView={isView} />,
        },
        ...(isView
          ? [
              {
                step: "Grade Allocation",
                isOptional: false,
                component: <GradeWiseStudents isView={isView} />,
              },
            ]
          : []),
        // {
        //   step: "Leave Management",
        //   isOptional: false,
        //   component: <TeacherLeaveInfo />,
        // },
      ],
    },
  ];

  useEffect(() => {
    if (teacherData?.data?.data?.length > 0) {
      setTeacherDetails(JSON.parse(teacherData?.data?.data));
    }
  }, [teacherData, currentTeacherId, teacherId]);

  const toPascalCase = (obj) =>
    Object.entries(obj).reduce((acc, [key, value]) => {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      acc[pascalKey] = value;
      return acc;
    }, {});

  const { mutate: submitTeacherData, isPending: submitingData } = useMutation({
    mutationKey: ["teacherMutation"],
    mutationFn: (payload) => addTeacher(payload),
    onSuccess: (data) => {
      const successMessage =
        activeStep === 0 && activeSubStep === 0 && !isEdit
          ? "Teacher Detail created successfully"
          : isEdit
            ? "Teacher Detail updated successfully"
            : "Teacher Detail saved successfully";

      toast.success(successMessage);
      if (activeStep === 0 && activeSubStep === 0 && !isEdit) {
        setCurrentTeacherId(data?.data?.teacherId || 0);
      }
      refetchTeacherDetails();
      handleNextStep();
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleSubmitForm = (values, jsonKeyName) => {
    const transformed = toPascalCase(values);

    const jsonData = JSON.stringify({
      [jsonKeyName]: [transformed],
    });
    const payload = {
      teacherId: isEdit
        ? teacherId
        : activeStep === 0 && activeSubStep === 0
          ? 0
          : currentTeacherId || 0,
      jsonData,
      wizardStep: jsonKeyName == "TeacherGradeSubject" ? 3 : activeStep + 1,
      createdBy: currentUser.userId,
    };

    submitTeacherData(payload);
  };

  const handleNextStep = () => {
    if (activeSubStep < steps[activeStep].subSteps.length - 1) {
      setActiveSubStep(activeSubStep + 1);
    } else if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      setActiveSubStep(0);
    } else {
      // Handle final step submission or navigation
      navigate("/teachers"); // Navigate to teachers list or dashboard
    }
  };
  const validateErrors = () => {
    // Example validation logic
    return {};
  };

  return (
    <MainLayout
      pageTitle={
        isView
          ? "Teacher Information"
          : isEdit
            ? "Update Teacher"
            : "Add New Teacher"
      }
      showBreadCrumps={true}
      renderBreadCrumps={() => (
        <div className="flex items-center gap-1">
          <HomeIcon className="text-primary h-4 w-4" />
          <ChevronRight className="h-3 w-3" />
          <span
            onClick={() => navigate("/teachers")}
            className="hover:text-primary text-primary cursor-pointer text-sm hover:underline"
          >
            Teachers
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-sm text-gray-600">
            {isView
              ? "Teacher Information"
              : isEdit
                ? "Update Teachers"
                : "Add Teachers"}
          </span>
        </div>
      )}
    >
      <div className="h-full overflow-hidden px-6 py-4">
        <NestedStepper
          steps={steps}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setActiveSubStep={setActiveSubStep}
          handleSubmitForm={handleSubmitForm}
          validateErrors={validateErrors}
          activeSubStep={activeSubStep}
          myDetails={teacherDetails}
          teacherId={isEdit ? teacherId : currentTeacherId}
          handleNextStep={handleNextStep}
          submitingData={submitingData}
          myDetailsLoading={myDetailsLoading}
          stepperActions={() => {
            return (
              <div className="flex w-full justify-end gap-2 p-2">
                {activeSubStep > 0 && (
                  <button
                    onClick={() => setActiveSubStep(activeSubStep - 1)}
                    className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-600"
                  >
                    Previous
                  </button>
                )}
                {activeSubStep < steps[activeStep].subSteps.length - 1 && (
                  <button
                    onClick={() => setActiveSubStep(activeSubStep + 1)}
                    // disabled={!isValid}
                    className="bg-primary hover:bg-primary rounded px-4 py-2 text-white disabled:bg-gray-400"
                  >
                    Next
                  </button>
                )}
                {activeSubStep === steps[activeStep].subSteps.length - 1 && (
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary rounded px-4 py-2 text-white"
                  >
                    Save & Continue
                  </button>
                )}
                {activeStep === steps.length - 1 &&
                  activeSubStep === steps[activeStep].subSteps.length - 1 && (
                    <button className="bg-primary hover:bg-primary rounded px-4 py-2 text-white">
                      Finish
                    </button>
                  )}
              </div>
            );
          }}
        >
          {steps[activeStep].subSteps[activeSubStep].component}
        </NestedStepper>
      </div>
    </MainLayout>
  );
};
