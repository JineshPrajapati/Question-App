import { useState } from "react";
import clsx from "clsx";
import HorizontalStepper from "./HorizontalStepper";
import AccordionStepper from "./HorizontalStepper";

export default function NestedStepper({
  steps,
  activeStep,
  activeSubStep,
  stepperActions = () => {},
  validateErrors,
  handleSubmitForm,
  handleNextStep = () => {},
  setActiveStep,
  submitingData,
  myDetails,
  teacherId,
  myDetailsLoading,
  setActiveSubStep,
}) {
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded md:flex-row">
      {/* Vertical Stepper */}
      {steps.length > 1 && (
        <div className="flex min-w-[200px] flex-col gap-3">
          {steps.map((step, index) => (
            <div
              key={index}
              onClick={() => {
                setActiveSubStep(0);
                setActiveStep(index);
              }}
              className={clsx(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-left text-sm",
                activeStep === index
                  ? "bg-primary font-medium text-white"
                  : "border border-gray-400 bg-white",
              )}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${activeStep === index ? "text-primary border-white bg-white" : "border-gray-400"} text-xs font-medium`}
              >
                {index + 1}
              </div>{" "}
              {step.title}
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Sub-Stepper */}

      <AccordionStepper
        steps={steps}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        activeSubStep={activeSubStep}
        setActiveSubStep={setActiveSubStep}
        myDetails={myDetails}
        teacherId={teacherId}
        validateErrors={validateErrors}
        handleSubmitForm={handleSubmitForm}
        handleNextStep={handleNextStep}
        myDetailsLoading={myDetailsLoading}
        stepperActions={stepperActions}
        submitingData={submitingData}
      >
        {steps[activeStep].subSteps[activeSubStep].component}
      </AccordionStepper>
    </div>
  );
}
