"use client";

import { createContext, useContext } from "react";
import { useQuestionFilters } from "./useQuestionFilters";

const QuestionFiltersContext = createContext<ReturnType<
  typeof useQuestionFilters
> | null>(null);

export function QuestionFiltersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useQuestionFilters();
  return (
    <QuestionFiltersContext.Provider value={value}>
      {children}
    </QuestionFiltersContext.Provider>
  );
}

export function useQuestionFiltersContext() {
  const ctx = useContext(QuestionFiltersContext);
  if (!ctx) {
    throw new Error(
      "useQuestionFiltersContext must be used inside QuestionFiltersProvider",
    );
  }
  return ctx;
}
