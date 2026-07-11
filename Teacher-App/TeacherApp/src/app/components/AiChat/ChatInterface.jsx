import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Sparkles,
  Settings,
  Mic,
  MicOff,
  Trash2,
  Clock,
  History,
  Send,
  Bot,
  User,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { FixedSizeList as List } from "react-window";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import {
  getAiAssistenHistory,
  newChatMessage,
  sendMessage,
  getUserAiChatThreadHistory,
} from "../../../api/services/aiAssistentService";
import { Button } from "../ui/Button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/Sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/authContext";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { AiChatHistory } from "./AiChatHistory";
import { parse, format, isToday, isYesterday, isThisWeek } from "date-fns";

const iconButtonStyle =
  "text-base px-4 py-2 rounded-md flex items-center gap-2 shadow-sm hover:shadow-md transition cursor-pointer";

export const ChatInterface = () => {
  const {
    user: userData,
    currSelectedSchool,
    currSelectedAcademicYear,
    currThreadId,
    setCurrentThreadId,
  } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: userChatHistory, isLoading: userChatHistoryloading } = useQuery(
    {
      queryKey: [
        "userChatHistory",
        currSelectedSchool,
        currSelectedAcademicYear,
      ],
      queryFn: () =>
        getAiAssistenHistory({
          academicYearId: parseInt(currSelectedAcademicYear),
          userId: userData.userId || "",
          schoolId: parseInt(currSelectedSchool || 0),
          pageSize: 5,
          Offset: 0,
        }),
    },
  );

  const {
    data: newChatData,
    isLoading: newChatDataLoading,
    refetch: handleNewChatData,
  } = useQuery({
    queryKey: ["newChatData", userData.userIdentityKey],
    queryFn: () =>
      newChatMessage({
        userId: userData.userId || "",
      }),
    enabled: false,
  });

  const {
    data: userThreadHistoryData,
    isLoading: userThreadHistoryDataLoading,
    refetch: handleUserThreadHistory,
  } = useQuery({
    queryKey: ["newChatData", userData.userIdentityKey, currThreadId],
    queryFn: () =>
      getUserAiChatThreadHistory({
        userId: userData.userId || "",
        threadId: currThreadId || "",
      }),
    enabled: false,
  });

  const handleBindUserThreadHistory = (threadId) => {
    setCurrentThreadId(threadId);
    handleUserThreadHistory();
  };

  useEffect(() => {
    if (userThreadHistoryData && userThreadHistoryData.data) {
      setMessages(userThreadHistoryData.data);
      setShowChat(true);
    }
  }, [userThreadHistoryData]);

  const handleVoiceToggle = () => setIsRecording(!isRecording);
  const handleClear = () => setInputValue("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (newChatData && newChatData.data) {
      setCurrentThreadId(newChatData.data);
      setShowChat(true);
    }
  }, [newChatData, setCurrentThreadId]);

  useEffect(() => {
    if (
      userChatHistory &&
      userChatHistory.data &&
      userChatHistory.data.length > 0
    ) {
      setRecentAnswers(userChatHistory.data);
    }
  }, [userChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      if (currThreadId == null || currThreadId == "") {
        setCurrentThreadId(data.data.threadId);
      }
      if (data && data.data != null && data.data.content) {
        simulateAiResponse(data.data.content);
      } else {
        toast.error("No Answer Found ! Please try again later.");
      }
    },
    onError: (error) => {
      toast.error(
        error.message || "Something went wrong. Please try again later.",
      );
      setIsAiTyping(false);
    },
  });

  const now = new Date();

  const formatted = now.toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const simulateAiResponse = (aiText) => {
    setTimeout(() => {
      const aiMessage = {
        id: Date.now().toString() + "_ai",
        content: aiText,
        sender: "ai",
        timestamp: formatted.replace(",", ""),
        isTyping: true,
      };

      setMessages((prev) => [...prev, aiMessage]);

      setIsAiTyping(false);

      // Typing effect
      let currentText = "";
      let charIndex = 0;

      const typingInterval = setInterval(() => {
        if (charIndex < aiText.length) {
          currentText += aiText[charIndex];
          charIndex++;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id ? { ...msg, content: currentText } : msg,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id ? { ...msg, isTyping: false } : msg,
            ),
          );
          clearInterval(typingInterval);
        }
      }, 5); // typing speed
    }, 0); // processing delay
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setIsAiTyping(true);

    var userMessage = {
      id: Date.now().toString(),
      userId: userData.userId,
      threadId: currThreadId,
      sender: "user",
      schoolId: currSelectedSchool,
      academicYearId: currSelectedAcademicYear,
      content: inputValue,
      timestamp: formatted.replace(",", ""),
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowChat(true);

    setInputValue("");

    try {
      mutation.mutateAsync(userMessage);
    } catch (error) {}
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative flex h-full max-h-screen w-full flex-col gap-2">
      {/* Header */}
      <header className="border-b border-gray-400 bg-white">
        <div className="mx-auto flex items-center justify-between px-6 py-4">
          {/* Left actions */}
          <div className="flex w-1/3 items-center gap-3">
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="surface"
                  title="View Activity History"
                  className={`text-primary bg-white ${iconButtonStyle}`}
                >
                  <History className="text-primary mr-2 h-5 w-5" />
                  View History
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-white">
                <AiChatHistory
                  onItemSelect={(item) => {
                    handleBindUserThreadHistory(item.threadId);
                    setIsHistoryOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>

            <Button
              variant="surface"
              title="Start New Chat"
              onClick={() => {
                handleNewChatData();
              }}
              className={`text-primary bg-white ${iconButtonStyle} hover:bg-gray-50`}
            >
              <MessageSquare className="text-primary mr-2 h-5 w-5" />
              New Chat
            </Button>
          </div>

          {/* Centered Title */}
          <div className="flex w-1/3 items-center justify-center gap-2">
            <Sparkles className="text-primary h-6 w-6" />
            <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
          </div>

          {/* Right spacer (keeps title centered) */}
          <div className="w-1/3"></div>
        </div>
      </header>

      {/* Recent Answers */}
      {!showChat && (
        <section className="mx-auto h-full max-h-full w-full max-w-full flex-1 px-1 sm:max-w-[1024px] sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center text-xl font-semibold text-gray-800">
              <Clock className="text-primary mr-2 h-5 w-5" />
              Recent Answers
            </h2>
            <span className="text-sm text-gray-600">Latest First</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentAnswers.slice(0, 5).map((item, index) => (
              <Card
                key={index}
                className="group hover:border-primary/50 flex cursor-pointer flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:bg-gray-50 hover:shadow-md"
                onClick={() => handleBindUserThreadHistory(item.threadId)}
              >
                <div
                  key={item.index}
                  className="flex h-full flex-col justify-between"
                >
                  <div className="prose prose-sm mb-2 line-clamp-2 w-full max-w-none text-left text-sm leading-relaxed font-medium text-gray-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.lastMessagePreview || ""}
                    </ReactMarkdown>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                      {item.lastSender === "user" ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      {item.lastSender === "user" ? "You" : "AI"}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-medium whitespace-nowrap text-gray-400">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Chat Messages */}
      {showChat && (
        <section className="mx-auto w-full max-w-full flex-1 space-y-4 px-0 sm:px-6">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } chat-message-enter`}
            >
              <div
                className={`flex max-w-[60%] gap-3 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground text-white"
                      : "bg-card border"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <Card
                  className={`relative rounded-2xl p-2 text-left ${
                    message.sender === "user"
                      ? "bg-primary border-primary/20 text-white"
                      : "border border-gray-300 bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="my-2 text-left text-sm font-bold sm:text-base md:text-lg"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="my-1 text-left text-sm font-semibold sm:text-base md:text-lg"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="my-1 text-left text-xs font-medium sm:text-sm md:text-base"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className={`my-1 text-left text-[10px] leading-relaxed sm:text-xs md:text-sm ${
                              message.sender === "user"
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className={`my-1 list-inside list-disc space-y-0.5 text-left text-[10px] sm:text-xs md:text-sm ${
                              message.sender === "user"
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className={`my-1 ml-4 list-decimal space-y-0.5 text-left text-[10px] sm:text-xs md:text-sm ${
                              message.sender === "user"
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            className={`ml-1 text-left text-[10px] leading-snug sm:text-xs md:text-sm ${
                              message.sender === "user"
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                            {...props}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className={`my-1 rounded border-l-2 px-2 py-1 text-left text-[10px] italic sm:text-xs md:text-sm ${
                              message.sender === "user"
                                ? "bg-primary/60 border-white text-white"
                                : "border-primary bg-blue-50 text-blue-800"
                            }`}
                            {...props}
                          />
                        ),
                        code: ({ inline, className, children, ...props }) => {
                          return inline ? (
                            <code
                              className="rounded bg-gray-200 px-1 py-[1px] text-left font-mono text-[10px] text-purple-700 sm:text-xs md:text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <pre className="my-2 overflow-auto rounded bg-gray-900 p-2 text-left font-mono text-[10px] text-gray-100 shadow-inner sm:text-xs md:text-sm">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        },
                        table: ({ node, ...props }) => (
                          <div className="my-2 overflow-auto">
                            <table
                              className={`min-w-full border-collapse border text-left text-[10px] sm:text-xs md:text-sm ${
                                message.sender === "user"
                                  ? "border-white text-white"
                                  : "border-gray-300 text-gray-700"
                              }`}
                              {...props}
                            />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className={`border px-1 py-1 text-left text-[10px] font-semibold sm:text-xs md:text-sm ${
                              message.sender === "user"
                                ? "bg-primary border-white text-white"
                                : "border-gray-300 bg-gray-200 text-gray-700"
                            }`}
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className={`border px-1 py-1 text-left text-[10px] sm:text-xs md:text-sm ${
                              message.sender === "user"
                                ? "border-white text-white"
                                : "border-gray-300 text-gray-700"
                            }`}
                            {...props}
                          />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.isTyping && (
                    <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-current" />
                  )}

                  {message.timestamp && (
                    <div className="mt-1 flex justify-end">
                      <span className="flex items-center gap-1 text-[11px] font-medium whitespace-nowrap text-gray-400">
                        <Clock className="h-3 w-3" />
                        {message.timestamp}
                        {/*{new Date(message.timestamp).toLocaleString("en-US", {*/}
                        {/*    year: "numeric",*/}
                        {/*    month: "short",*/}
                        {/*    day: "2-digit",*/}
                        {/*    hour: "2-digit",*/}
                        {/*    minute: "2-digit",*/}
                        {/*    hour12: true,*/}
                        {/*})}*/}
                      </span>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ))}

          {isAiTyping && (
            <div className="chat-message-enter flex justify-start">
              <div className="flex max-w-[80%] gap-3">
                <div className="bg-card flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="bg-card p-3">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary h-2 w-2 animate-bounce rounded-full" />
                    <div
                      className="bg-primary h-2 w-2 animate-bounce rounded-full"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="bg-primary h-2 w-2 animate-bounce rounded-full"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>
      )}

      <div className="flex w-full justify-center border-gray-300 bg-white">
        <div className="w-full max-w-full border-t border-gray-300 px-4 py-4 sm:max-w-[1024px]">
          <div className="flex w-full items-start gap-2">
            <div className="flex w-full flex-col items-start gap-1">
              <Input
                value={inputValue}
                maxLength={1000}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything using your documents!"
                className="focus:ring-primary w-full resize-none rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:outline-none"
                disabled={isAiTyping}
              />

              <span className="ml-5 text-xs text-gray-500">
                Use Shift + Enter for new lines. {inputValue.length} / 1000
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex gap-2">
                <Button
                  className="cursor-pointer"
                  variant="ghost"
                  onClick={handleVoiceToggle}
                  size="sm"
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4 text-gray-600" />
                  )}
                </Button>
                <Button
                  className="cursor-pointer"
                  variant="ghost"
                  onClick={handleClear}
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 text-gray-600" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isAiTyping}
                  className="gradient-primary cursor-pointer text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
