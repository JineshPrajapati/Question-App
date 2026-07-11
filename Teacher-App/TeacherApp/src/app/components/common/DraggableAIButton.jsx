import React, { useState, useEffect } from "react";
import { ChatBubbleLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";

export const DraggableAIButton = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState({
    x: 100,
    y: window.innerHeight - 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Handle drag start
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle drag
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Keep button within viewport bounds
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;

      setPosition({
        x: Math.min(Math.max(0, newX), maxX),
        y: Math.min(Math.max(0, newY), maxY),
      });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      <div
        className={`fixed z-50 cursor-move ${isDragging ? "pointer-events-none" : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <button
          // onMouseDown={handleMouseDown}
          // disabled={false}
          onClick={() => {
            navigate("/chat");
          }}
          className="group bg-primary cursor- hover:bg-primary-dark flex transform items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <ChatBubbleLeftIcon className="h-6 w-6" />
          <span className="font-medium">AI Assistant</span>

          {/* Pulse effect */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
          </span>
        </button>
      </div>

      {/* AI Chat Panel */}
      {isAIChatOpen && (
        <div
          className="fixed right-6 bottom-24 z-50 h-[600px] w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl"
          style={{
            left: `${position.x}px`,
            top: `${position.y + 60}px`,
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800">
              AI Assistant
            </h3>
            <button
              onClick={() => setIsAIChatOpen(false)}
              className="text-gray-700 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            {/* Add your AI chat component here */}
            <p className="text-gray-800">How can I help you today?</p>
          </div>
        </div>
      )}

      {/* Backdrop when chat is open */}
      {isAIChatOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsAIChatOpen(false)}
        />
      )}
    </>
  );
};
