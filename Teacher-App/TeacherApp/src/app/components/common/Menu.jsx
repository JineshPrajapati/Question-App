import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const Menu = ({ trigger, items = [] }) => {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, opacity: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smart position on open
  useEffect(() => {
    if (open) {
      const updatePosition = () => {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const menu = menuRef.current;
        if (!menu) return;

        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;

        const spaceRight = window.innerWidth - buttonRect.right;
        const spaceLeft = buttonRect.left;
        const spaceBottom = window.innerHeight - buttonRect.bottom;

        const left =
          spaceRight >= menuWidth
            ? buttonRect.left + window.scrollX
            : buttonRect.right - menuWidth + window.scrollX;

        const top =
          spaceBottom >= menuHeight
            ? buttonRect.bottom + window.scrollY
            : buttonRect.top - menuHeight + window.scrollY;

        setMenuStyle({
          top,
          left,
          opacity: 1,
        });
      };

      requestAnimationFrame(updatePosition);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [open]);

  return (
    <>
      <div
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-block cursor-pointer"
      >
        {trigger}
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: `${menuStyle.top}px`,
              left: `${menuStyle.left}px`,
              zIndex: 9999,
              opacity: menuStyle.opacity,
              transition: "opacity 0.15s ease",
            }}
            className="min-w-[10rem] rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <ul className="py-2">
              {items.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Menu;
