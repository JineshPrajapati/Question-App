import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load from localStorage on first render
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [initialPath, setInitialPath] = useState("/");

  const [accessRights, setAccessRights] = useState(() => {
    const savedAccessRights = localStorage.getItem("accessRights");
    return savedAccessRights ? JSON.parse(savedAccessRights) : null;
  });
  const [permissions, setPermissions] = useState(() => {
    const savedPermissions = localStorage.getItem("permissions");
    return savedPermissions ? JSON.parse(savedPermissions) : null;
  });
  const [UserProfilePic, setUserProfilePic] = useState(() => {
    const savedUserProfilePic = localStorage.getItem("userProfilePic");
    return savedUserProfilePic ? savedUserProfilePic : null;
  });

  const [currSelectedSchool, setcurrSelectedSchool] = useState(() => {
    const savedCurrSchool = localStorage.getItem("currSelectedSchool");
    return savedCurrSchool ? savedCurrSchool : null;
  });

    const [currThreadId, setCurrThreadId] = useState(() => {
        const savedThread = localStorage.getItem("currThreadId");
        return savedThread ? savedThread : null;
    });

  const [currSelectedAcademicYear, setcurrSelectedAcademicYear] = useState(
    () => {
      const savedCurrAcademicYear = localStorage.getItem(
        "currSelectedAcademicYear",
      );
      return savedCurrAcademicYear ? savedCurrAcademicYear : null;
    },
  );
  const setUserData = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    };

    const setCurrentThreadId = (threadId) => {
        localStorage.setItem("currThreadId", threadId);
        setCurrThreadId(threadId);
    };

  const setCurrentSchool = (schoolId) => {
    localStorage.setItem("currSelectedSchool", schoolId);
    setcurrSelectedSchool(schoolId);
  };

  const setAccessRightsData = (accessRights) => {
    localStorage.setItem("accessRights", JSON.stringify(accessRights));
    setAccessRights(accessRights);
  };

  const setPermissionsData = (permissions) => {
    localStorage.setItem("permissions", JSON.stringify(permissions));
    setPermissions(permissions);
  };

  const setProfilePicPersist = (imageURL) => {
    localStorage.setItem("userProfilePic", imageURL);
    setUserProfilePic(imageURL);
  };
  // useEffect(() => {
  //   const token = Cookies.get("accessToken");
  //   if (token) {
  //     setUser({ token });
  //   }
  // }, []);
  const setCurrentAcademicYear = (academicYearId) => {
    localStorage.setItem("currSelectedAcademicYear", academicYearId);
    setcurrSelectedAcademicYear(academicYearId);
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    localStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUserData,
        logout,
        accessRights,
        setAccessRightsData,
        setProfilePicPersist,
        UserProfilePic,
        setCurrentSchool,
        currSelectedSchool,
        setCurrentAcademicYear,
        currSelectedAcademicYear,
        currThreadId,
        setCurrentThreadId,
        setPermissionsData,
        permissions,
        setInitialPath,
        initialPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
