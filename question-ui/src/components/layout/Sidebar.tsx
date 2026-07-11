"use client";

import { X } from "lucide-react";

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-blue-600">Menu</h2>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="md:hidden p-2 -mr-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        <a
          href="/dashboard"
          className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium text-sm"
        >
          Dashboard
        </a>
        <a
          href="/questions"
          className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium text-sm"
        >
          Questions
        </a>
        <a
          href="/questionpaperpage"
          className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium text-sm"
        >
          QuestionPaper
        </a>
      </nav>
    </div>
  );
}
