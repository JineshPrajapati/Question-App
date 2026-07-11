import { useLocation } from "react-router";
import { AuthContext } from "../../../contexts/authContext";
import { useContext } from "react";
import { toast } from "react-toastify";

const ToggleSwitch = ({
  isOn,
  onToggle,
  needToCheckPermission = true,
  action = 6,
  mainColor = "bg-[#00446dad]",
}) => {
  const location = useLocation();
  const path = location.pathname;
  const { accessRights } = useContext(AuthContext);

  const hasPermission = () => {
    return accessRights.some(
      (right) => right.routePath === path && right.rightId === action,
    );
  };

  return (
    <div
      className={`flex cursor-pointer items-center select-none`}
      onClick={() =>
        needToCheckPermission
          ? hasPermission()
            ? onToggle()
            : toast.error("You don’t have permission to do this.")
          : onToggle()
      }
    >
      <div
        className={`relative flex h-[22px] w-10 items-center rounded-full p-[5px] transition-all ${isOn ? mainColor : "bg-gray-300"}`}
      >
        <div
          className={`h-[14px] w-[14px] transform rounded-full bg-white shadow-md transition-all ${isOn ? "translate-x-4" : "translate-x-0"}`}
        ></div>
      </div>
      {/* <span className="ml-2 text-gray-700 text-sm">
        {isOn ? "Enabled" : "Disabled"}
      </span> */}
    </div>
  );
};

export default ToggleSwitch;
