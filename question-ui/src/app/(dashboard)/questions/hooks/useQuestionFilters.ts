"use client";

import { useEffect, useState } from "react";
import { getDropDownConst } from "@/api/client";
import { getDropDowns, getQuestionsByTopics } from "../services/questionPaper.api";
import { getStandards } from "@/api/client";

type Option = { value: number; label: string };

type Filters = {
  medium: string;
  stream: string;
  standards: number[];
  subjects: number[];
  chapters: number[];
  topics: number[];
};
type GroupedTopic = {
  ChapterId: number;
  ChapterName: string;
  Topics: {
    TopicId: number;
    TopicName: string;
  }[];
};
export function useQuestionFilters() {
  const [filters, setFilters] = useState<Filters>({
    medium: "",
    stream: "",
    standards: [],
    subjects: [],
    chapters: [],
    topics: [],
  });

  const [step, setStep] = useState<"standard" | "subject" | "chapter" | "topic" | "questions" | null>("standard");

  const [mediums, setMediums] = useState<Option[]>([]);
  const [streams, setStreams] = useState<Option[]>([]);
  const [standards, setStandards] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [chapters, setChapters] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  const [groupedTopics, setGroupedTopics] = useState<GroupedTopic[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [chapterSubjectMap, setChapterSubjectMap] = useState<Record<number, string>>({});
const [selectedMark, setSelectedMark] = useState<number>(1);
const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);

  type SelectedQuestion = {
  questionId: number;
  mark: number;
};

 const toggleQuestion = (questionId: number) => {
  const exists = selectedQuestions.find(
    (q) => q.questionId === questionId
  );

  if (exists) {
    setSelectedQuestions((prev) =>
      prev.filter((q) => q.questionId !== questionId)
    );
  } else {
    setSelectedQuestions((prev) => [
      ...prev,
      { questionId, mark: selectedMark },
    ]);
  }
};

  const userId = "12345";

  // Load Mediums & Streams (unchanged)
  useEffect(() => {
    getDropDownConst("Medium").then((res) => {
      if (res.isSuccess && Array.isArray(res.options)) {
        setMediums(res.options.map(o => ({ value: Number(o.optionValue), label: o.optionLabel })));
      }
    });
    getDropDownConst("Stream").then((res) => {
      if (res.isSuccess && Array.isArray(res.options)) {
        setStreams(res.options.map(o => ({ value: Number(o.optionValue), label: o.optionLabel })));
      }
    });
  }, []);

  useEffect(() => {
  if (!filters.stream || !filters.medium || !userId) {
    setStandards([]);
    return;
  }

  const streamId = Number(filters.stream);
  const mediumId = Number(filters.medium);

  console.log("Calling getStandards with:", { userId, mediumId, streamId });

  getStandards(userId, 0, 0, mediumId, 3)
    .then((res) => {
      console.log("getStandards response:", res);

      const rawList = res?.data?.data ?? res?.data ?? res ?? [];
      const options = Array.isArray(rawList)
        ? rawList
            .filter(item => item?.value != null)
            .map((item: any) => ({
              value: Number(item.value),
              label: String(item.label || "Standard " + item.value),
            }))
        : [];

      console.log("Final standards options:", options);
      setStandards(options);
    })
    .catch((err) => {
      console.error("getStandards error:", err);
      setStandards([]);
    });
}, [filters.stream, filters.medium, userId]);

  // Load Subjects based on selected standards (old logic)
  useEffect(() => {
  if (!filters.standards.length) {
    setSubjects([]);
    return;
  }

  getDropDowns(filters.standards.join(","), "", "", 0)
    .then((res) => {
      const raw =
        res?.data?.data?.[0]?.data ??
        res?.data ??
        res ??
        "[]";

      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

      const subjects = Array.isArray(parsed)
        ? parsed.flatMap((s: any) =>
            (s.Subjects || []).map((sub: any) => ({
              value: Number(sub.SubjectId),
              label: sub.SubjectName,
            }))
          )
        : [];

      setSubjects(subjects);
    })
    .catch(() => setSubjects([]));
}, [filters.standards]);

  // Load Chapters
  useEffect(() => {
  if (!filters.subjects.length) {
    setChapters([]);
    setChapterSubjectMap({});
    return;
  }

  getDropDowns(
    filters.standards.join(","),
    filters.subjects.join(","),
    "",
    1
  )
    .then((res: any) => {
      const jsonString =
        res?.data?.data?.[0]?.data;

      if (!jsonString) {
        setChapters([]);
        setChapterSubjectMap({});
        return;
      }

      const parsed = JSON.parse(jsonString);
      const subjectMap: Record<number, string> = {};
      const chapterOptions = parsed.flatMap((subject: any) =>
        subject.Chapters.map((c: any) => {
          subjectMap[c.ChapterId] = subject.SubjectName || "";
          return {
            value: c.ChapterId,
            label: `${c.ChapterNumber}. ${c.ChapterName}`,
          };
        })
      );

      setChapterSubjectMap(subjectMap);
      setChapters(chapterOptions);
    })
    .catch(() => {
      setChapters([]);
      setChapterSubjectMap({});
    });
}, [filters.subjects]);

  // Load Topics
  useEffect(() => {
    if (!filters.standards.length || !filters.subjects.length || !filters.chapters.length) {
      return setTopics([]);
    }

    getDropDowns(
      filters.standards.join(","),
      filters.subjects.join(","),
      filters.chapters.join(","),
      2
    )
      .then((res: Option[]) => setTopics(res || []))
      .catch(() => setTopics([]));
  }, [filters.standards, filters.subjects, filters.chapters]);

//   useEffect(() => {
//   if (!filters.chapters.length) {
//     setTopics([]);
//     return;
//   }

//   getDropDowns(
//     filters.standards.join(","),
//     filters.subjects.join(","),
//     filters.chapters.join(","),
//     2
//   )
//     .then((res: any) => {
//       const jsonString = res?.data?.data?.[0]?.data;

//       if (!jsonString) {
//         setTopics([]);
//         return;
//       }

//       const parsed = JSON.parse(jsonString);

//       const topicOptions = parsed.flatMap((chapter: any) =>
//         (chapter.Topics || []).map((t: any) => ({
//           value: Number(t.TopicId),
//           label: t.TopicName,
//         }))
//       );

//       setTopics(topicOptions);
//     })
//     .catch(() => setTopics([]));
// }, [filters.chapters]);

  useEffect(() => {
  if (!filters.chapters.length) {
    setGroupedTopics([]);
    return;
  }

  getDropDowns(
    filters.standards.join(","),
    filters.subjects.join(","),
    filters.chapters.join(","),
    2
  )
    .then((res: any) => {
      const jsonString = res?.data?.data?.[0]?.data;

      if (!jsonString) {
        setGroupedTopics([]);
        return;
      }

      const parsed = JSON.parse(jsonString);

      setGroupedTopics(parsed);
    })
    .catch(() => setGroupedTopics([]));
}, [filters.chapters]);
 
  //Questions
  useEffect(() => {
  if (!filters.topics.length) {
    setQuestions([]);
    return;
  }

  const topicIds = filters.topics.join(","); ; // single topic support

    getQuestionsByTopics(topicIds)
      .then((res) => {
      setQuestions(res?.data ?? []);
      setStep("questions"); // keep step on topic
    })
    .catch(() => setQuestions([]));

}, [filters.topics]);


  
  return {
    filters,
    setFilters,
    mediums,
    streams,
    standards,
    subjects,
    chapters,
    topics,
    groupedTopics,
    questions,
    step,
    setStep,
    selectedMark,
    setSelectedMark,
    selectedQuestions,
    toggleQuestion,
    chapterSubjectMap,
  };
}