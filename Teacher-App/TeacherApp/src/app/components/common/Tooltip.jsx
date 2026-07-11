import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const Tooltip = ({
  children,
  content,
  isFullWidth = false,
  maxWidth = "320px",
  delay = 100,
}) => {
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [align, setAlign] = useState("center");
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const timeoutRef = useRef(null);

  const showTooltip = (e) => {
    e.stopPropagation();
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      setReady(true);
    }, delay);
  };

  const hideTooltip = (e) => {
    e.stopPropagation();
    clearTimeout(timeoutRef.current);
    setReady(false);
    setTimeout(() => setVisible(false), 100);
  };

  useEffect(() => {
    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const tooltipHeight = tooltipRef.current.offsetHeight;
      const screenWidth = window.innerWidth;

      let left = triggerRect.left + triggerRect.width / 2;
      let top = triggerRect.top - tooltipHeight - 8; // 8px spacing above

      const spaceLeft = triggerRect.left;
      const spaceRight = screenWidth - triggerRect.right;

      if (spaceRight < tooltipWidth && spaceLeft > tooltipWidth) {
        setAlign("left");
        left = triggerRect.right;
      } else if (spaceLeft < tooltipWidth && spaceRight > tooltipWidth) {
        setAlign("right");
        left = triggerRect.left;
      } else {
        setAlign("center");
      }

      setPosition({
        top: top + window.scrollY,
        left: left + window.scrollX,
      });
    };

    if (ready) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [ready]);

  const positionClass = {
    center: "-translate-x-1/2",
    left: "-translate-x-full",
    right: "translate-x-0",
  }[align];

  return (
    <>
      <span
        ref={triggerRef}
        className="relative z-10 inline-block"
        onPointerEnter={showTooltip}
        onPointerLeave={hideTooltip}
      >
        {children}
      </span>

      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-[99999] ${isFullWidth && "w-full"} rounded-lg bg-gray-50 px-4 py-3 text-sm whitespace-normal text-gray-800 shadow-xl transition-opacity duration-150 ease-out ${ready ? "opacity-100" : "opacity-0"} ${positionClass} pointer-events-auto`}
            style={{
              top: position.top,
              left: position.left,
              maxWidth,
            }}
          >
            {content}

            {/* Optional arrow */}
            {/* <div className="absolute top-full left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white shadow-sm z-[-1]" /> */}
          </div>,
          document.body,
        )}
    </>
  );
};
