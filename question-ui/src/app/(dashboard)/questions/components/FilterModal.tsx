// components/FilterModal.tsx
"use client";
import { useQuestionFiltersContext } from "../hooks/QuestionFiltersContext";
import { X } from "lucide-react";

type FilterModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function FilterModal({ open, onClose }: FilterModalProps) {
  const {
    filters,
    setFilters,
    mediums,
    streams,
    standards,
    subjects,
    chapters,
    topics,
    setStep,
  } = useQuestionFiltersContext();

  if (!open) return null;

  const hasAnySelection =
    filters.stream ||
    filters.medium ||
    filters.standards.length > 0 ||
    filters.subjects.length > 0 ||
    filters.chapters.length > 0 ||
    filters.topics.length > 0;

  const handleApply = () => {
    // Decide the starting step based on deepest selection
    if (filters.topics.length > 0) {
      setStep("questions");
    } else if (filters.chapters.length > 0) {
      setStep("topic");
    } else if (filters.subjects.length > 0) {
      setStep("chapter");
    } else if (filters.standards.length > 0) {
      setStep("subject");
    } else if (filters.stream && filters.medium) {
      setStep("standard");
    } else {
      setStep("standard");
    }

    onClose();
  };

  const handleReset = () => {
    setFilters({
      medium: "",
      stream: "",
      standards: [],
      subjects: [],
      chapters: [],
      topics: [],
    });
    setStep("standard");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Stream */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Stream
            </label>
            <select
              value={filters.stream}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  stream: e.target.value,
                  standards: [],
                  subjects: [],
                  chapters: [],
                  topics: [],
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select stream...</option>
              {streams.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Medium */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Medium
            </label>
            <select
              value={filters.medium}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  medium: e.target.value,
                  standards: [],
                  subjects: [],
                  chapters: [],
                  topics: [],
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select medium...</option>
              {mediums.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional: pre-select standards (if you want users to narrow down early) */}
          {standards.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Standard(s){" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 grid grid-cols-2 gap-2">
                {standards.map((s) => (
                  <label
                    key={s.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.standards.includes(s.value)}
                      onChange={(e) => {
                        const newStandards = e.target.checked
                          ? [...filters.standards, s.value]
                          : filters.standards.filter((id) => id !== s.value);
                        setFilters({
                          ...filters,
                          standards: newStandards,
                          subjects: [],
                          chapters: [],
                          topics: [],
                        });
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* You can add subjects/chapters/topics pre-selection similarly if desired */}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={!hasAnySelection}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!filters.stream || !filters.medium}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Apply & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
