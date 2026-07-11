import { Navigate, Outlet, useLocation } from "react-router";
import { Loader } from "../components/ui/Loader";
import { AuthContext } from "../contexts/authContext";
import { useContext } from "react";
import Cookies from "js-cookie";
export const PrivateRoute = () => {
  const { user } = useContext(AuthContext);
  const token = Cookies.get("accessToken");
  const location = useLocation();
  const pathname = location.pathname;
  const accessRights = useContext(AuthContext).accessRights;
  // const isAccessDenied = accessRights.filter(right => right.routePath === pathname).filter(right => right.rightId === 1).length > 0 ? false : true;
  // console.log
  // console.log(isAccessDenied, "paths");
  return token && user?.userId ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
  );
};

export const AuthorizedRoute = () => {
  const location = useLocation();
  const splitPaths = location.pathname.split("/");

  const pathname = "/" + splitPaths[1];
  const permissions = useContext(AuthContext).permissions;
  let rightId;
  // console.log(location.pathname.split("/")[2] || "Hello", "paths");
  if (splitPaths[2] && splitPaths[2] == "Update") {
    rightId = 2;
  } else if (
    splitPaths[2] &&
    (splitPaths[2] == "Add" || splitPaths[2] == "Create")
  ) {
    rightId = 1;
  } else {
    rightId = 0;
  }
  // if(location.pathname.split("/").length)
  if (permissions && permissions[pathname]) {
    const modulePermission = permissions[pathname].split("");
    const isAccessDenied = modulePermission[rightId] != 1;
    return isAccessDenied ? (
      <Navigate
        to="/access-denied"
        state={{ from: location.pathname }}
        replace
      />
    ) : (
      <Outlet />
    );
  }
};
export const PublicRoute = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const token = Cookies.get("accessToken");
  //   console.log(import.meta.env.VITE_API_BASE_URL, "BASE_URL");
  return !token || !user.userId ? (
    <Outlet />
  ) : (
    <Navigate to={"/"} state={{ from: location.pathname }} replace />
  );
};
