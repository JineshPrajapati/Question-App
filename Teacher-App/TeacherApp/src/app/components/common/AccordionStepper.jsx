import React from "react";
import clsx from "clsx";

/**
 * Accordion Stepper Component
 *
 * Props:
 * - steps: [{ title: string, content: ReactNode }]
 * - activeStep: number
 * - setActiveStep: (index: number) => void
 */
export default function AccordionStepper({ steps, activeStep, setActiveStep }) {
  return (
    <div className="flex h-full flex-1 flex-col rounded-xl border border-gray-300 py-4">
      {/* Step Title */}
      {/* <div className="p-3">
        <h2 className="text-left text-lg font-semibold">
          {steps[activeStep]?.title}
        </h2>
      </div> */}

      {/* Steps Accordion */}
      <div className="flex h-full flex-1 flex-col overflow-hidden px-3">
        <div className="flex h-full flex-1 flex-col gap-2 overflow-y-auto pr-1 pb-2">
          {steps.map((step, index) => {
            const isOpen = activeStep === index;
            return (
              <div
                key={index}
                className={clsx(
                  "flex flex-col overflow-hidden rounded-lg border",
                  isOpen ? "border-gray-400" : "border-gray-300",
                )}
              >
                {/* Step Header */}
                <button
                  onClick={() => setActiveStep(index)}
                  className={clsx(
                    "sticky top-0 z-10 flex h-10 w-full items-center justify-between px-4 text-left text-sm font-medium transition-colors",
                    isOpen
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                  )}
                >
                  <span className="truncate">{step.title}</span>
                  {steps.length > 1 && <span>{isOpen ? "▲" : "▼"}</span>}
                </button>

                {/* Step Content */}
                {isOpen && (
                  <div className="max-h-full flex-1 overflow-y-auto bg-white px-4 py-3">
                    {step.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
