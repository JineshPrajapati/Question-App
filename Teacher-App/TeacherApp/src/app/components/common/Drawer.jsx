import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
 
const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "500px",
  isFlexible = false,
}) => {
  const [dynamicMaxWidth, setDynamicMaxWidth] = useState(maxWidth);
  const [isMobile, setIsMobile] = useState(false);
 
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
 
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
 
    if (!isFlexible) {
      const updateMaxWidth = () => {
        if (window.innerWidth < 490) {
          setDynamicMaxWidth("350px");
        } else {
          setDynamicMaxWidth(maxWidth);
        }
      };
 
      updateMaxWidth();
      window.addEventListener("resize", updateMaxWidth);
 
      return () => {
        window.removeEventListener("resize", updateMaxWidth);
        window.removeEventListener("resize", checkIsMobile);
      };
    }
 
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [maxWidth, isFlexible]);
 
  if (!isOpen) return null;
 
  const drawerStyle = isFlexible
    ? isMobile
      ? { width: "100vw" } // force full width on mobile even if flexible
      : { width: "auto" }  // shrink-wrap on larger screens
    : { width: "100vw", maxWidth: dynamicMaxWidth };
 
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50" />
 
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div
            style={drawerStyle}
            className="w-screen max-w-full sm:max-w-none"
          >
            <div className="flex h-full flex-col bg-white shadow-xl">
              <div className="flex w-full justify-between border-b border-gray-300 px-4 py-3">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                </div>
                <button
                  className="rounded-md text-gray-400 hover:text-gray-700 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="relative flex-1 overflow-y-auto">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Drawer;