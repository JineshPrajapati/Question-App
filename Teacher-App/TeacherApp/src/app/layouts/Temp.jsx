import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  createContext,
} from "react";
import { Outlet, useNavigate, Link } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { SidebarProvider } from "../../contexts/sidebarContext";
import { cn } from "../../lib/utility";
import { UserCircle2Icon } from "lucide-react";
import { getSchoolDropdownList } from "../../api/services/dropDownMasterService";
import {
  HomeModernIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../contexts/authContext";
import { ProfilePic } from "../components/common/ProfilePic";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { getImageUrl } from "../../api/services/fileService";
import { isImageLoadable } from "../../lib/utility";
import { getAccessRightsData } from "../../api/services/authService";
import { ProfilePicViewer } from "../components/common/ProfilePicViewer.jsx";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

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

export default function Temp() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const {
    user: userData,
    setProfilePicPersist,
    UserProfilePic,
    setCurrentSchool,
    currSelectedSchool,
    setPermissionsData,
  } = useContext(AuthContext);
  // const { setCurrentSchool, currSelectedSchool, userData } =
  //   useContext(AuthContext);

  const [imageSrc, setImageSrc] = useState(UserProfilePic);
  const {
    data: schools,
    isLoading: schoolLoading,
    isRefetching: schoolRefetching,
    refetch: refetchSchool,
  } = useQuery({
    queryKey: ["schoolsData", userData.userId],
    queryFn: () => getSchoolDropdownList(userData.userId),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!currSelectedSchool && schools?.data?.data?.length) {
      setCurrentSchool(schools.data.data[0].value);
    }
  }, [schools, currSelectedSchool]);

  const {
    data: accessRightsData,
    isLoading: isAccessRightsLoading,
    isError: isAccessRightsError,
  } = useQuery({
    queryKey: ["accessRightsData", currSelectedSchool],
    queryFn: () => getAccessRightsData(currSelectedSchool, userData.userId),
    keepPreviousData: true,
    enabled: !!currSelectedSchool,
  });

  useEffect(() => {
    const fetchUserImage = async () => {
      if (UserProfilePic) {
        const imageData = await isImageLoadable(UserProfilePic);
        if (imageData) return setImageSrc(UserProfilePic);
      }

      if (userData?.fileIdentityId) {
        setProfileLoading(true);
        const imageUrl = await getImageUrl(userData.fileIdentityId);
        if (imageUrl) {
          setProfileLoading(false);
          setImageSrc(imageUrl);
          setProfilePicPersist(imageUrl);
        } else {
          setProfileLoading(false);
        }
      }
    };

    fetchUserImage();
  }, [userData?.fileId, UserProfilePic]);

  const selectRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleIconClick = () => {
    setMenuOpen((prev) => !prev);
    if (selectRef.current) {
      selectRef.current.focus();
    }
  };

  const schoolOptions =
    schools?.data?.data?.length > 0
      ? schools.data.data.map((school) => ({
          value: school.value,
          label: `(${school.code}) ${school.label}`,
        }))
      : [];

  const selectedSchool = schoolOptions.find(
    (option) => option.value === currSelectedSchool,
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
          <div className="flex h-16 items-center justify-end border-b border-gray-100 bg-white px-4">
            <div className="mr-3 flex items-center gap-2 border-b border-gray-100 bg-white p-4">
              {schoolOptions.length > 0 && (
                <>
                  {isMobile ? (
                    <div className="relative">
                      <div
                        //onClick={() => setMenuOpen((prev) => !prev)}

                        onClick={handleIconClick}
                        className="cursor-pointer"
                      >
                        <HomeModernIcon className="text-primary h-6 w-6" />
                      </div>

                      {menuOpen && (
                        <ul
                          role="menu"
                          className="absolute right-0 z-10 mt-2 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
                        >
                          {schoolOptions.map((school) => {
                            const isSelected =
                              school.value === currSelectedSchool;
                            return (
                              <li
                                key={school.value}
                                role="menuitem"
                                onClick={() => {
                                  setCurrentSchool(school.value);
                                  setMenuOpen(false);
                                }}
                                className={`flex w-full cursor-pointer items-center rounded-md p-3 text-sm transition-all ${
                                  isSelected
                                    ? "text-primary font-semibold"
                                    : "text-slate-800 hover:bg-slate-100"
                                }`}
                              >
                                {school.label}
                              </li>
                            );
                          })}
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
                  )}
                </>
              )}
            </div>
            <div
              className="flex cursor-pointer items-center rounded-lg px-3 py-2 hover:bg-gray-50"
              onClick={() => navigate("/user-profile")}
            >
              {userData?.fileIdentityId && userData?.fileIdentityId !== "" ? (
                <div className="h-8 w-8 rounded-full border border-gray-300">
                  {profileLoading ? (
                    <LoadingSpinner
                      fullHeight={false}
                      size={8}
                      color={"white"}
                    />
                  ) : (
                    <>
                      <ProfilePic
                        type="TopBar"
                        src={imageSrc}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />

                      {/* <ProfilePicViewer
                        size={9}
                        fileId={userData.fileIdentityId || null}
                        filePath={userData.profilePicturePath || null}
                        className={"z-0"}
                      /> */}
                    </>
                  )}
                </div>
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
          </div>

          <div className="max-h-full flex-1 overflow-hidden p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
