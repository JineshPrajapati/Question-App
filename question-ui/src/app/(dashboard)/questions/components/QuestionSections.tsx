"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuestionFiltersContext } from "../hooks/QuestionFiltersContext";
import { MathJax } from "better-react-mathjax";
import { Info } from "lucide-react";
import Tooltip from "@/components/common/Tooltip";
import { createPortal } from "react-dom";
import PrintTemplate from "./PrintTemplate";

export default function QuestionSections() {
  const {
    questions,
    chapterSubjectMap,
    filters,
    standards,
    chapters,
    hasMore,
    loading,
    loadMoreQuestions,
  } = useQuestionFiltersContext();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreQuestions();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMoreQuestions]);

  const selectedStdLabel = useMemo(() => {
    if (!filters?.standards || filters.standards.length === 0) return "";
    const stdOpt = standards?.find((s) => s.value === filters.standards[0]);
    return stdOpt ? stdOpt.label : "";
  }, [filters?.standards, standards]);

  const selectedChapterNumber = useMemo(() => {
    if (!filters?.chapters || filters.chapters.length === 0) return "";
    const firstCh = chapters?.find((c) => c.value === filters.chapters[0]);
    if (!firstCh) return "";
    const dotIdx = firstCh.label.indexOf(".");
    if (dotIdx !== -1) {
      return firstCh.label.substring(0, dotIdx).trim();
    }
    return firstCh.label;
  }, [filters?.chapters, chapters]);

  const [selectedMark, setSelectedMark] = useState<number | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<
    Record<number, number>
  >({});
  const [infoData, setInfoData] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [printConfig, setPrintConfig] = useState({
    instituteName: "",
    examName: "",
    subject: "",
    examDate: "",
    examTime: "",
    pageSize: "A4",

    includeSolutions: false,
    includeAnswerKey: false,
  });

  const cleanMathML = (html: string) => {
    if (!html) return "";

    return html
      .replace(/mml:/g, "") // remove mml: prefix
      .replace(/xmlns(:\w+)?="[^"]*"/g, "") // remove all xmlns attributes
      .replace(/<math/g, '<math display="inline"'); // ensure proper rendering
  };

  /* GROUP BY MARKS (FINAL JSON)*/
  const groupedByMarks = useMemo(() => {
    const result: Record<number, number[]> = {};

    Object.entries(selectedQuestions).forEach(([qId, mark]) => {
      const markNumber = Number(mark);
      const questionId = Number(qId);

      if (!result[markNumber]) result[markNumber] = [];

      result[markNumber].push(questionId);
    });

    return result;
  }, [selectedQuestions]);

  /* ================================
     HANDLE QUESTION SELECT / UNSELECT
  =================================*/
  const handleQuestionSelect = (questionId: number) => {
    setSelectedQuestions((prev) => {
      // ✅ If already selected → REMOVE (Uncheck works)
      if (prev[questionId] !== undefined) {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      }

      // ✅ If not selected → must have mark selected
      if (!selectedMark) {
        alert("Please select mark first");
        return prev;
      }

      // ✅ Assign mark
      return {
        ...prev,
        [questionId]: selectedMark,
      };
    });
  };

  /* GROUP QUESTIONS (MOVE THIS UP) */
  const groupedQuestions = useMemo(() => {
    const result: Record<string, any[]> = {};

    questions?.forEach((q: any) => {
      const key = q.groupHeader || q.GroupHeader;

      if (!result[key]) {
        result[key] = [];
      }

      result[key].push(q);
    });

    return result;
  }, [questions]);

  // ✅ AFTER hooks
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">No questions found</div>
    );
  }

  return (
    <div className="mt-6 space-y-6 relative max-h-[70vh] overflow-y-auto">
      {/* MARK SELECTOR*/}
      <div className="sticky -top-1 z-20 bg-white border-b p-3 shadow-sm">
        <div className="flex gap-3 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((mark) => (
            <button
              key={mark}
              onClick={() => setSelectedMark(mark)}
              className={`px-4 py-1 rounded-lg border transition
                ${selectedMark === mark
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
                }`}
            >
              {mark} Mark
            </button>
          ))}
        </div>
      </div>

      {/* QUESTIONS LIST*/}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-0">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-0">
          {Object.entries(groupedQuestions).map(([header, group]) => {
            const validQuestions = group.filter(
              (q: any) => q?.questionId && q.questionId > 0,
            );
            return (
              <div key={header} className="border rounded-xl p-4 bg-gray-50">
                {/* 🔥 GROUP HEADER */}
                <h2 className="text-lg font-bold text-blue-700 mb-1">
                  {header}
                </h2>

                {validQuestions.length === 0 ? (
                  <div className="text-gray-500 ml-2">No questions found</div>
                ) : (
                  validQuestions.map((q: any) => (
                    <div
                      key={q.questionId}
                      className="relative border rounded-xl p-1 bg-white shadow-sm pr-10 mb-2"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={
                            selectedQuestions[q.questionId] !== undefined
                          }
                          onChange={() => handleQuestionSelect(q.questionId)}
                          className="mt-1 w-5 h-5"
                        />

                        <div className="flex-1">
                          {/* Question Text */}
                          <MathJax dynamic>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: cleanMathML(q.questionText),
                              }}
                            />
                          </MathJax>

                          {/* Images */}
                          {q.questionImage && (
                            <div className="mt-4 flex flex-wrap gap-6 items-center">
                              {q.questionImage
                                .split("|")
                                .filter((img: string) => img.trim() !== "")
                                .map((img: string, index: number) => {
                                  const webPath = img
                                    .replace("C:\\Teacher\\FTP\\dev\\", "")
                                    .replace(/\\/g, "/");

                                  return (
                                    <img
                                      key={index}
                                      src={`http://localhost:5000/${webPath}`}
                                      className="max-h-72 object-contain"
                                    />
                                  );
                                })}
                            </div>
                          )}

                          {/* OPTIONS */}
                          {q.options && (() => {
                            const parsedOptions = JSON.parse(q.options);
                            let columnsCount = 1;
                            if (parsedOptions.length === 4 && parsedOptions.every((o: any) => !o.OptionImage)) {
                              const maxLen = Math.max(...parsedOptions.map((o: any) => {
                                const text = o.OptionText ? String(o.OptionText).replace(/<[^>]+>/g, "").trim() : "";
                                return text.length;
                              }));
                              if (maxLen < 20) columnsCount = 4;
                              else if (maxLen < 60) columnsCount = 2;
                            }
                            const gridColsClass = columnsCount === 4 ? "grid-cols-2 lg:grid-cols-4" : columnsCount === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1";
                            return (
                              <div className={`mt-2 grid ${gridColsClass} gap-x-6 gap-y-2`}>
                                {parsedOptions.map((opt: any) => (
                                  <div
                                    key={opt.QuestionOptionId}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="font-semibold text-gray-700">
                                      {opt.Option}.
                                    </div>
                                    <div className="flex-1 text-gray-800">
                                      {opt.OptionText && (
                                        <MathJax dynamic>
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: cleanMathML(opt.OptionText),
                                            }}
                                          />
                                        </MathJax>
                                      )}
                                      {/* Option Image */}
                                      {opt.OptionImage && (
                                        <img
                                          src={`http://localhost:5000/${opt.OptionImage.replace(
                                            "C:\\Teacher\\FTP\\dev\\",
                                            "",
                                          ).replace(/\\/g, "/")}`}
                                          className="max-h-32 mt-1 object-contain"
                                        />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* MARK */}
                          {selectedQuestions[q.questionId] && (
                            <div className="mt-1 text-sm text-green-600">
                              Assigned: {selectedQuestions[q.questionId]} Mark
                            </div>
                          )}
                        </div>
                      </div>
                      <Tooltip content="Solution">
                        <button
                          onClick={() => setInfoData(q)}
                          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center 
      rounded-full bg-gray-200 text-blue-600 
      hover:bg-gray-300 transition"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  ))
                )}
              </div>
            );
          })}

          {/* Sentinel for infinite scroll */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="py-6 flex items-center justify-center text-gray-500 font-medium text-sm gap-2"
            >
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></span>
              Loading more questions...
            </div>
          )}
        </div>
      </div>

      {/* INFO MODAL*/}
      {infoData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInfoData(null)}
              className="absolute top-3 right-3 text-red-500 text-lg"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-3">Question Detail</h3>

            {/* Question */}
            <MathJax dynamic>
              <div
                dangerouslySetInnerHTML={{
                  __html: cleanMathML(infoData.questionText),
                }}
              />
            </MathJax>

            {infoData.questionImage &&
              infoData.questionImage
                .split("|")
                .filter((img: string) => img.trim() !== "")
                .map((img: string, index: number) => {
                  const webPath = img
                    .replace("C:\\Teacher\\FTP\\dev\\", "")
                    .replace(/\\/g, "/");

                  return (
                    <img
                      key={index}
                      src={`http://localhost:5000/${webPath}`}
                      alt={`question-${index}`}
                      className="max-h-72 w-auto object-contain"
                    />
                  );
                })}

            <hr className="my-4" />

            {/* Solution */}
            <h4 className="font-medium mb-2">Solution</h4>

            <MathJax dynamic>
              <div
                dangerouslySetInnerHTML={{
                  __html: cleanMathML(infoData.solutionText),
                }}
              />
            </MathJax>

            {infoData.solutionImage && (
              // <img
              //   src={infoData.solutionImage}
              //   className="mt-3 max-h-60 object-contain rounded"
              // />
              <div className="mt-4 flex flex-wrap gap-6 items-center">
                {infoData.solutionImage
                  .split("|")
                  .filter((img: string) => img.trim() !== "")
                  .map((img: string, index: number) => {
                    const webPath = img
                      .replace("C:\\Teacher\\FTP\\dev\\", "")
                      .replace(/\\/g, "/");

                    return (
                      <img
                        key={index}
                        src={`http://localhost:5000/${webPath}`}
                        alt={`question-${index}`}
                        className="max-h-72 w-auto object-contain"
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRINT BUTTON */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (Object.keys(selectedQuestions).length === 0) {
              alert("Please select at least one question to print.");
              return;
            }
            setValidationErrors({});
            setIsPrintModalOpen(true);
          }}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Print Question Paper
        </button>
      </div>

      {/* PRINT MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* CLOSE */}
            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="absolute top-3 right-3 text-red-500 text-lg hover:text-red-700 transition cursor-pointer"
            >
              ✖
            </button>

            <h2 className="text-2xl font-bold mb-6 text-blue-700">
              Print Question Paper
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institute */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Institute Name *
                </label>

                <input
                  type="text"
                  value={printConfig.instituteName}
                  onChange={(e) => {
                    setPrintConfig({
                      ...printConfig,
                      instituteName: e.target.value,
                    });
                    if (validationErrors.instituteName) {
                      setValidationErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.instituteName;
                        return copy;
                      });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${validationErrors.instituteName
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300"
                    }`}
                  placeholder="Enter institute name"
                />
                {validationErrors.instituteName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.instituteName}
                  </p>
                )}
              </div>

              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exam Name *
                </label>

                <input
                  type="text"
                  value={printConfig.examName}
                  onChange={(e) => {
                    setPrintConfig({
                      ...printConfig,
                      examName: e.target.value,
                    });
                    if (validationErrors.examName) {
                      setValidationErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.examName;
                        return copy;
                      });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${validationErrors.examName
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300"
                    }`}
                  placeholder="Enter exam name"
                />
                {validationErrors.examName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.examName}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>

                <input
                  type="text"
                  value={printConfig.subject}
                  onChange={(e) =>
                    setPrintConfig({
                      ...printConfig,
                      subject: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Optional (defaults to question subjects)"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exam Date *
                </label>

                <input
                  type="date"
                  value={printConfig.examDate}
                  onChange={(e) => {
                    setPrintConfig({
                      ...printConfig,
                      examDate: e.target.value,
                    });
                    if (validationErrors.examDate) {
                      setValidationErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.examDate;
                        return copy;
                      });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${validationErrors.examDate
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300"
                    }`}
                />
                {validationErrors.examDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.examDate}
                  </p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exam Time *
                </label>

                <input
                  type="text"
                  value={printConfig.examTime}
                  onChange={(e) => {
                    setPrintConfig({
                      ...printConfig,
                      examTime: e.target.value,
                    });
                    if (validationErrors.examTime) {
                      setValidationErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.examTime;
                        return copy;
                      });
                    }
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${validationErrors.examTime
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300"
                    }`}
                  placeholder="Example: 10:00 AM - 11:00 AM"
                />
                {validationErrors.examTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.examTime}
                  </p>
                )}
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Page Size *
                </label>

                <select
                  value={printConfig.pageSize}
                  onChange={(e) =>
                    setPrintConfig({
                      ...printConfig,
                      pageSize: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                </select>
              </div>
            </div>

            {/* CHECKBOXES */}
            <div className="mt-6 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={printConfig.includeSolutions}
                  onChange={(e) =>
                    setPrintConfig({
                      ...printConfig,
                      includeSolutions: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm font-medium text-gray-700">
                  Print With Solutions
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={printConfig.includeAnswerKey}
                  onChange={(e) =>
                    setPrintConfig({
                      ...printConfig,
                      includeAnswerKey: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />

                <span className="text-sm font-medium text-gray-700">
                  Include Answer Key
                </span>
              </label>
            </div>

            {/* FOOTER */}
            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition cursor-pointer text-sm font-medium"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const errs: Record<string, string> = {};
                  if (!printConfig.instituteName.trim()) {
                    errs.instituteName = "Institute Name is required";
                  }
                  if (!printConfig.examName.trim()) {
                    errs.examName = "Exam Name is required";
                  }
                  if (!printConfig.examDate) {
                    errs.examDate = "Exam Date is required";
                  }
                  if (!printConfig.examTime.trim()) {
                    errs.examTime = "Exam Time is required";
                  }

                  if (Object.keys(errs).length > 0) {
                    setValidationErrors(errs);
                    return;
                  }

                  setValidationErrors({});
                  setIsPrintModalOpen(false);
                  setIsPrinting(true);

                  setTimeout(() => {
                    window.print();
                    setIsPrinting(false);
                  }, 1500);
                }}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer text-sm font-medium shadow-sm"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT CONTAINER FOR RENDERING */}
      {isPrinting &&
        typeof document !== "undefined" &&
        createPortal(
          <PrintTemplate
            config={printConfig}
            selectedQuestions={selectedQuestions}
            questions={questions}
            chapterSubjectMap={chapterSubjectMap}
            standardLabel={selectedStdLabel}
            chapterNumber={selectedChapterNumber}
          />,
          document.body,
        )}
    </div>
  );
}
