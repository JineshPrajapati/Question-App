import { useState } from "react";

export const Multitoggle = ({
  options = [
    { action: 1, status: "Active" },
    { action: -1, status: "All" },
    { action: 0, status: "Deactive" },
  ],
  onChange,
}) => {
  const [selected, setSelected] = useState(options[1].status);

  const handleSelect = (option) => {
    setSelected(option.status);
    if (onChange) onChange(option.action);
  };

  return (
    <div className="flex w-fit items-center rounded-full border border-gray-300 bg-white p-1 shadow-sm dark:border-gray-600 dark:bg-gray-800">
      {options.map((option) => (
        <button
          key={option.status}
          onClick={() => handleSelect(option)}
          className={`min-w-[50px] rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
            ${
              selected === option.status
                ? "bg-primary text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
        >
          {option.status}
        </button>
      ))}
    </div>
  );
};
