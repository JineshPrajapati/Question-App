import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export const SuccessModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
          <div>
            {/* Success Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon
                className="h-8 w-8 text-green-600"
                aria-hidden="true"
              />
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-semibold text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-700">{message}</p>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="bg-primary hover:bg-primary-dark focus:ring-primary inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
              onClick={onClose}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
