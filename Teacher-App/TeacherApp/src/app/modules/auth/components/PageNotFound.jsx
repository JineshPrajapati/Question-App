import React from "react";
import { PrimaryButton } from "../../../components/form/FormElements";
import { HomeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function PageNotFound() {
  return (
    <div>
      <div>
        {/* Animated 404 Icon */}
        <ExclamationTriangleIcon className="mx-auto h-24 w-24 animate-bounce text-yellow-500" />

        {/* Title */}
        <h1 className="mt-6 text-4xl font-extrabold text-gray-800">
          404 - Page Not Found
        </h1>

        {/* Message */}
        <p className="mt-3 text-lg text-gray-800">
          Oops! The page you're looking for doesn't exist or was moved.
        </p>

        {/* Action Button */}
        <PrimaryButton
          className="bg-primary hover:bg-primary mt-8 flex transform items-center justify-center gap-2 rounded-lg px-6 py-3 text-white shadow-md transition-transform hover:scale-105"
          onClick={() => (window.location.href = "/")}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="font-semibold">Back to Home</span>
        </PrimaryButton>
      </div>
    </div>
  );
}
