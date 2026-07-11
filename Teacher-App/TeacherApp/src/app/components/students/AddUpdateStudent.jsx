import { ArrowRight, ChevronRight, HomeIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Dashboard } from "../../pages/Dashboard";
import { MainLayout } from "../../layouts/MainLayout";
import NestedStepper from "../ui/NestedStepper";

import { PersonalInfoForm } from "./forms/personalInfoForm";
import { AcademicInfo } from "./forms/academicInfo";
import {
  addStudent,
  getStudentDetail,
} from "../../../api/services/studentService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";

import { StudentCourses } from "./forms/studentCourses";
import { PreviousEducation } from "./forms/previousEducation";
import { StudentHealthInfo } from "./forms/studentHealthInfo";
import { toast } from "react-toastify";
// import { TempStepper } from "./tempStepperComponent";

export const AddUpdateStudent = () => {
  const {
    user: currentUser,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { studentId, isEdit, isView } = location.state || {};
  const [activeStep, setActiveStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);
  const [currentStudentId, setCurrentStudentId] = useState(studentId);
  const [studentDetails, setStudentDetails] = useState(null);
  const {
    data: studentData,
    isLoading: myDetailsLoading,
    refetch: refetchStudentDetails,
    error,
  } = useQuery({
    queryKey: ["getStudentDetails", currentStudentId, currSelectedAcademicYear],
    queryFn: () =>
      getStudentDetail(
        isEdit ? studentId : currentStudentId,
        currSelectedAcademicYear,
      ),
    enabled: currentStudentId > 0, // Only fetch if currentStudentId is set
  });

  const steps = [
    {
      title: "Personal Information",
      subSteps: [
        {
          step: "Student Info",
          isOptional: false,
          component: <PersonalInfoForm isView={isView} />,
        },
        {
          step: " Contact Information",
          isOptional: false,
          component: <AcademicInfo isView={isView} />,
        },
      ],
    },
    // {
    //   title: "Academic Information",
    //   subSteps: [
    //     { step: "Academic Info", isOptional: false, component: <AcademicInfo /> },
    //     // {
    //     //   step: "Student Courses",
    //     //   isOptional: false,
    //     //   component: <StudentCourses />,
    //     // },
    //     // {
    //     //   step: "Previous Education",
    //     //   isOptional: false,
    //     //   component: <PreviousEducation />,
    //     // },
    //   ],
    // },
    // {
    //   title: "Student Health Information",

    //   subSteps: [
    //     {
    //       step: "Health Info",
    //       isOptional: false,
    //       component: <StudentHealthInfo />,
    //     },
    //   ],
    // },
  ];

  useEffect(() => {
    if (studentData?.data?.data?.length > 0) {
      setStudentDetails(JSON.parse(studentData?.data?.data));
    }
  }, [studentData, currentStudentId, studentId]);
  const toPascalCase = (obj) =>
    Object.entries(obj).reduce((acc, [key, value]) => {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      acc[pascalKey] = value;
      return acc;
    }, {});
  const { mutate: submitStudentData, isPending: submitingData } = useMutation({
    mutationKey: ["studentMutation"],

    mutationFn: (payload) => addStudent(payload),
    onSuccess: (data) => {
      const successMessage =
        activeStep === 0 && activeSubStep === 0 && !isEdit
          ? "Student Detail created successfully"
          : isEdit
            ? "Student Detail updated successfully"
            : "Student Detail saved successfully";

      toast.success(successMessage);

      if (activeStep == 0 && activeSubStep == 0 && !isEdit) {
        setCurrentStudentId(data?.data?.studentId || 0);
      }
      refetchStudentDetails();
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
      studentId: isEdit
        ? studentId
        : activeStep === 0 && activeSubStep === 0
          ? 0
          : currentStudentId || 0,
      jsonData,
      wizardStep: activeStep + 1,
      createdBy: currentUser.userId,
      schoolId: currSelectedSchool,
      academicYearId: currSelectedAcademicYear,
    };
    submitStudentData(payload);
  };

  const handleNextStep = () => {
    if (activeSubStep < steps[activeStep].subSteps.length - 1) {
      setActiveSubStep(activeSubStep + 1);
    } else if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      setActiveSubStep(0);
    } else {
      // Handle final step submission or navigation
      navigate("/students");
    }
  };
  const validateErrors = () => {
    // Example validation logic
    return {};
  };
  const navigation = currentUser.userTypeId == 6 ? "/mystudents" : "/students";
  const navigationName =
    currentUser.userTypeId == 6 ? "My Students" : "Students";
  return (
    <MainLayout
      pageTitle={
        isView
          ? "Student Information"
          : isEdit
            ? "Update Student"
            : "Add New Student"
      }
      showBreadCrumps={true}
      renderBreadCrumps={
        () => (
          <div className="flex items-center gap-1">
            <HomeIcon className="text-primary h-4 w-4" />
            <ChevronRight className="h-3 w-3" />
            <span
              onClick={() => navigate(navigation)}
              className="hover:text-primary text-primary cursor-pointer text-sm hover:underline"
            >
              {navigationName}
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-sm text-gray-600">
              {isView
                ? "Student Information"
                : isEdit
                  ? "Update Students"
                  : "Add Students"}
            </span>
          </div>
        )
        // )
      }
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
          myDetails={studentDetails}
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
