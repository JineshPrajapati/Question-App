import {
  Home,
  ShieldUserIcon,
  Users,
  SchoolIcon,
  BookCheck,
  BookOpenIcon,
  MessageCircle,
  Settings2Icon,
  MessageSquareIcon,
  BrainCircuit,
  Brain,
} from "lucide-react";
import studentIcon from "../../src/assets/icons/studenticone.svg";
import leaveIcon from "../../src/assets/icons/leaveIcon.svg";
export const NAV_ITEMS = [
  {
    name: "Dashboard",
    // icon: Home,
    image: "/assets/icons/dashboard.png",
    path: "/dashboard",
    // svg: "dashboard",
    isAuthorized: true,
  },
  {
    name: "User Management",
    image: "/assets/icons/user_management.png",

    path: "/users",
    isAuthorized: true,
  },
  {
    name: "Roles & Permissions",
    image: "/assets/icons/roles.png",

    path: "/roles",
    // svg: "permissions",

    isAuthorized: true,
  },
  {
    name: "Student",
    image: "/assets/icons/student.png",

    path: "/students",
    isAuthorized: true,
  },
  {
    name: "My Student",
    image: "/assets/icons/student.png",

    path: "/mystudents",
    // svg: "student",
    isAuthorized: true,
  },
  {
    name: "Teacher",
    image: "/assets/icons/teacher.png",

    path: "/teachers",
    isAuthorized: true,
  },
  { name: "School", icon: SchoolIcon, path: "/schools", isAuthorized: true },

  {
    name: "Lesson Plan",
    image: "/assets/icons/lesson_plan.png",

    path: "/lessonplan",
    isAuthorized: true,
  },
  {
    name: "Knowledgebase",
    icon: BookOpenIcon,
    // isAuthorized: true,
    isAuthorized: true,
    path: "/knowledgebase",
  },
  {
    name: "Chat",
    image: "/assets/icons/chat.png",

    path: "/chatMessage",
    isAuthorized: true,
  },
  {
    name: "Ai Assistent",
    image: "/assets/icons/ai_assitance.png",
    path: "/aiassistent",
    isAuthorized: false,
  },

  {
    name: "Settings",
    image: "/assets/icons/setting.png",
    isAuthorized: true,
    path: "/settings",
  },
  // {
  //   name: "Vacation",
  //   image: leaveIcon,
  //   isAuthorized: false,
  //   path: "/leaves",
  // },
];
