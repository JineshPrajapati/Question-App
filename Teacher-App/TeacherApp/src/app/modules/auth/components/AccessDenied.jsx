import React from "react";
import { PrimaryButton } from "../../../components/form/FormElements";
import {
  LockClosedIcon,
  ArrowLeftCircleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export function AccessDenied() {
  return (
    <>
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md">
          <LockClosedIcon className="mx-auto mb-4 h-16 w-16 text-red-500" />

          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>

          <p className="mt-2 text-gray-800">
            You do not have the required permissions to access this page. Please
            contact your administrator.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <PrimaryButton
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-gray-800 transition hover:bg-gray-400"
              onClick={() => window.history.back()}
            >
              <ArrowLeftCircleIcon className="h-5 w-5" />
              Go Back
            </PrimaryButton>

            <PrimaryButton
              className="bg-primary hover:bg-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-white transition"
              onClick={() => (window.location.href = "/")}
            >
              <HomeIcon className="h-5 w-5" />
              Go to Dashboard
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
}
