import React from "react";
import Select from "react-select";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const DropdownSelector = ({
  options = [],
  value = null,
  onChange = () => {},
  icon: Icon = ChevronDownIcon,
  placeholder = "Select...",
  className = "",
}) => {
  const selectedOption =
    options.find((option) => option.value === value) || null;

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={(selected) => onChange(selected.value)}
      isSearchable={false}
      placeholder={placeholder}
      className={`min-w-48 text-sm ${className}`}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: "#00446d", // Your custom purple
        },
      })}
      classNames={{
        control: () =>
          "min-h-[36px] text-sm border border-gray-300 rounded-md px-2 py-0 flex items-center hover:border-primary",
        option: ({ isFocused, isSelected }) =>
          `text-sm px-3 py-1 cursor-pointer ${
            isSelected
              ? "bg-primary text-white font-semibold"
              : isFocused
                ? "bg-gray-100 text-gray-700"
                : "text-gray-700"
          }`,
        dropdownIndicator: () => "text-primary hover:text-primary",
        indicatorSeparator: () => "bg-primary",
        valueContainer: () => "flex items-center gap-1",
        menu: () => "mt-1 shadow-lg border border-gray-200 rounded-md bg-white",
        singleValue: () => "text-gray-800",
        placeholder: () => "text-gray-400",
      }}
      components={{
        ValueContainer: ({ children, ...props }) => (
          <div className="flex items-center gap-1 pr-2 pl-1" {...props}>
            <div className="border-r border-gray-300 pr-1">
              <Icon className="text-primary h-4 w-4" />
            </div>
            {children}
          </div>
        ),
      }}
    />
  );
};

export default DropdownSelector;
