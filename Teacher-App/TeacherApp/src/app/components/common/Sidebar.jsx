import { useContext, useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Home,
  BarChart,
  Settings,
  Bell,
  ShoppingBag,
  User,
  Menu,
  LogOut,
  Users,
  Shield,
  ShieldUserIcon,
  MessageSquareIcon,
} from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router";
import { useSidebar } from "../../../contexts/sidebarContext";
import { useIsMobile } from "../../hooks/useMobile";
import { cn } from "../../../lib/utility";
import { AuthContext } from "../../../contexts/authContext";
import { NAV_ITEMS } from "../../../lib/navbarData";
import { useSignalR } from "../../../contexts/SignalRContext";
import { useNotification } from "../../../contexts/NotificationContext";
import Icon from "./MyIcon";

export default function Sidebar() {
  const { isOpen, toggle } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { logout, permissions = null } = useContext(AuthContext);
  const [menuData, setMenudata] = useState([]); // Handle logout (placeholder function)
  const navigate = useNavigate();
  const { hasUnreadChat, setHasUnreadChat } = useSignalR();
  const { hasUnreadMessages, setHasUnreadMessages } = useNotification();

  useEffect(() => {
    setHasUnreadChat(hasUnreadMessages);
  }, [hasUnreadMessages]);

  const handleLogout = () => {
    logout();
  };
  useEffect(() => {
    if (permissions) {
      const filteredNavItems = NAV_ITEMS.filter((item) => {
        if (!item.isAuthorized) return true;
        const pathPerm = permissions[item.path] || null;
        if (!pathPerm) return false; // Hide items without permissions
        if (item.isAuthorized && pathPerm.split("")[0] == "1") return true; // Always show authorized items
        // if (permissions[item.path]) return true; // Show if permission exists
        return false; // Hide otherwise
      });
      setMenudata(filteredNavItems);
    }
  }, [permissions]);
  return (
    <>
      {!isOpen && isMobile && (
        <button
          className="bg-primary fixed top-4 left-4 z-50 rounded-md p-2 text-white lg:hidden"
          onClick={toggle}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Desktop sidebar */}
      <div
        className={cn(
          "bg-primary z-40 flex h-full flex-col text-white shadow-xl transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-20",
          "hidden lg:block",
        )}
      >
        {/* Logo section */}
        <div className="flex h-[64px] items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {isOpen && (
              <img src="/assets/logo/whitelogo.png" className="h-[40px]" />
            )}
            <h1
              className={cn(
                "text-[18px] font-bold text-white transition-opacity duration-300",
                isOpen ? "opacity-100" : "hidden opacity-0",
              )}
            >
              Teacher App
            </h1>
          </div>
          <button
            onClick={toggle}
            className={cn(
              "hover:bg-primary-hover rounded-full p-2",
              isOpen ? "ml-auto" : "mx-auto",
            )}
          >
            {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-custom flex h-[calc(100%-106px)] flex-1 flex-col gap-2 overflow-visible px-3 py-4">
          {menuData.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (isMobile) toggle();
                }}
                className={cn(
                  "group relative flex items-center gap-4 rounded-lg px-3 py-3 transition-all",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <div className="relative">
                  {item.svg ? (
                    <Icon name={item.svg} size={20} color="white" />
                  ) : item.icon ? (
                    <item.icon size={20} />
                  ) : (
                    <img src={item.image} className="h-5 w-5" />
                  )}
                  {item.name === "Chat" && hasUnreadChat && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                {isOpen ? (
                  <span className="text-sm font-medium">{item.name}</span>
                ) : (
                  <div className="bg-primary absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all group-hover:opacity-100">
                    {item.name}
                  </div>
                )}

                {isActive && !isOpen && (
                  <div className="absolute left-0 h-8 w-1 rounded-r-md bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        {/*<div
            className={cn(
              "h-[42px] w-full border-t border-white/10 p-2",
              isOpen ? "px-4" : "flex justify-center",
            )}
          >
            {/* <button
              onClick={() => {
                navigate("/aiassistent");
              }}
              className="mb-2 flex cursor-pointer items-center gap-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition duration-200 ease-in-out hover:from-cyan-600 hover:to-blue-700"
            >
              <MessageSquareIcon className="h-4.5 w-4.5 text-white" />
              AI Assistance
            </button> */}

        {/*<button
              onClick={handleLogout}
              variant="ghost"
              title="Logout"
              size={isOpen ? "default" : "icon"}
              className={cn(
                "flex w-full items-center text-white/70 hover:bg-white/10 hover:text-white",
                !isOpen && "p-2",
              )}
            >
              <LogOut size={20} />
              {isOpen && <span className="ml-2 text-white">Logout</span>}
            </button>
          </div> */}
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={toggle} />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "bg-primary fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <h1 className="text-xl font-bold text-white">Teacher App</h1>
          <button
            onClick={toggle}
            className="hover:bg-primary-hover rounded-full p-2 text-white"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (isMobile) toggle();
                }}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-3 py-3 transition-all",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <div className="relative">
                  {item.icon ? (
                    <item.icon size={22} />
                  ) : (
                    <img src={item.image} className="h-5 w-5" />
                  )}
                  {item.name === "Chat" && hasUnreadChat && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile logout */}
        <div className="absolute bottom-1 w-full border-t border-white/10 p-2">
          <button
            onClick={handleLogout}
            variant="ghost"
            className="flex w-full items-center text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={20} />
            <span className="ml-2 text-white">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
