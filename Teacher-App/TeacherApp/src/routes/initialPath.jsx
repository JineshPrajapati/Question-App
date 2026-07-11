import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../contexts/authContext";

const InitialPathRedirect = () => {
  //   const { initialPath } = useContext(DashboardContext);
  const { initialPath } = useContext(AuthContext);

  return <Navigate to={initialPath} replace />;
};

export default InitialPathRedirect;
