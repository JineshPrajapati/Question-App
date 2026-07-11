// src/components/PermissionGuard.jsx
import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";

const PermissionGuard = ({ path, action, children }) => {
  const { accessRights } = useContext(AuthContext);
  const hasPermission = () => {
    return accessRights.some(
      (right) => right.routePath === path && right.rightId === action,
    );
  };
  return hasPermission() ? children : null;
};

export default PermissionGuard;
