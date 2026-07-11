"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Model from "../../../components/common/Model";
import {
  addQuestion,
  getStandards,
  getStandardSubject,
  getTopics,
} from "@/api/client";

// Flat data structure returned from API
interface StandardSubject {
  standardId: number;
  standardName: string;
  mediumId: number;
  medium: string;
  streamId: number;
  stream: string;
  subjectId: number;
  subjectName: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isQuestionModelOpen, setIsQuestionModelOpen] = useState(false);
  const [standards, setStandards] = useState<StandardSubject[]>([]);

  // Dropdown selections
  const [selectedMediumId, setSelectedMediumId] = useState<number | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<number | null>(
    null,
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [chapters, setChapters] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [topics, setTopics] = useState<{ value: string; label: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  // Fetch standards data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await getStandardSubject();
        const parsed: StandardSubject[] = (
          (res?.options ?? []) as unknown as Array<Record<string, unknown>>
        ).map((item) => ({
          standardId: Number(
            item.standardId ?? item.standardValue ?? item.id ?? 0,
          ),
          standardName: String(
            item.standardName ??
              item.standard ??
              item.optionLabel ??
              item.name ??
              "",
          ),
          mediumId: Number(item.mediumId ?? item.mediumValue ?? 0),
          medium: String(item.medium ?? item.mediumName ?? ""),
          streamId: Number(item.streamId ?? item.streamValue ?? 0),
          stream: String(item.stream ?? item.streamName ?? ""),
          subjectId: Number(item.subjectId ?? item.subjectValue ?? 0),
          subjectName: String(
            item.subjectName ?? item.subject ?? item.optionLabel ?? "",
          ),
        }));
        setStandards(parsed);
      } catch (err) {
        console.error("Failed to fetch standards:", err);
      }
    };

    fetchData();
  }, [user]);

  // Reset form
  const resetForm = () => {
    setSelectedMediumId(null);
    setSelectedStreamId(null);
    setSelectedStandardId(null);
    setSelectedSubjectId(null);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setFile(null);
    setError("");
  };

  // --- Dropdown Options (distinct values) ---
  const mediumOptions = Array.from(
    new Map(standards.map((s) => [s.mediumId, s.medium])).entries(),
  ).map(([id, name]) => ({ id, name }));

  const streamOptions = Array.from(
    new Map(
      standards
        .filter((s) => s.mediumId === selectedMediumId)
        .map((s) => [s.streamId, s.stream]),
    ).entries(),
  ).map(([id, name]) => ({ id, name }));

  const standardOptions = Array.from(
    new Map(
      standards
        .filter(
          (s) =>
            s.mediumId === selectedMediumId && s.streamId === selectedStreamId,
        )
        .map((s) => [s.standardId, s.standardName]),
    ).entries(),
  ).map(([id, name]) => ({ id, name }));

  const subjectOptions = Array.from(
    new Map(
      standards
        .filter(
          (s) =>
            s.mediumId === selectedMediumId &&
            s.streamId === selectedStreamId &&
            s.standardId === selectedStandardId,
        )
        .map((s) => [s.subjectId, s.subjectName]),
    ).entries(),
  ).map(([id, name]) => ({ id, name }));

  const handleGetChapters = async (
    standardId: number,
    subjectId: number,
    streamId: number,
  ) => {
    if (!standardId || !subjectId) return;

    try {
      const res = await getStandards(
        user.userId,
        standardId,
        subjectId,
        streamId,
        1,
      );

      // ✅ Correct structure
      const list = res?.data?.data ?? [];

      if (Array.isArray(list)) {
        setChapters(list);
      } else {
        setChapters([]);
      }
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      setChapters([]);
    }
  };

  const handleGetTopics = async (
    standardId: number,
    subjectId: number,
    chapterId: number,
  ) => {
    if (!standardId || !subjectId || !chapterId) return;

    try {
      const res = await getTopics(
        user.userId,
        standardId,
        subjectId,
        chapterId,
      );

      const list = res?.data?.data ?? [];

      if (Array.isArray(list)) {
        setTopics(list);
      } else {
        setTopics([]);
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      setTopics([]);
    }
  };

  // Handle file selection
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const selected = e.target.files?.[0];
  //   if (selected) {
  //     if (selected.type !== "application/pdf") {
  //       setError("Only PDF files are allowed");
  //       setFile(null);
  //     } else {
  //       setError("");
  //       setFile(selected);
  //     }
  //   }
  // };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (selected) {
      const allowedTypes = [
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      ];

      if (!allowedTypes.includes(selected.type)) {
        setError("Only Word files (.doc, .docx) are allowed");
        setFile(null);
      } else {
        setError("");
        setFile(selected);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debugger;
    if (
      !file ||
      !selectedMediumId ||
      !selectedStreamId ||
      !selectedStandardId ||
      !selectedSubjectId ||
      !selectedChapter ||
      !selectedTopic
    ) {
      setError("Please select all fields and upload a PDF");
      return;
    }

    try {
      const response = await addQuestion(
        file,
        selectedMediumId,
        selectedStreamId,
        selectedStandardId,
        selectedSubjectId,
        selectedChapter,
        selectedTopic,
      );
      alert("Form submitted successfully!");
      resetForm();
      setIsQuestionModelOpen(false);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload file");
    }
  };

  if (!user) return <div>Loading user info...</div>;

  return (
    <>
      <h1>Welcome, {user.firstName}!</h1>
      <button
        className="bg-purple-400 px-2 py-2 rounded-2xl cursor-pointer"
        onClick={() => setIsQuestionModelOpen(true)}
      >
        Add Question
      </button>

      <Model
        isOpen={isQuestionModelOpen}
        onClose={() => {
          setIsQuestionModelOpen(false);
          resetForm();
        }}
        title="Upload Question"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medium */}
          <div>
            <label className="block">Medium</label>
            <select
              value={selectedMediumId ?? ""}
              onChange={(e) => {
                setSelectedMediumId(Number(e.target.value));
                setSelectedStreamId(null);
                setSelectedStandardId(null);
                setSelectedSubjectId(null);
              }}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Medium</option>
              {mediumOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stream */}
          <div>
            <label className="block">Stream</label>
            <select
              value={selectedStreamId ?? ""}
              onChange={(e) => {
                setSelectedStreamId(Number(e.target.value));
                setSelectedStandardId(null);
                setSelectedSubjectId(null);
              }}
              className="border p-2 rounded w-full"
              disabled={!selectedMediumId}
            >
              <option value="">Select Stream</option>
              {streamOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Standard */}
          <div>
            <label className="block">Standard</label>
            <select
              value={selectedStandardId ?? ""}
              onChange={(e) => {
                setSelectedStandardId(Number(e.target.value));
                setSelectedSubjectId(null);
              }}
              className="border p-2 rounded w-full"
              disabled={!selectedStreamId}
            >
              <option value="">Select Standard</option>
              {standardOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block">Subject</label>
            <select
              value={selectedSubjectId ?? ""}
              onChange={(e) => {
                const sub = Number(e.target.value);
                (setSelectedSubjectId(sub), setSelectedChapter(null));
                handleGetChapters(
                  selectedStandardId!,
                  sub,
                  selectedStreamId ? selectedStreamId : 0,
                );
              }}
              className="border p-2 rounded w-full"
              disabled={!selectedStandardId}
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapters */}
          <div>
            <label className="block">Chapter</label>
            <select
              value={selectedChapter ?? ""}
              onChange={(e) => {
                const chapterId = Number(e.target.value);
                setSelectedChapter(chapterId);
                handleGetTopics(
                  selectedStandardId!,
                  selectedSubjectId!,
                  chapterId,
                );
              }}
              className="border p-2 rounded w-full"
              disabled={!selectedSubjectId || chapters.length === 0}
            >
              <option value="">Select Chapter</option>
              {chapters.map((chapter, index) => (
                <option key={index} value={chapter.value}>
                  {chapter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block">Topic</label>
            <select
              value={selectedTopic ?? ""}
              onChange={(e) => setSelectedTopic(Number(e.target.value))}
              className="border p-2 rounded w-full"
              disabled={!selectedChapter || topics.length === 0}
            >
              <option value="">Select Topic</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>
          {/* File Upload */}
          <div>
            <label className="block">Upload PDF</label>
            <input
              type="file"
              // accept="application/pdf"
              onChange={handleFileChange}
              disabled={
                !selectedMediumId ||
                !selectedStreamId ||
                !selectedStandardId ||
                !selectedSubjectId
              }
              className={`border p-2 rounded w-full ${
                !selectedMediumId ||
                !selectedStreamId ||
                !selectedStandardId ||
                !selectedSubjectId
                  ? "bg-gray-200 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="bg-gray-400 px-4 py-2 rounded text-white"
              onClick={() => {
                setIsQuestionModelOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 px-4 py-2 rounded text-white"
            >
              Submit
            </button>
          </div>
        </form>
      </Model>
    </>
  );
}
