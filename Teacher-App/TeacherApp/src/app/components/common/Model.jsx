import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Model = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
          <div className="z-10 mr-4 ml-4 w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-300 p-4">
              <h2 className="text-lg font-medium text-gray-900">{title}</h2>
              <button
                className="focus:ring-primary rounded-md text-gray-400 hover:text-gray-700 focus:ring-2 focus:outline-none"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model;
