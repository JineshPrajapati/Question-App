import React, { useState, useRef, useEffect } from "react";

const SortByMenuSmart = ({ options, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState("bottom-right"); // default
  const buttonRef = useRef(null);
  const [selected, setSelected] = useState(options[0]); // initially nothing selected

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const spaceBottom = windowHeight - rect.bottom;
    const spaceTop = rect.top;
    const spaceRight = windowWidth - rect.right;
    const spaceLeft = rect.left;

    let pos = "";
    pos += spaceBottom < 200 && spaceTop > spaceBottom ? "top" : "bottom";
    pos += "-";
    pos += spaceRight < 200 && spaceLeft > spaceRight ? "left" : "right";
    setPosition(pos);
  };

  useEffect(() => {
    if (isOpen) calculatePosition();
    const handleResize = () => isOpen && calculatePosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const handleSelect = (option) => {
    setSelected(option);
    onSortChange(option.value, option.direction);
    setIsOpen(false);
  };

  const getMenuPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "bottom-full right-0 mb-2";
      case "top-left":
        return "bottom-full left-0 mb-2";
      case "bottom-left":
        return "top-full left-0 mt-2";
      case "bottom-right":
      default:
        return "top-full right-0 mt-2";
    }
  };

  const displayLabel = selected ? `Sort By: ${selected.label}` : "Sort By";

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="focus:ring-primary flex min-w-[160px] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:outline-none"
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`h-4 w-4 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          className={`absolute z-20 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${getMenuPositionClasses()}`}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt)}
              className="cursor-pointer px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SortByMenuSmart;
