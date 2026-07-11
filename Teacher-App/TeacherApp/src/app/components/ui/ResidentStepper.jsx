import { useState } from "react";
import clsx from "clsx";
import {
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from "../form/FormElements";

const steps = [
  {
    title: "Resident Information",
    subSteps: [
      { step: "Basic Information", isOptional: false },
      { step: "Family/Emergency Contact", isOptional: false },
      { step: "Resident's Responsible Party", isOptional: false },
    ],
  },
  {
    title: "Resident LifeStyle Biography",
    subSteps: [
      { step: "General Information", isOptional: false },
      { step: "Family and Friends", isOptional: false },
      { step: "Personal Characteristics", isOptional: false },
    ],
  },
  {
    title: "Medical Evaluation",
    subSteps: [
      { step: "Final review", isOptional: false },
      { step: "Go live", isOptional: false },
    ],
  },
  ,
  {
    title: "Physician Move-In Order",
    subSteps: [
      { step: "Final review", isOptional: false },
      { step: "Go live", isOptional: false },
    ],
  },

  {
    title: "Food Service Information",
    subSteps: [
      { step: "Final review", isOptional: false },
      { step: "Go live", isOptional: false },
    ],
  },
];

export default function NestedStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);

  return (
    <div className="flex w-full flex-col gap-2 p-4 md:flex-row">
      {/* Vertical Stepper */}
      <div className="flex min-w-[200px] flex-col gap-3">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={clsx(
              "text-md cursor-pointer rounded-lg px-5 py-3 text-left",
              activeStep === index ? "bg-primary text-white" : "bg-gray-200",
            )}
          >
            {index + 1}. {step.title}
          </button>
        ))}
      </div>

      {/* Horizontal Sub-Stepper */}

      <div className="flex h-full flex-1 flex-col rounded-xl border-1 border-gray-300 p-3">
        <h2 className="mb-4 text-left text-lg font-semibold">
          {steps[activeStep].title}
        </h2>
        <div className="relative flex w-full items-center justify-between">
          {steps[activeStep].subSteps.map((subStep, subIndex) => (
            <div key={subIndex} className="flex w-full flex-col justify-center">
              <div className="flex w-full items-center">
                {subIndex > 0 &&
                  subIndex <= steps[activeStep].subSteps.length - 1 && (
                    <div className={clsx("h-1 flex-grow bg-gray-300")} />
                  )}
                <button
                  onClick={() => setActiveSubStep(subIndex)}
                  className={clsx(
                    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-semibold text-white",
                    subIndex === activeSubStep ? "bg-primary" : "bg-gray-400",
                  )}
                >
                  {subIndex + 1}
                </button>
                {subIndex < steps[activeStep].subSteps.length - 1 && (
                  <div
                    className={clsx(
                      "h-1 flex-grow bg-gray-300",
                      //   subIndex == activeSubStep ? "bg-primary" : "bg-gray-300"
                    )}
                  />
                )}
              </div>
              {/* <div className="flex items-center w-full">
                  <p className="text-sm font-medium text-center">{subStep}</p>
                </div> */}
            </div>
          ))}
        </div>
        {/* //max-w-xl */}
        <div className="mt-1 flex w-full justify-between">
          {steps[activeStep].subSteps.map((subStep, subIndex) => (
            <p
              key={subIndex}
              className={clsx(
                "text-sm font-medium",
                subIndex === steps[activeStep].subSteps.length - 1
                  ? "text-right"
                  : "text-left",
                subIndex === activeSubStep ? "text-primary" : "text-gray-700",
              )}
            >
              {subStep.step} {subStep.isOptional ? "(Optional)" : ""}
            </p>
          ))}
        </div>
        <div className="mt-5 flex w-full justify-between">
          <div className="flex h-[50px] w-full flex-col rounded-xl border-1 border-gray-300 p-2">
            <p>{/* {steps[activeStep].subSteps[activeSubStep]} */}</p>
          </div>
        </div>
        <div className="right-0 bottom-0 flex w-full justify-end gap-2 p-2">
          {activeSubStep > 0 && (
            <button
              onClick={() => setActiveSubStep(activeSubStep - 1)}
              className="bg-primary hover:bg-primary rounded px-4 py-2 text-white"
            >
              Previous
            </button>
          )}
          {activeSubStep < steps[activeStep].subSteps.length - 1 && (
            <button
              onClick={() => setActiveSubStep(activeSubStep + 1)}
              className="bg-primary hover:bg-primary rounded px-4 py-2 text-white"
            >
              Next
            </button>
          )}
          {activeSubStep === steps[activeStep].subSteps.length - 1 && (
            <button className="bg-primary hover:bg-primary rounded px-4 py-2 text-white">
              Save & Continue
            </button>
          )}
          {activeStep === steps.length - 1 &&
            activeSubStep === steps[activeStep].subSteps.length - 1 && (
              <button className="bg-primary hover:bg-primary rounded px-4 py-2 text-white">
                Finish
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
