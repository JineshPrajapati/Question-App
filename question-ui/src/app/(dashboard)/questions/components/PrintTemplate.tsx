"use client";

import { useMemo } from "react";
import AnswerKeyPaper from "./AnswerKeyPaper";
import PageHeader from "./PageHeader";
import QuestionPaper from "./QuestionPaper";
import SolutionPaper from "./SolutionPaper";

interface PrintTemplateProps {
  config: {
    instituteName: string;
    examName: string;
    subject: string;
    examDate: string;
    examTime: string;
    pageSize: string;
    includeSolutions: boolean;
    includeAnswerKey: boolean;
  };
  selectedQuestions: Record<number, number>;
  questions: any[];
  chapterSubjectMap: Record<number, string>;
  standardLabel?: string;
  chapterNumber?: string;
}

export default function PrintTemplate({
  config,
  selectedQuestions,
  questions,
  chapterSubjectMap,
  standardLabel = "",
  chapterNumber = "",
}: PrintTemplateProps) {
  const cleanMathML = (html: string) => {
    if (!html) return "";
    return html
      .replace(/mml:/g, "")
      .replace(/xmlns(:\w+)?="[^"]*"/g, "")
      .replace(/<math/g, '<math display="inline"');
  };

  const getQuestionSubject = (q: any) => {
    const chId = q.chapterId ?? q.ChapterId;
    if (chId && chapterSubjectMap[chId]) return chapterSubjectMap[chId];
    return "General";
  };

  const sortedQuestionsData = useMemo(() => {
    const selectedList = questions.filter(
      (q) => selectedQuestions[q.questionId] !== undefined,
    );
    const grouped: Record<string, any[]> = {};
    selectedList.forEach((q) => {
      const subjectName = getQuestionSubject(q);
      if (!grouped[subjectName]) grouped[subjectName] = [];
      grouped[subjectName].push(q);
    });
    Object.keys(grouped).forEach((subjectName) => {
      grouped[subjectName].sort((a, b) => {
        const markA = selectedQuestions[a.questionId] ?? 0;
        const markB = selectedQuestions[b.questionId] ?? 0;
        if (markA !== markB) return markA - markB;
        return a.questionId - b.questionId;
      });
    });
    return { groupedSubjects: grouped };
  }, [questions, selectedQuestions, chapterSubjectMap]);

  const { groupedSubjects } = sortedQuestionsData;
  const subjectsList = Object.keys(groupedSubjects);

  if (subjectsList.length === 0) return null;

  const getSubjectTotalMarks = (subjectName: string) => {
    return (groupedSubjects[subjectName] || []).reduce(
      (sum, q) => sum + (selectedQuestions[q.questionId] ?? 0),
      0,
    );
  };

  const getCorrectOption = (q: any) => {
    try {
      if (!q.options) return "-";
      const opts = JSON.parse(q.options);
      if (!Array.isArray(opts)) return "-";
      const correct = opts.find((opt: any) => opt.IsCorrect || opt.isCorrect);
      return correct?.Option || "-";
    } catch {
      return "-";
    }
  };

  const isGujaratiText = (text: string) => {
    const gujaratiRegex = /[\u0A80-\u0AFF]/;
    return gujaratiRegex.test(text);
  };

  const isGujarati = useMemo(() => {
    if (isGujaratiText(config.examName)) return true;
    if (
      questions.length > 0 &&
      isGujaratiText(questions[0]?.questionText || "")
    )
      return true;
    return false;
  }, [config.examName, questions]);

  const isA5 = config.pageSize === "A5";

  const questionPaperSubjectGroups = subjectsList.map((subjectName) => ({
    subjectName,
    questions: groupedSubjects[subjectName] || [],
    totalMarks: getSubjectTotalMarks(subjectName),
  }));

  const solutionSubjectGroups = subjectsList.map((subjectName) => ({
    subjectName,
    questions: groupedSubjects[subjectName] || [],
  }));

  const answerKeySubjectGroups = subjectsList.map((subjectName) => ({
    subjectName,
    questions: groupedSubjects[subjectName] || [],
  }));

  return (
    <div
      className="print-container"
      style={{ backgroundColor: "#fff", color: "#000", fontFamily: "serif" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: ${isA5 ? "A5" : "A4"} portrait; margin: 0; }
              html, body { margin: 0 !important; padding: 0 !important; background-color: #fff !important; }
              .print-container { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
              .print-avoid-break { break-inside: avoid; page-break-inside: avoid; }
            }
            .qp-page {
              width: ${isA5 ? "132mm" : "190mm"};
              margin: ${isA5 ? "8mm auto" : "10mm auto"} !important;
              background-color: #fff;
              border: ${isA5 ? "1.5px solid #000" : "2px solid #000"};
              box-sizing: border-box;
              page-break-after: always;
              break-after: page;
            }
            .qp-opts-1 { display: flex; flex-direction: column; gap: 2px; margin-top: 3px; margin-left: 8px; }
            .qp-opts-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; margin-top: 3px; margin-left: 8px; }
            .qp-opts-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 2px 8px; margin-top: 3px; margin-left: 8px; }
          `,
        }}
      />

      <QuestionPaper
        config={config}
        subjectGroups={questionPaperSubjectGroups}
        selectedQuestions={selectedQuestions}
        chapterNumber={chapterNumber}
        standardLabel={standardLabel}
        isGujarati={isGujarati}
        cleanMathML={cleanMathML}
      />

      {config.includeSolutions && (
        <SolutionPaper
          config={config}
          subjectGroups={solutionSubjectGroups}
          cleanMathML={cleanMathML}
          getCorrectOption={getCorrectOption}
        />
      )}

      {config.includeAnswerKey && (
        <AnswerKeyPaper
          config={config}
          subjectGroups={answerKeySubjectGroups}
          getCorrectOption={getCorrectOption}
        />
      )}
    </div>
  );
}
