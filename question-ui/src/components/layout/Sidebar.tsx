"use client";

import { X } from "lucide-react"; // icon lib (lucide-react works great with Tailwind)

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`absolute inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300
        ${isOpen ? "visible" : "invisible"} 
        `}
    >
      {/* Close button (only on mobile) */}
      <div className="flex items-center justify-between p-4 ">
        <h2 className="text-lg font-semibold">Menu</h2>
        <button onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar content */}
      <nav className="p-4 space-y-2">
        <a href="/dashboard" className="block p-2 rounded hover:bg-gray-100">
          Dashboard
        </a>
        <a href="/questions" className="block p-2 rounded hover:bg-gray-100">
          Questions
        </a>
        <a
          href="/questionpaperpage"
          className="block p-2 rounded hover:bg-gray-100"
        >
          QuestionPaper
        </a>
      </nav>
    </div>
  );
}
