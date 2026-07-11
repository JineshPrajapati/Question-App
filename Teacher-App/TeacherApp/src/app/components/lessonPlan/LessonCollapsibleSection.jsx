import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const LessonCollapsible = ({
  header,
  actions,
  children,
  showOpened = false,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(showOpened || defaultOpen);

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">{header}</div>

        <div className="flex items-center gap-2">
          {actions}
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500 transition-transform duration-300" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300" />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden px-4 pb-4">{children}</div>
      </div>
    </div>
  );
};

export default LessonCollapsible;
