"use client";

import { useQuestionFiltersContext } from "../hooks/QuestionFiltersContext";

export default function QuestionsList() {
  const { step, questions } = useQuestionFiltersContext();

  if (step !== "questions") return null;

  if (!questions.length) {
    return (
      <div className="text-center py-6 text-gray-500">No questions found</div>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((q: any) => (
        <div key={q.id} className="border p-3 rounded">
          <p>{q.question}</p>
          <span className="text-sm text-gray-500">{q.marks} Marks</span>
        </div>
      ))}
    </div>
  );
}
