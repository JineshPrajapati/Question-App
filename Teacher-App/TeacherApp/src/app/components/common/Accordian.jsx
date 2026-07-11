import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Accordian({
  items,
  renderOption,
  setActiveStep,
  activeStep,
}) {
  // const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setActiveStep(index);
  };

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-2 md:gap-4">
      {items?.map((item, index) => (
        <div
          key={index}
          className={`rounded-lg border ${index == items.length - 1 && "flex flex-1 flex-col overflow-hidden"} border-gray-200`}
        >
          <button
            onClick={() => handleToggle(index)}
            className="flex w-full items-center justify-between bg-white p-4 transition-all duration-300 hover:bg-gray-50"
          >
            <h3 className="text-base font-medium text-gray-900 md:text-lg">
              {index + 1}. {item.title}
            </h3>
            <span className="text-primary">
              {activeStep === index ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                // <IoIosArrowUp className="w-5 h-5" />
                // <IoIosArrowDown clitemsassName="w-5 h-5" />
                <ArrowDownIcon className="h-5 w-5" />
              )}
            </span>
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              activeStep === index
                ? "h-full overflow-hidden opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="h-full bg-white px-4 py-4 text-gray-800">
              {renderOption(item, index)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
