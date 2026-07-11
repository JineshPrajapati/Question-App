import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Check, CheckCircle } from "lucide-react";
import { useState } from "react";
import { FormInput } from "../form/FormElements";
import { SearchBar } from "../common/SearchBar";
export const MultiGridSelector = ({
  renderOption,
  showSearchBar = true,
  isEditable,
  data,
  searchPlaceholder,
  errorHandler,
  selected,
  setSelected,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex h-full w-full flex-col gap-4 space-y-3 space-x-3 rounded-md border border-gray-300 p-4">
      {showSearchBar && (
        <div className="flex w-[200px] flex-col">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-72"
          />
        </div>
      )}

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
        {data.map((item, index) => (
          <div
            onClick={() => {
              if (!isEditable) return;
              if (selected.includes(item.value)) {
                const newSelected = selected.filter((selectedItem) => {
                  return selectedItem !== item.value;
                });
                setSelected(newSelected);
              } else {
                setSelected([...selected, item.value]);
              }
            }}
            key={index}
            className={`relative h-full w-full cursor-pointer overflow-hidden rounded-md border border-gray-300 ${errorHandler(item) ? "border border-red-500" : selected.includes(item.value) ? "outline-primary outline-2" : ""}`}
          >
            <div
              // onClick={() => {
              //   if (selected.includes(item.value)) {
              //     const newSelected = selected.filter((selectedItem) => {
              //       return selectedItem !== item.value;
              //     });
              //     setSelected(newSelected);
              //   } else {
              //     setSelected([...selected, item.value]);
              //   }
              // }}
              className={`absolute ${!isEditable && "hidden"} top-1 right-1 ${selected.includes(item.value) ? "bg-primary" : "hover:border-primary bg-white hover:border-2"} flex h-4 w-4 items-center justify-center rounded-full border border-gray-500`}
            >
              <Check className="h-3 w-3 text-white" />
              {/* <img src="/assets/avatars/150-1.jpg" alt="avatar" className="w-full h-full object-cover rounded-md" /> */}
            </div>
            {renderOption(item, selected.includes(item.value))}
          </div>
        ))}
      </div>
    </div>
  );
};
