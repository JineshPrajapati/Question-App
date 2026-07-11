import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="focus:ring-primary focus:border-primary block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-400 focus:placeholder-gray-400 focus:ring-1 focus:outline-none sm:text-sm"
        placeholder={placeholder}
      />
    </div>
  );
};
