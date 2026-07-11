import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import {
  TextField,
  MenuItem,
} from "@mui/material";
import { Card } from "../ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";
import { format, set } from "date-fns";
import jsPDF from "jspdf";
import { CalendarDays, Calendar, GraduationCap, BookOpen, Users, Search, Plus, Clock, User } from "lucide-react";
import { MainLayout } from "../../layouts/MainLayout";
import {
  getLessonPlans,
  getGradeSubject,
  getWeekNumberForLessonPlan,
  generateLessonPlan,
  getAvailableLessonPlans,
} from "../../../api/services/lessonPlanService";
import { getTeachers} from "../../../api/services/teacherService"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { toast } from "react-toastify";
import Model from "../common/Model";
import LessonPlanContainer from "./LessonPlanContainer";
import AccordionStepper from "../common/AccordionStepper";
import AvailLessonSection from "./UI/AvailLessonSection";

export const LessonPlanCalendar = () => {
  const today = new Date().toISOString().split("T")[0];
  const {
    user: currentUser,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [lessonFormat, setLessonFormat] = useState("yearly");
  const [selectedLessonPlanId, setSelectedLessonPlanId] = useState(null);
  const [lessonPlanEndData, setLessonPlanEndData] = useState(null); 
  const [periods, setPeriods] = useState([]);
   const [lessonPlanTeachersList, setLessonPlanTeachersList] = useState([]);
  const [generatingLessonPlan, setGeneratingLessonPlan] = useState(false);
  const [grades, setGrades] = useState([]);
   const [subjects, setSubjects] = useState([]);
  const [teachers, seTeachers] = useState([]);
  const [newPlanSubjects, setNewPlanSubjects] = useState([]);
  const [gradeSubjectList, setGradeSubjectList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [calendarTitle, setCalendarTitle] = useState(
    format(new Date(), "MMMM yyyy"),
  );
  const [formData, setFormData] = useState({
    gradeId: 0,
    schoolId: parseInt(currSelectedSchool || ""),
    subjectId: 0,
    teacherId: 0,
    academicYearId: parseInt(currSelectedAcademicYear || ""),
    userIdentityKey: currentUser.userId || "",
    startDate: null,
    endDate: today,
    searchTerm: "",
    weekNumber: "",
    newPlanStartDate: "",
    newPlanEndDate: "",
    newPlanGradeId: "",
    newPlanSubjectId: "",
    newPlanTeacherId: "",
    newPlanWeekDetail: {},
    userId: currentUser.userId || "",
  });
  const [isCreatPlanOpen, setIsCreatPlanOpen] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const { data: gradeSubjectData, isLoading: gradeSubjectDataLoading } =
    useQuery({
      queryKey: [
        "gradeSubjectData",
        currSelectedSchool,
        currSelectedAcademicYear,
      ],
      queryFn: () =>
        getGradeSubject({
          academicYearId: parseInt(currSelectedAcademicYear),
          gradeId: 0,
          UserIdentityKey: currentUser.userId || "",
          schoolId: parseInt(currSelectedSchool || 0),
        }),
    });


    const { data: teachersList, isLoading: teachersListLoading } =
        useQuery({
            queryKey: [
                "teachersList",
                currSelectedSchool,
                currSelectedAcademicYear,
            ],
            queryFn: () =>
                getTeachers({
                    academicYearId: parseInt(currSelectedAcademicYear),
                    gradeId: 0,
                    subjectId: 0,
                    userIdentityKey: currentUser.userId || "",
                    schoolId: parseInt(currSelectedSchool || 0),
                }),
        });


  const {
    data: availableLessonPlans,
    isLoading: availableLessonPlansLoading,
    refetch: handleAvailableLessonPlans,
  } = useQuery({
    queryKey: [
      "availableLessonPlanData",
      currSelectedSchool,
      currSelectedAcademicYear,
      formData.gradeId,
      formData.subjectId,
      formData.teacherId,
      formData.endDate,
      formData.UserIdentityKey,
    ],
      queryFn: () =>

      getAvailableLessonPlans({
        academicYearId: parseInt(currSelectedAcademicYear),
        schoolId: parseInt(currSelectedSchool),
        lessonPlanCreatedBy: parseInt(formData.teacherId),
        userId: currentUser.userId || "",
        endDate: formData.endDate || "",
        gradeId: parseInt(formData.gradeId),
        subjectId: parseInt(formData.subjectId),
        UserIdentityKey: currentUser.userId || "",
      }),
  });

  const {
    data: lessonPlanData,
    isLoading: lessonPlanDataLoading,
    refetch: handleLessonPlanSearch,
  } = useQuery({
    queryKey: [
      "lessonPlanData",
      currSelectedSchool,
      currSelectedAcademicYear,
      formData.gradeId,
      formData.subjectId,
      formData.teacherId,
      formData.endDate,
      formData.UserIdentityKey,
    ],
    queryFn: () =>
      getLessonPlans({
        academicYearId: parseInt(currSelectedAcademicYear),
        schoolId: parseInt(currSelectedSchool),
        userId: currentUser.userId || "",
         endDate: lessonFormat == "yearly" ? null : formData.endDate || null,
         lessonPlanCreatedBy: parseInt(formData.teacherId),
        gradeId: parseInt(formData.gradeId),
        subjectId: parseInt(formData.subjectId),
        UserIdentityKey: currentUser.userId || "",
      }),
    enabled: false,
  });

  const fetchLessonPlans = async (customParams) => {
    const response = await queryClient.fetchQuery({
      queryKey: ["lessonPlanData", customParams],
      queryFn: () =>
        getLessonPlans({
          academicYearId: parseInt(currSelectedAcademicYear),
          schoolId: parseInt(currSelectedSchool),
          userId: currentUser.userId || "",
          endDate: customParams.endDate || "",
          // gradeId: parseInt(customParams.gradeId),
          // subjectId: parseInt(customParams.subjectId),
          UserIdentityKey: currentUser.userId || "",
        }),
    });


    return response;
  };
  const {
    data: periodListData,
    isLoading: periodListDataLoading,
    refetch: refetchPeriodList,
  } = useQuery({
    queryKey: [
      "periodListData",
      currSelectedSchool,
      currSelectedAcademicYear,
      formData.newPlanGradeId,
      formData.newPlanSubjectId,
    ],
    queryFn: () =>
      getWeekNumberForLessonPlan({
        academicYearId: parseInt(currSelectedAcademicYear),
        schoolId: parseInt(currSelectedSchool),
        userId: currentUser.userId || "",
        gradeId: parseInt(formData.newPlanGradeId),
        subjectId: parseInt(formData.newPlanSubjectId),
        UserIdentityKey: currentUser.userId || "",
      }),
    enabled: !!formData.newPlanSubjectId,
  });

  useEffect(() => {
    if (gradeSubjectData?.isSuccess) {
      const gradeSubjects = gradeSubjectData.data;
      const uniqueGrades = Array.from(
        new Map(
          gradeSubjects.map((item) => [
            item.gradeId,
            {
              gradeId: item.gradeId,
              gradeName: item.gradeName,
              gradeStartDate: item.gradeStartDate,
              gradeEndDate: item.gradeEndDate,
            },
          ]),
        ).values(),
        );

        const gradesWithAllOption = [
            {
                gradeId: 0,
                gradeName: "-- All Grades --",
                gradeStartDate: null,
                gradeEndDate: null,
            },
            ...uniqueGrades,
        ];

        setGrades(gradesWithAllOption);

        /*        setGrades(uniqueGrades);*/

        const subjectWithAllOption = [
            {
                subjectId: 0,
                subject: "-- Select Grade --"
            }
        ];


        setSubjects(subjectWithAllOption);

      setGradeSubjectList(gradeSubjects);
    }

      if (teachersList?.isSuccess) {  

          const teacherWithAllOption = [
              {
                  userId: 0,
                  userName: "-- All Teachers --"
              },
              ...teachersList.data||[],
          ];
          seTeachers(teacherWithAllOption);
    }
  }, [gradeSubjectData, teachersList]);

  const onSearchClick = async () => {
    const { data } = await handleLessonPlanSearch();
    setLessonPlans(data?.data || []);
  };

  const getLessonPlansList = async (lessonObj) => {
   
    setActiveStep(1);

    setLessonFormat("yearly");
    setSelectedLessonPlanId(lessonObj.lessonPlanId || null);
    setLessonPlanEndData(lessonObj.endDate || null);
  };

  const {
    data: lessonPlans,
    isLoading: loadingLessonplanData,
    isError,
  } = useQuery({
    queryKey: [
      "lessonPlanData",
      selectedLessonPlanId,
      lessonFormat,
      lessonPlanEndData,
    ],
    queryFn: () =>
      getLessonPlans({
        academicYearId: Number(currSelectedAcademicYear),
        schoolId: Number(currSelectedSchool),
        userId: currentUser.userId || "",
        endDate: lessonFormat == "yearly" ? null : lessonPlanEndData || null,
        lessonFormat: lessonFormat || "yearly",
        lessonPlanId: selectedLessonPlanId,
        UserIdentityKey: currentUser.userId || "",
      }),
    enabled: Boolean(selectedLessonPlanId && lessonFormat && lessonPlanEndData),
  });

  useEffect(() => {
    if (isError) toast.error("No Lesson Plans found. Something went wrong!");
  }, [isError]);
  

  const mutation = useMutation({
    mutationFn: generateLessonPlan,
    onSuccess: (data) => {
      toast.success("Lesson Plan added successfully!");
      setIsCreatPlanOpen(false);
   
    handleAvailableLessonPlans();
     

      setFormData((prev) => ({
        ...prev,
        gradeId: 0,
        subjectId: 0,
        endDate: today,
      }));

        setisLoading(false);

    },
    onError: (error) => {
      toast.error(error.message);
      setisLoading(false);
      setIsCreatPlanOpen(false);
    },
  });

  const editLessonPlanContent = (content) => {
    setShowLessonEditor(true);
  };

  const handleLessonPlan = (data) => {
    setisLoading(true);
    setGeneratingLessonPlan(true);
    const values = {
      academicYearId: parseInt(currSelectedAcademicYear || 0),
      schoolId: parseInt(currSelectedSchool),
      gradeId: formData.newPlanGradeId,
      startDate: formData.newPlanWeekDetail[0].weekStartDate,
      endDate: formData.newPlanWeekDetail[0].weekEndDate,
      subjectId: formData.newPlanSubjectId,
      lessonPlanCreatedBy: parseInt(formData.newPlanTeacherId),
      weekNumber: formData.newPlanWeekDetail[0].weekNumber,
      userIdentityKey: currentUser.userId || "",
      userId: currentUser.userId || "",
    };
    handleGeneratePlan(values);

    handleCreateLessonPlanModel(false);
  };

  const handleCreateLessonPlanModel = (isOpen) => {
    setFormData((prev) => ({
      ...prev,
      weekNumber: "",
      newPlanSubjectId: "",
   newPlanGradeId: "",
     newPlanTeacherId:""
    }));
    setIsCreatPlanOpen(isOpen);
  };

  const handleGeneratePlan = (values) => {
    try {
      mutation.mutateAsync(values);
    } catch (error) {}
  };

  useEffect(() => {
    if (periodListData?.isSuccess) {
        setPeriods(periodListData.data || []);
        setLessonPlanTeachersList(periodListData.data || []);
    //  setWeekList(periodListData.data || []);
    }
  }, [periodListData]);

  const handleGrade = (e) => {
    const gradeId = parseInt(e.target.value || 0);
    const selectedGrade = grades.find((g) => g.gradeId === gradeId);
    setFormData((prev) => ({
      ...prev,
      gradeId,
      gradeStartDate: selectedGrade?.gradeStartDate || null,
      gradeEndDate: selectedGrade?.gradeEndDate || null,
    }));

    if (gradeSubjectList) {
      const filteredSubjects = gradeSubjectList
        .filter((item) => item.gradeId === gradeId)
        .map(({ subjectId, subject }) => ({ subjectId, subject }));

      const uniqueSubjects = Array.from(
        new Map(
          filteredSubjects.map((item) => [item.subjectId, item]),
        ).values(),
      );

        const subjectWithAllOption = [
            {
                subjectId: 0,
                subject: "-- All Subjects --"               
            },
            ...uniqueSubjects,
        ];
       

        setSubjects(subjectWithAllOption);
    }
  };
  const exportPDF = () => {
    if (!selectedLesson) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Lesson: ${selectedLesson.title}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Grade: ${selectedLesson.grade}`, 10, 30);
    doc.text(`Subject: ${selectedLesson.subject}`, 10, 40);
    doc.text(`Teacher: ${selectedLesson.teacher}`, 10, 50);
    doc.text(`Date: ${selectedLesson.start}`, 10, 60);
    doc.text("Description:", 10, 70);
    doc.text(selectedLesson.description, 10, 80, { maxWidth: 180 });
    doc.save(`${selectedLesson.title}.pdf`);
  };

    const handleGradeNewPlan = (e) => {
 
      const gradeId = parseInt(e|| 0);
      setFormData((prev) => ({
          ...prev,
          newPlanGradeId: gradeId
      }));

    if (gradeSubjectList) {
      const filteredSubjects = gradeSubjectList
        .filter((item) => item.gradeId === gradeId && item.lessonPlanFileId > 0)
        .map(({ subjectId, subject }) => ({ subjectId, subject }));

      const uniqueSubjects = Array.from(
        new Map(
          filteredSubjects.map((item) => [item.subjectId, item]),
        ).values(),
      );

      setNewPlanSubjects(uniqueSubjects);
    }
  };

    const handleSubjectNewPlan = (e) => {
        const subjectId = parseInt(e || 0);
        setFormData((prev) => ({
            ...prev,
            newPlanSubjectId: subjectId
        }));
     
    };

    const handleTeacherChange = (e) => {
        const teacherId = parseInt(e.target.value || 0);   
        setFormData((prev) => ({
            ...prev,        
            teacherId: teacherId, 
        }));

       
    };


    

    const handleTeacherNewPlan = (e) => {
        const teacherId = parseInt(e || 0);

        setFormData((prev) => ({
            ...prev,
            newPlanTeacherId: teacherId
        }));
  

        if (lessonPlanTeachersList) {
          
            const weekDetail = lessonPlanTeachersList
                .filter((item) => item.userId === teacherId)
                .map(({ weekNumber, weekStartDate, weekEndDate, countLessonPlans, maxAvailableDate }) => ({ weekNumber, weekStartDate, weekEndDate,countLessonPlans, maxAvailableDate }));

            setFormData((prev) => ({
                ...prev,
                newPlanWeekDetail: weekDetail
            }));
     
        }

    };

    

  const isNewPlanFormValid =
      formData.newPlanGradeId && formData.newPlanSubjectId && formData.newPlanTeacherId > 0 && formData.newPlanWeekDetail[0]!=null;

  const isSearchValid = formData.gradeId > 0 ? true : false;

  // if (lessonPlanDataLoading || isLoading)
  //   return <div>Searching available Lesson Plans...</div>;
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    {
      title: "1. Choose Lesson Plan",
      content: (
        <div className="w-full rounded-lg border-gray-300 bg-white">
          <div className="mb-4 flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 shadow-md">
            <div className="flex w-full flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="w-full sm:w-40">
                <TextField
                  select
                  label="Grade"
                  id="gradeId"
                  name="gradeId"
                  fullWidth
                  size="small"
                  value={formData.gradeId || 0}
                  onChange={handleGrade}
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade.gradeId} value={grade.gradeId}>
                      {grade.gradeName}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div className="w-full sm:w-48">
                <TextField
                  select
                  label="Subject"
                  id="subjectId"
                  name="subjectId"
                  fullWidth
                  size="small"
                  value={formData.subjectId || 0 }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subjectId: e.target.value,
                    }))
                  }
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.subjectId} value={subject.subjectId}>
                      {subject.subject}
                    </MenuItem>
                  ))}
                </TextField>
                      </div>

                      <div className="w-full sm:w-48">
                          <TextField
                              select
                              label="Teacher"
                              id="teacherId"
                              name="teacherId"
                              fullWidth
                              size="small"
                              value={formData.teacherId || 0}
                              onChange={handleTeacherChange}
                          >
                              {teachers.map((teacher) => (                             
                                  <MenuItem key={teacher.userId} value={teacher.userId}>
                                      {teacher.userName}
                                  </MenuItem>
                              ))}
                          </TextField>
                      </div>

              <div className="w-full sm:w-48">
                <TextField
                  label="Date"
                  id="endDate"
                  name="endDate"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* <button
                disabled={!isSearchValid}
                className="bg-primary cursior-pointer flex cursor-pointer items-center gap-1.5 rounded px-4 py-2 text-white disabled:opacity-50"
                onClick={() => onSearchClick()}
              >
                <Search size={18} />
                <span> &nbsp;Search</span>
              </button> */}
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-[#00446d]" />
              </div>
              <p className="mt-2 text-base font-medium text-gray-700">
                Generating Lesson Plan...
              </p>
              <p className="text-sm text-gray-500">
                This may take a few seconds
              </p>
            </div>
          ) : availableLessonPlans?.data?.length > 0 ? (
            <AvailLessonSection
              setFormData={setFormData}
              getLessonPlansList={getLessonPlansList}
              activeStep={activeStep}
              data={availableLessonPlans.data}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
              {availableLessonPlansLoading ? (
                <LoadingSpinner fullHeight={false} size={12} />
              ) : (
                "No Lesson Plans Available. Please Generate a new Lesson Plan."
              )}
            </div>
          )}
          {/* {} */}
        </div>
      ),
    },
    {
      title: "2. Explore Lesson Plan",
      content: (
        <div className="h-full space-y-4 overflow-hidden pb-4">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-[#00446d]" />
              </div>
              <p className="mt-2 text-base font-medium text-gray-700">
                Generating Lesson Plan...
              </p>
              <p className="text-sm text-gray-500">
                This may take a few seconds
              </p>
            </div>
          ) : selectedLessonPlanId && lessonFormat && lessonPlanEndData ? (
            <LessonPlanContainer
              lessonFormat={lessonFormat}
              setLessonFormat={(format) => {
                setLessonFormat(format);
              }}
              loadingLessonplanData={loadingLessonplanData}
              lessonData={lessonPlans?.data[0] || null}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
              <BookOpen className="mb-3 h-12 w-12 text-gray-400" />
              <h2 className="text-lg font-semibold">No Lesson Plans Found</h2>
              <p className="text-sm text-gray-400">
                No lesson plans are available for the selected grade, subject,
                or date.
              </p>
              <button
                onClick={() => handleCreateLessonPlanModel(true)}
                className="bg-primary hover:bg-primary/90 mt-4 cursor-pointer rounded-lg px-4 py-2 text-white shadow"
              >
                + Create Lesson Plan
              </button>
            </div>
          )}

          {modalOpen && selectedLesson && (
            <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
              <div className="relative w-11/12 rounded-lg bg-white p-6 shadow-lg sm:w-96">
                <h2 className="mb-2 text-xl font-bold">
                  {selectedLesson.title}
                </h2>
                <p>
                  <strong>Grade:</strong> {selectedLesson.grade}
                </p>
                <p>
                  <strong>Subject:</strong> {selectedLesson.subject}
                </p>
                <p>
                  <strong>Teacher:</strong> {selectedLesson.teacher}
                </p>
                <p>
                  <strong>Date:</strong> {selectedLesson.start}
                </p>
                <p className="mt-2">
                  <strong>Description:</strong> {selectedLesson.description}
                </p>

                <div className="mt-4 flex justify-between">
                  <Button onClick={exportPDF} variant="default">
                    Export PDF
                  </Button>
                  <Button onClick={() => setModalOpen(false)} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {modalOpen && isCreatPlanOpen && (
            <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
              <div className="relative w-11/12 rounded-lg bg-white p-6 shadow-lg sm:w-96">
                <h2 className="mb-2 text-xl font-bold">
                  {selectedLesson.title}
                </h2>
                Hello
                <div className="mt-4 flex justify-between">
                  <Button onClick={exportPDF} variant="default">
                    Export PDF
                  </Button>
                  <Button onClick={() => setModalOpen(false)} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];
  return (
    <>
      <MainLayout
        pageTitle={"Lesson Plans"}
        actionButton={() => (
          <div className="flex gap-4">
            <button
              className="bg-primary flex cursor-pointer items-center gap-1.5 rounded px-4 py-2 text-white disabled:opacity-50"
              onClick={() => setIsCreatPlanOpen(true)}
            >
              <Plus className="h-4 w-4 text-white" />
              Create Lesson Plan
            </button>
          </div>
        )}
      >
        <div className="flex h-full flex-col gap-2 px-4">
          <AccordionStepper
            steps={steps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </div>
        {/* <div className="flex h-full flex-col gap-2 px-4"> */}
        {/* {isLoading || lessonPlanDataLoading ? (
            // <div></div>
            <div className="flex h-64 flex-col items-center justify-center gap-2">
              <LoadingSpinner fullHeight={false} size={12} />
              {lessonPlanDataLoading ? (
                <p className="text-gray-600">Loading Lesson Plan</p>
              ) : (
                isLoading && (
                  <p className="text-gray-600">Generating Lesson Plan...</p>
                )
              )}
            </div>
          ) : (
       
          )} */}
        {/* </div> */}
      </MainLayout>
      <Model
        isOpen={isCreatPlanOpen}
        onClose={() => {
          handleCreateLessonPlanModel(false);
        }}
        title="Create Lesson Plan"
      >
        <div className="w-full max-w-2xl  sm:mx-2 sm:max-w-full">
          {/* Form Grid */}
                  <div className="sm:max-w-[500px] space-y-3 p-4 border-0 shadow-elegant">
                      {/* Grade */}
                      <div className="space-y-3">
                          <Label htmlFor="grade" className="text-sm text-primary flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-primary" />
                              Select Grade
                          </Label>
                          <Select id="newPlanGradeId" name="newPlanGradeId" value={formData.newPlanGradeId} onValueChange={handleGradeNewPlan}>
                              <SelectTrigger className="w-full h-12 border-2 border-border/50 hover:border-primary/50 transition-colors bg-background/50">
                                  <SelectValue placeholder="Choose a grade..." />
                              </SelectTrigger>
                              <SelectContent className="bg-background border-2 border-border/50 shadow-card">
                                  {grades.map((grade) => (
                                      <SelectItem key={grade.gradeId} value={grade.gradeId} className="hover:bg-primary/10 focus:bg-primary/10">
                                          {grade.gradeName}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>


                      <div className="space-y-3">
                          <Label htmlFor="subject" className="text-sm text-primary flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-accent" />
                              Select Subject
                          </Label>
                          <Select value={formData.newPlanSubjectId || ""} onValueChange={handleSubjectNewPlan} disabled={!formData.newPlanGradeId}>
                              <SelectTrigger className="w-full h-12 border-2 border-border/50 hover:border-accent/50 transition-colors bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed">
                                  <SelectValue placeholder={!formData.newPlanGradeId ? "Select a grade first..." : "Choose a subject..."} />
                              </SelectTrigger>
                              <SelectContent className="bg-background border-2 border-border/50 shadow-card">
                                  {newPlanSubjects.map((subject) => (
                                      <SelectItem key={subject.subjectId} value={subject.subjectId} className="hover:bg-accent/10 focus:bg-accent/10">
                                          {subject.subject}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>


                      {periodListDataLoading ? (
                          <div className="flex w-full justify-center">
                              <LoadingSpinner fullHeight={false} size={6} />
                          </div>
                      ) : (

                              <div className="space-y-3">
                                  <Label htmlFor="teacher" className="text-sm text-primary flex items-center gap-2">
                                      <Users className="w-4 h-4 text-accent" />
                                      On Behalf of Teacher
                                  </Label>
                                  <Select value={formData.newPlanTeacherId || ""} onValueChange={handleTeacherNewPlan} disabled={!formData.newPlanSubjectId}>
                                      <SelectTrigger className="w-full h-12 border-2 border-border/50 hover:border-accent/50 transition-colors bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed">
                                          <SelectValue placeholder={!formData.newPlanSubjectId ? "Select a subject first..." : "Choose a teacher ..."} />
                                      </SelectTrigger>
                                      <SelectContent className="bg-background border-2 border-border/50 shadow-card">
                                          {lessonPlanTeachersList.map((teacher, index) => (
                                              <SelectItem
                                                  key={teacher.userId}
                                                  value={teacher.userId}
                                                  className="hover:bg-accent/10 focus:bg-accent/10"
                                              >
                                                  <div className="flex items-center justify-between w-full gap-2">
                                                      <User className="w-4 h-4 text-accent" />
                                                    {teacher.userName}
                                                      {/*<div className="flex items-center gap-2 ml-4">*/}
                                                      {/*    <CalendarDays className="w-3 h-3 text-muted-foreground" />*/}
                                                      {/*    <span className="text-sm text-muted-foreground">                                                              */}
                                                      {/*        Week {teacher.weekNumber} ({format(new Date(teacher.weekStartDate), "MMM dd, yyyy")} to {format(new Date(teacher.weekEndDate), "MMM dd, yyyy")})*/}
                                                      {/*    </span>*/}
                                                      {/*</div>*/}
                                                  </div>
                                              </SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                              </div>                                                
                      )}
                 
                      {formData.newPlanTeacherId != "" && (

                          <Card className="bg-education-background/50 border border-education-primary/20 p-4">
                              <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm font-medium text-education-secondary">
                                      <Calendar className="h-4 w-4 text-education-primary" />
                                      Lesson Plan will be created for this week
                                  </div>


                                  <div className="space-y-1.5 ml-6">
                                      <div className="flex items-center gap-3 text-xs">
                                          <div className="flex items-center gap-1.5 min-w-[70px]">
                                              <Clock className="h-3 w-3 text-education-primary" />
                                              <span className="font-medium text-education-secondary">Week:</span>
                                          </div>
                                          <span className="text-gray-700">Week {formData.newPlanWeekDetail[0].weekNumber}</span>
                                      </div>

                                      <div className="flex items-center gap-3 text-xs">
                                          <div className="flex items-center gap-1.5 min-w-[70px]">
                                              <Calendar className="h-3 w-3 text-education-primary" />
                                              <span className="font-medium text-education-secondary">Start Date:</span>
                                          </div>
                                          <span className="text-gray-700"> {formData.newPlanWeekDetail[0]?.weekStartDate?.split("T")[0] || "-"}</span>
                                      </div>

                                      <div className="flex items-center gap-3 text-xs">
                                          <div className="flex items-center gap-1.5 min-w-[70px]">
                                              <Calendar className="h-3 w-3 text-education-primary" />
                                              <span className="font-medium text-education-secondary">End Date:</span>
                                          </div>
                                          <span className="text-gray-700">{formData.newPlanWeekDetail[0]?.weekEndDate?.split("T")[0] || "-"}</span>
                                      </div>
                                  </div>
                                  {   formData.newPlanWeekDetail[0]?.countLessonPlans > 0 ?
                                      (<div className="mt-4 pt-3 border-t border-education-primary/10">
                                          <div className="text-center">
                                              <h4 className="text-sm font-semibold text-education-secondary mb-1">
                                                  Lesson Plan Availability
                                              </h4>
                                              <p className="text-xs text-gray-600 leading-relaxed">
                                                  Lesson plans available for this grade and subject are till date:
                                                  <br />
                                                  <span className="font-medium text-primary">{formData.newPlanWeekDetail[0]?.maxAvailableDate?.split("T")[0]}</span>
                                              </p>
                                          </div>
                                      </div>) : (
                                          <div className="mt-4 pt-3 border-t border-education-primary/10">
                                              <div className="text-center">
                                                  <h4 className="text-sm font-semibold text-education-secondary mb-1">
                                                  No Lesson Plan Available
                                                  </h4>                                              
                                              </div>
                                          </div>
                                      )


                                  }
                              </div>
                          </Card>
                      
                    
                          )}
                  

          </div>
       
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="text-gray-600 hover:text-red-600"
              onClick={() => handleCreateLessonPlanModel(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLessonPlan}
              disabled={!isNewPlanFormValid}
              className="bg-primary flex items-center justify-center gap-2 text-white transition-all hover:opacity-90"
            >
              Create
            </Button>
          </div>
        </div>
      </Model>
    </>
  );
};
