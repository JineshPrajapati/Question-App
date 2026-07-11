"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon } from "lucide-react";
import FilterModal from "./components/FilterModal";
import AccordionStepper from "./components/Stepper";
import { QuestionFiltersProvider } from "./hooks/QuestionFiltersContext";
import QuestionSections from "./components/QuestionSections";

export default function Questions() {
  const [openFilter, setOpenFilter] = useState(false);
  const [showStepper, setShowStepper] = useState(true);

  return (
    <QuestionFiltersProvider>
      <div className="p-2 max-h-[100vh] space-y-4 overflow-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Question Paper Generator</h1>
          <button onClick={() => setOpenFilter(true)}>
            <FunnelIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>
        {/* Stepper Toggle Button */}
        <div className="flex justify-between items-center bg-gray-200 p-2 rounded-lg mb-1">
          <h2 className="font-medium">Filters</h2>
          <button
            onClick={() => setShowStepper(!showStepper)}
            className="flex items-center gap-1 text-sm"
          >
            {showStepper ? "Hide" : "Show"}
            {showStepper ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Accordion Stepper */}
        {showStepper && <AccordionStepper />}
        {/* <AccordionStepper /> */}
        <QuestionSections />

        <FilterModal open={openFilter} onClose={() => setOpenFilter(false)} />
      </div>
    </QuestionFiltersProvider>
  );
}
