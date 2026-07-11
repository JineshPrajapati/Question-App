import { Route, Routes } from "react-router";
import { Login } from "../app/modules/auth/components/Login";
import { Registration } from "../app/modules/auth/components/Registration";
import { ForgotPassword } from "../app/modules/auth/components/ForgotPassword";
import { AccessDenied } from "../app/modules/auth/components/AccessDenied";
import { PageNotFound } from "../app/modules/auth/components/PageNotFound";
import { AuthorizedRoute, PrivateRoute, PublicRoute } from "./authRoutes";
import { Terms } from "../app/modules/legal/Terms";
import { AuthLayout } from "../app/layouts/AuthPage";
import { ResetPassword } from "../app/modules/auth/components/ResetPassword";
import { Users } from "../app/pages/Users";
import { UserProfile } from "../app/pages/UserProfile";
import ChatLayout from "../app/layouts/ChatLayout";
import { AuthContext } from "../contexts/authContext";
import { useContext } from "react";
import DashboardLayout from "../app/layouts/DashboardLayout";
import { Roles } from "../app/pages/Roles";
import { Students } from "../app/pages/Students";
import { AddUpdateStudent } from "../app/components/students/AddUpdateStudent";
import { MyDashboard } from "../app/pages/MyDashboard";
import { Teachers } from "../app/pages/Teachers";
import { Schools } from "../app/pages/Schools";
import { LessonPlanningForm } from "../app/components/lessonPlan/LessonPlanningForm";
import { AddUpdateTeacher } from "../app/components/teachers/AddUpdateTeacher";
import Knowledgebase from "../app/pages/Knowledgebase";
import { Chats } from "../app/pages/Chat";
import { NotificationProvider } from "../contexts/NotificationContext";
import { SignalRProvider } from "../contexts/SignalRContext";
import { MyStudents } from "../app/pages/MyStudent";
import Settings from "../app/pages/Settings";
import HolidaySettings from "../app/components/SchoolSettings/HolidaySettings";
import GradeSettings from "../app/components/SchoolSettings/GradeSettings";
import ManageCurriculum from "../app/components/SchoolSettings/ManageCurriculum";
import { LessonPlanCalendar } from "../app/components/lessonPlan/LessonPlanCalendar";

import { ChatInterface } from "../app/components/AiChat/ChatInterface";
import { Leaves } from "../app/pages/Leave";
import InitialPathRedirect from "./initialPath";
import SubjectSettings from "../app/components/SchoolSettings/SubjectSettings";
import { TeacherProfile } from "../app/pages/TeacherProfile";
import { StudentProfile } from "../app/pages/StudentProfile";
function MyRoutes() {
  const { user: userData } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="terms-conditions" element={<Terms />} />
      <Route path="access-denied" element={<AccessDenied />} />
      <Route path="page-not-found" element={<PageNotFound />} />
      <Route element={<PublicRoute />}>
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Registration />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
      </Route>
      <Route
        element={
          <NotificationProvider>
            <SignalRProvider>
              <PrivateRoute />
            </SignalRProvider>
          </NotificationProvider>
        }
      >
        <Route path="/" element={<DashboardLayout />}>
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="teacher-profile" element={<TeacherProfile />} />
          <Route path="student-profile" element={<StudentProfile />} />

          <Route path="chat" element={<ChatLayout />} />
          {/* <Route
            index
            element={
              <Navigate
                to={userData?.userTypeId == 6 ? "/mystudents" : "/dashboard"}
                replace
              />
            }
          /> */}
          <Route index element={<InitialPathRedirect />} />

          {/* <Route path="dashboard" element={<MyDashboard />} /> */}
          <Route path="chatMessage" element={<Chats />} />
          <Route path="leaves" element={<Leaves />} />

          <Route element={<AuthorizedRoute />}>
            <Route path="dashboard" element={<MyDashboard />} />
            <Route path="holidaySettings" element={<HolidaySettings />} />
            <Route path="lessonPlanning" element={<ManageCurriculum />} />
            <Route path="gradeSettings" element={<GradeSettings />} />
            <Route path="subject" element={<SubjectSettings />} />
            <Route path="settings" element={<Settings />} />

            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="students" element={<Students />} />
            <Route
              path="students/Add"
              element={<AddUpdateStudent isEdit={false} />}
            />
            <Route
              path="students/Update"
              element={<AddUpdateStudent isEdit={true} />}
            />
            <Route
              path="myStudents/View"
              element={<AddUpdateStudent isView={true} />}
            />
            <Route path="knowledgebase" element={<Knowledgebase />} />
            <Route path="teachers" element={<Teachers />} />
            {/*  <Route path="lessonplan" element={<LessonPlan />} />*/}
            <Route path="lessonplan" element={<LessonPlanCalendar />} />

            <Route path="lessonplan/Create" element={<LessonPlanningForm />} />
            <Route path="schools" element={<Schools />} />

            <Route
              path="teachers/Add"
              element={<AddUpdateTeacher isEdit={false} />}
            />
            <Route
              path="teachers/Update"
              element={<AddUpdateTeacher isEdit={true} />}
            />
            <Route path="myStudents" element={<MyStudents />} />
          </Route>
          {/* <Route path="ResidentTask" element={<ResidentTask />} />
          <Route path="facility/:facilityId" element={<FacilityRooms />} />
          <Route path="playarea" element={<Playarea />} /> */}

          {/* <Route path="settings" element={<Settings />} /> */}
          <Route path="aiassistent" element={<ChatInterface />} />
        </Route>
      </Route>
    </Routes>
  );
}
export default MyRoutes;
