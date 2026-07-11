"use client";

import { useQuestionFiltersContext } from "../hooks/QuestionFiltersContext";

const levels = [
  { id: "standard", title: "Select Standard" },
  { id: "subject", title: "Select Subject" },
  { id: "chapter", title: "Select Chapter" },
  { id: "topic", title: "Select Topic" },
] as const;

type LevelId = (typeof levels)[number]["id"];

export default function AccordionStepper() {
  const {
    step,
    setStep,
    filters,
    setFilters,
    standards,
    subjects,
    chapters,
    topics,
    groupedTopics,
  } = useQuestionFiltersContext();

  const isAvailable = (level: LevelId): boolean => {
    if (level === "standard") return !!filters.stream && !!filters.medium;
    if (level === "subject") return filters.standards.length > 0;
    if (level === "chapter") return filters.subjects.length > 0;
    if (level === "topic") return filters.chapters.length > 0;
    return false;
  };

  const handleToggle = (level: LevelId) => {
    if (!isAvailable(level)) return;
    if (step === level) {
      setStep(null);
    } else {
      setStep(level);
    }
  };

  const getSelectedCount = (level: LevelId): number => {
    if (level === "standard") return filters.standards.length;
    if (level === "subject") return filters.subjects.length;
    if (level === "chapter") return filters.chapters.length;
    if (level === "topic") return filters.topics.length;
    return 0;
  };

  return (
    <div className="space-y-2 border rounded-lg overflow-hidden bg-white shadow-sm">
      {levels.map((lvl) => {
        const isOpen = step === lvl.id;
        const available = isAvailable(lvl.id);
        const disabled = !available;
        const count = getSelectedCount(lvl.id);

        return (
          <div key={lvl.id} className="border-b last:border-b-0">
            {/* Header */}
            <button
              type="button"
              onClick={() => handleToggle(lvl.id)}
              disabled={disabled}
              className={`
                w-full px-5 py-4 flex items-center justify-between text-left transition-colors
                ${isOpen ? "bg-blue-50" : "hover:bg-gray-50"}
                ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0
                    ${
                      isOpen
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }
                  `}
                >
                  {levels.findIndex((l) => l.id === lvl.id) + 1}
                </div>

                <div>
                  <div className="font-medium text-gray-900">{lvl.title}</div>
                  {count > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {count} selected
                    </div>
                  )}
                </div>
              </div>

              <span className="text-gray-500 text-xl font-medium">
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* Content */}
            {isOpen && (
              <div className="px-5 pb-5 pt-1 max-h-64 overflow-y-auto">
                {/* ── STANDARDS PANEL ──────────────────────────────────────── */}
                {lvl.id === "standard" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {standards.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-gray-500">
                        {filters.stream && filters.medium
                          ? "Loading standards..."
                          : "Select stream and medium first"}
                      </div>
                    ) : (
                      standards.map((s) => (
                        <label
                          key={s.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200 transition"
                        >
                          <input
                            type="checkbox"
                            checked={filters.standards.includes(s.value)}
                            onChange={(e) => {
                              const newStandards = e.target.checked
                                ? [...filters.standards, s.value]
                                : filters.standards.filter(
                                    (id) => id !== s.value,
                                  );

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
                          <span className="text-sm font-medium">{s.label}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}

                {/* ── SUBJECTS PANEL ───────────────────────────────────────── */}
                {lvl.id === "subject" && (
                  <div className="grid grid-cols-1 gap-3">
                    {subjects.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-gray-500">
                        Select at least one standard first
                      </div>
                    ) : (
                      subjects.map((s) => (
                        <label
                          key={s.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200 transition"
                        >
                          <input
                            type="checkbox"
                            checked={filters.subjects.includes(s.value)}
                            onChange={(e) => {
                              const newVal = e.target.checked
                                ? [...filters.subjects, s.value]
                                : filters.subjects.filter(
                                    (id) => id !== s.value,
                                  );
                              setFilters({
                                ...filters,
                                subjects: newVal,
                                chapters: [],
                                topics: [],
                              });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{s.label}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}

                {/* ── CHAPTERS PANEL ────────────────────── */}
                {lvl.id === "chapter" && (
                  <div className="grid grid-cols-1 gap-3">
                    {chapters.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-gray-500">
                        Select at least one subject first
                      </div>
                    ) : (
                      chapters.map((c) => (
                        <label
                          key={c.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200 transition"
                        >
                          <input
                            type="checkbox"
                            checked={filters.chapters.includes(c.value)}
                            onChange={(e) => {
                              const newVal = e.target.checked
                                ? [...filters.chapters, c.value]
                                : filters.chapters.filter(
                                    (id) => id !== c.value,
                                  );

                              setFilters({
                                ...filters,
                                chapters: newVal,
                                topics: [],
                              });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{c.label}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}

                {/* ── TOPIC PANEL ────────────────────── */}

                {lvl.id === "topic" && (
                  <div className="space-y-6">
                    {groupedTopics.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        Select at least one chapter first
                      </div>
                    ) : (
                      groupedTopics.map((chapter) => (
                        <div
                          key={chapter.ChapterId}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          {/* Chapter Heading */}
                          <h3 className="font-semibold text-blue-700 mb-3">
                            {chapter.ChapterName}
                          </h3>

                          {/* Topics Under Chapter */}
                          <div className="grid grid-cols-1 gap-3">
                            {chapter.Topics.map((t) => (
                              <label
                                key={t.TopicId}
                                className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded border border-transparent hover:border-gray-200 transition"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.topics.includes(t.TopicId)}
                                  onChange={(e) => {
                                    const newVal = e.target.checked
                                      ? [...filters.topics, t.TopicId]
                                      : filters.topics.filter(
                                          (id) => id !== t.TopicId,
                                        );

                                    setFilters({
                                      ...filters,
                                      topics: newVal,
                                    });
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium">
                                  {t.TopicName}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
