import React, { useState, useEffect, useContext, useRef } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { SidebarProvider } from "../../contexts/sidebarContext";
import { cn } from "../../lib/utility";
import {
  HomeModernIcon,
  UserCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../contexts/authContext";
import { ProfilePic } from "../components/common/ProfilePic";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { getImageUrl } from "../../api/services/fileService";
import { isImageLoadable } from "../../lib/utility";
import {
  getAcademicYearsDropdownList,
  getSchoolDropdownList,
} from "../../api/services/dropDownMasterService";
import { getAccessRightsData } from "../../api/services/authService";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { use } from "react";
import { Tooltip } from "../components/common/Tooltip";
import { LogOut, UserRound, MessageSquareIcon } from "lucide-react";
import { NAV_ITEMS } from "../../lib/navbarData";

const headerSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    minHeight: "34px",
    height: "34px",
    backgroundColor: "transparent",
    borderColor: state.isFocused ? "var(--color-primary)" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 1px var(--color-primary)" : "none",
    "&:hover": {
      borderColor: "var(--color-primary)",
    },
    padding: "0 4px",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: state.isSelected
      ? "var(--color-primary-light)"
      : state.isFocused
        ? "var(--color-primary-lighter)"
        : "white",
    color: "#111827",
    fontSize: "0.875rem",
    fontWeight: state.isSelected ? "500" : "400",
    padding: "8px 12px",
    "&:hover": {
      backgroundColor: "var(--color-primary-lighter)",
    },
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    zIndex: 50,
  }),
  valueContainer: (baseStyles) => ({
    ...baseStyles,
    padding: "0 4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    margin: "0",
    padding: "0",
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: "#374151",
    fontWeight: "500",
  }),
};

function MainContent({ children }) {
  return (
    <main
      className={cn(
        "min-h-screen flex-1 bg-gray-50 transition-all duration-300",
      )}
    >
      <div className="container mx-auto p-4 sm:p-6">{children}</div>
    </main>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAcademicYearOpen, setAcademicYearMenuOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  // const [myRights, setMyRights] = useState([]);
  const {
    user: userData,
    setProfilePicPersist,
    UserProfilePic,
    setCurrentSchool,
    currSelectedSchool,
    setCurrentAcademicYear,
    currSelectedAcademicYear,
    setPermissionsData,
    setInitialPath,
    logout,
  } = useContext(AuthContext);

  const [imageSrc, setImageSrc] = useState(UserProfilePic);
  const selectRef = useRef();
  const dropdownRef = useRef(null); // 👈 add ref

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const { data: schools, isLoading: isSchoolLoading } = useQuery({
    queryKey: ["schoolsData", userData.userId],
    queryFn: () => getSchoolDropdownList(userData.userId),
    keepPreviousData: false,
  });

  const { data: academicYears, isLoading: isAcademicYearLoading } = useQuery({
    queryKey: ["academicYearsData", userData.userId],
    queryFn: () => getAcademicYearsDropdownList(userData.userId),
    keepPreviousData: false,
  });

  const hasSchools = schools?.data?.data?.length > 0;
  const schoolOptions = hasSchools
    ? schools.data.data.map((school) => ({
        value: school.value,
        label: `(${school.code}) ${school.label}`,
      }))
    : [];

  const hasAcademicYears = academicYears?.data?.data?.length > 0;
  const academicyearOptions = hasAcademicYears
    ? academicYears.data.data.map((academicYear) => ({
        value: academicYear.value,
        label: academicYear.label,
      }))
    : [];

  const selectedSchool = schoolOptions.find(
    (option) => option.value === currSelectedSchool,
  );

  const selectedAcademicYear = academicyearOptions.find(
    (option) => option.value === currSelectedAcademicYear,
  );

  useEffect(() => {
    if (!currSelectedSchool && hasSchools) {
      setCurrentSchool(schools.data.data[0].value);
    }
  }, [schools, currSelectedSchool]);

  useEffect(() => {
    if (!currSelectedAcademicYear && hasAcademicYears) {
      setCurrentAcademicYear(academicYears.data.data[0].value);
    }
  }, [academicYears, currSelectedAcademicYear]);

  const { data: accessRightsData, isLoading: isAccessRightsLoading } = useQuery(
    {
      queryKey: ["accessRightsData", currSelectedSchool],
      queryFn: () => getAccessRightsData(currSelectedSchool, userData.userId),
      enabled: !!currSelectedSchool,
      keepPreviousData: false,
    },
  );
  function findFirstAllowedHref(permissions) {
    for (const item of NAV_ITEMS) {
      // If top-level item has href, check it
      if (item.isAuthorized && item.path) {
        const pathPerm = permissions[item.path];
        if (pathPerm && pathPerm.split("")[0] === "1") {
          return item.path;
        }
      }

      // If item has submenu, check subitems
      // if (item.submenu && Array.isArray(item.submenu)) {
      //   for (const subItem of item.submenu) {
      //     if (subItem.isAuthorized && subItem.href) {
      //       const pathPerm = permissions[subItem.href];
      //       if (pathPerm && pathPerm.split("")[0] === "1") {
      //         return subItem.href;
      //       }
      //     }
      //   }
      // }
    }

    return "/noroles";
  }
  useEffect(() => {
    if (accessRightsData?.data?.accessRight) {
      let ipath = findFirstAllowedHref(accessRightsData.data.accessRight);
      setInitialPath(ipath);
      // setMyRights(accessRightsData.data.accessRight);
      setPermissionsData(accessRightsData.data.accessRight || null);
    }
  }, [accessRightsData]);
  useEffect(() => {
    const fetchUserImage = async () => {
      if (UserProfilePic) {
        const loadable = await isImageLoadable(UserProfilePic);
        if (loadable) return setImageSrc(UserProfilePic);
      }

      if (userData?.fileIdentityId) {
        setProfileLoading(true);
        const imageUrl = await getImageUrl(userData.fileIdentityId);
        if (imageUrl) {
          setProfilePicPersist(imageUrl);
          setImageSrc(imageUrl);
        }
        setProfileLoading(false);
      }
    };
    fetchUserImage();
  }, [userData?.fileId, UserProfilePic]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleIconClick = () => {
    setMenuOpen((prev) => !prev);
    selectRef.current?.focus();
  };
  const handleYearIconClick = () => {
    setAcademicYearMenuOpen((prev) => !prev);
    selectRef.current?.focus();
  };

  const renderSchoolSelector = () => {
    if (!hasSchools) return null;
    return isMobile ? (
      <div className="relative">
        <div onClick={handleIconClick} className="cursor-pointer">
          <HomeModernIcon className="text-primary h-6 w-6" />
        </div>
        {menuOpen && (
          <ul className="absolute right-0 z-10 mt-2 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            {schoolOptions.map((school) => (
              <li
                key={school.value}
                onClick={() => {
                  setCurrentSchool(school.value);
                  setMenuOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center rounded-md p-3 text-sm transition-all ${
                  school.value === currSelectedSchool
                    ? "text-primary font-semibold"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                {school.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : (
      <Select
        options={schoolOptions}
        value={selectedSchool}
        onChange={(selected) => setCurrentSchool(selected.value)}
        isSearchable={false}
        styles={headerSelectStyles}
        components={{
          ValueContainer: ({ children, ...props }) => (
            <div className="flex items-center gap-1" {...props}>
              <div className="border-r-1 border-gray-400 px-1">
                <HomeModernIcon className="text-primary h-4 w-4" />
              </div>
              {children}
            </div>
          ),
        }}
        className="text-sm"
        classNamePrefix="school-select"
      />
    );
  };

  if (isSchoolLoading || isAccessRightsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  const renderAcademicYearSelector = () => {
    if (!hasAcademicYears) return null;
    return isMobile ? (
      <div className="relative">
        <div onClick={handleYearIconClick} className="cursor-pointer">
          <CalendarIcon className="text-primary h-6 w-6" />
        </div>
        {menuAcademicYearOpen && (
          <ul className="absolute right-0 z-10 mt-2 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            {academicyearOptions.map((academicYear) => (
              <li
                key={academicYear.value}
                onClick={() => {
                  setCurrentAcademicYear(academicYear.value);
                  setAcademicYearMenuOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center rounded-md p-3 text-sm transition-all ${
                  academicYear.value === currSelectedAcademicYear
                    ? "text-primary font-semibold"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                {academicYear.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : (
      <Select
        options={academicyearOptions}
        value={selectedAcademicYear}
        onChange={(selected) => setCurrentAcademicYear(selected.value)}
        isSearchable={false}
        styles={headerSelectStyles}
        components={{
          ValueContainer: ({ children, ...props }) => (
            <div className="flex items-center gap-1" {...props}>
              <div className="border-r-1 border-gray-400 px-1">
                <CalendarIcon className="text-primary h-4 w-4" />
              </div>
              {children}
            </div>
          ),
        }}
        className="text-sm"
        classNamePrefix="academicYear-select"
      />
    );
  };
  if (isAcademicYearLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
          <div className="flex h-16 items-center justify-end gap-3 border-b border-gray-100 bg-white px-4">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-white">
              {renderSchoolSelector()}
            </div>
            <div className="flex items-center gap-2 border-b border-gray-100 bg-white">
              {renderAcademicYearSelector()}
            </div>

            <Tooltip content={<p>Profile</p>}>
              <div
                className="relative flex"
                ref={dropdownRef}
                onClick={() => setOpenDropdown((prev) => !prev)}
              >
                {/* Avatar button */}
                <div
                  className="flex cursor-pointer items-center rounded-lg px-1 py-1 hover:bg-gray-50"
                  // onClick={() => setOpenDropdown((prev) => !prev)}
                >
                  {userData?.fileIdentityId ? (
                    <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-gray-300">
                      {profileLoading ? (
                        <LoadingSpinner
                          fullHeight={false}
                          size={8}
                          color="white"
                        />
                      ) : (
                        <ProfilePic
                          type="TopBar"
                          src={imageSrc}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  )}
                </div>

                {/* Dropdown */}
                {openDropdown && (
                  <div className="border-primary absolute top-10 right-0 z-50 mt-2 w-40 cursor-pointer rounded-md bg-gray-200 shadow-lg">
                    <button
                      className="flex w-full cursor-pointer bg-gray-100 px-4 py-2 text-left text-sm hover:bg-white"
                      onClick={() => {
                        navigate("/user-profile");
                        setOpenDropdown(false);
                      }}
                    >
                      <UserRound size={16} className="mr-2" /> Profile
                    </button>
                    <button
                      className="flex w-full cursor-pointer items-center bg-gray-100 px-4 py-2 text-left text-sm hover:bg-white"
                      onClick={() => {
                        logout();
                        setOpenDropdown(false);
                      }}
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                )}

                <div className="flex cursor-pointer flex-col">
                  <div className="text-l text-start font-bold text-black">
                    {userData.firstName + " " + userData.lastName}
                  </div>
                  <div className="text-start text-sm text-gray-700">
                    {userData.roleName}
                  </div>
                </div>
              </div>
            </Tooltip>
          </div>
          <div className="max-h-full flex-1 overflow-auto bg-gray-50 p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
