import React, { useState } from "react";
import clsx from "clsx";

export default function AccordionStepper({
  children,
  steps,
  activeStep,
  setActiveStep,
  activeSubStep,
  setActiveSubStep,
  myDetailsLoading,
  stepperActions,
  validateErrors,
  submitingData,
  myDetails,
  handleSubmitForm,
  handleNextStep,
  teacherId,
}) {
  const [stepValidations, setStepValidations] = useState({});

  const setStepValidity = (stepIndex, isValid) => {
    setStepValidations((prev) => ({
      ...prev,
      [stepIndex]: isValid,
    }));
  };

  return (
    <div
      className={`flex h-full flex-1 flex-col rounded-xl ${steps.length > 1 && "border border-gray-300"} `}
    >
      {steps.length > 1 && (
        <div className="p-3">
          <h2 className="text-left text-lg font-semibold">
            {steps[activeStep].title}
          </h2>
        </div>
      )}

      <div
        className={`flex h-full flex-1 flex-col overflow-hidden ${steps.length > 1 && "px-3"} `}
      >
        <div className="flex h-full flex-1 flex-col gap-2 overflow-y-auto pr-1 pb-2">
          {steps[activeStep].subSteps.map((subStep, subIndex) => {
            const isOpen = activeSubStep === subIndex;
            return (
              <div
                key={subIndex}
                className={clsx(
                  "flex flex-col overflow-hidden rounded-lg border",
                  isOpen ? "border-gray-400" : "border-gray-300",
                )}
              >
                <button
                  onClick={() => setActiveSubStep(subIndex)}
                  className={clsx(
                    "sticky top-0 z-10 flex h-10 w-full items-center justify-between px-4 text-left text-sm font-medium transition-colors",
                    isOpen
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                  )}
                >
                  <span className="truncate">
                    {subStep.step} {subStep.isOptional ? "(Optional)" : ""}
                  </span>
                  {steps[activeStep].subSteps.length > 1 && (
                    <span>{isOpen ? "▲" : "▼"}</span>
                  )}
                </button>

                {isOpen && (
                  <div className="max-h-full flex-1 overflow-y-auto bg-white px-4 py-3">
                    {React.cloneElement(children, {
                      validateErrors,
                      handleSubmitForm,
                      myDetailsLoading,
                      handleNextStep,
                      myDetails,
                      teacherId,
                      submitingData,
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* <div className="mt-auto p-3">{stepperActions()}</div> */}
    </div>
  );
}
