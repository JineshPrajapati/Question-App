"use client";

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  delay?: number;
  maxWidth?: string;
  isFullWidth?: boolean;
}

export default function Tooltip({
  children,
  content,
  delay = 100,
  maxWidth = "320px",
  isFullWidth = false,
}: TooltipProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<"top" | "bottom">("top");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* -------------------- Mount Fix (Next.js) -------------------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* -------------------- Show / Hide -------------------- */
  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  /* -------------------- Position Calculation -------------------- */
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const tooltipHeight = tooltipRef.current.offsetHeight;
    const screenWidth = window.innerWidth;

    let top;
    let left;
    let newPlacement: "top" | "bottom";

    // Top / Bottom placement
    if (triggerRect.top > tooltipHeight + 8) {
      top = triggerRect.top - tooltipHeight - 8;
      newPlacement = "top";
    } else {
      top = triggerRect.bottom + 8;
      newPlacement = "bottom";
    }

    // Horizontal center
    left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;

    // Prevent overflow
    if (left < 8) left = 8;
    if (left + tooltipWidth > screenWidth - 8) {
      left = screenWidth - tooltipWidth - 8;
    }

    setPosition({
      top: top + window.scrollY,
      left: left + window.scrollX,
    });

    setPlacement(newPlacement);
  };

  useEffect(() => {
    if (visible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible]);

  /* -------------------- Attach Events to Child -------------------- */
  const child = isValidElement(children)
    ? cloneElement(children as any, {
        ref: (node: HTMLElement) => {
          triggerRef.current = node;
        },
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      })
    : children;

  /* -------------------- Render -------------------- */
  return (
    <>
      {child}

      {mounted &&
        visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-[99999] rounded-lg bg-white text-gray-900 px-3 py-1.5 text-xs shadow-lg 
              transition-opacity duration-150 pointer-events-none
              ${isFullWidth ? "w-full" : "max-w-[320px]"}`}
            style={{
              top: position.top,
              left: position.left,
              maxWidth,
            }}
          >
            {content}

            {/* Arrow */}
            <div
              className={`absolute h-2 w-2 rotate-45 bg-white ${
                placement === "top"
                  ? "bottom-[-4px] left-1/2 -translate-x-1/2"
                  : "top-[-4px] left-1/2 -translate-x-1/2"
              }`}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
