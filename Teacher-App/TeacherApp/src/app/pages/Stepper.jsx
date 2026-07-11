import React from "react";
import { Check } from "lucide-react";

export const Stepper = ({ steps, currentStep }) => {
  const calculateProgress = () => (currentStep / (steps.length - 1)) * 100;
  const primaryColor = "#00446d";

  return (
    <div className="max-w-8xl mx-auto w-full px-4">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-300 shadow-sm">
        <div
          className="absolute h-full transition-all duration-500 ease-in-out"
          style={{
            width: `${calculateProgress()}%`,
            background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor})`,
            boxShadow: `0 0 10px ${primaryColor}88`,
          }}
        />
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center"
            >
              {index < steps.length - 1 && (
                <div
                  className="absolute top-4 left-1/2 hidden h-1 w-full sm:block"
                  style={{
                    width: "100%",
                    transform: "translateX(50%)",
                    backgroundColor:
                      index < currentStep ? primaryColor : "#d1d5db",
                    boxShadow:
                      index < currentStep
                        ? `0 0 8px ${primaryColor}88`
                        : "none",
                    zIndex: 0,
                  }}
                />
              )}

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-300 ${
                  isCompleted
                    ? "text-white"
                    : isCurrent
                      ? "scale-110 border-2"
                      : "border-2 border-gray-300 bg-white text-gray-400"
                }`}
                style={{
                  backgroundColor: isCompleted
                    ? primaryColor
                    : isCurrent
                      ? "#CCE5F6"
                      : "white",
                  color: isCompleted || isCurrent ? primaryColor : undefined,
                  borderColor: isCurrent ? primaryColor : undefined,
                  boxShadow: isCurrent
                    ? `0 0 8px ${primaryColor}88`
                    : undefined,
                }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              <p
                className="mt-3 w-24 text-center text-sm font-semibold"
                style={{
                  color: isCompleted || isCurrent ? primaryColor : "#6B7280",
                }}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
