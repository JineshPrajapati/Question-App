import React, { useEffect, useRef, useState } from "react";
import {
  getChatHistory,
  getChatByGrade,
  sendMessage,
  updateUnReadMessage,
  exportChatHistory,
} from "../../../api/services/familyPortalChatService";
import { getImageUrl } from "../../../api/services/fileService";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownSquareIcon,
  CornerUpLeft,
  PaperclipIcon,
  SendIcon,
  Smile,
} from "lucide-react";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-toastify";
const ChatWindow = ({
  userData,
  userId,
  chatWithId,
  gradeId,
  connection,
  recipientIds = "",
  name,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [base64File, setBase64File] = useState(null);
  const [fileUrlMap, setFileUrlMap] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [typingMessage, setTypingMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef();
  const emojiButtonRef = useRef(null);
  const previousChatSessionRef = useRef(null);

  const isGradeOnly = gradeId && recipientIds && !chatWithId;
  const isOneToOne = !!chatWithId && !recipientIds;
  const isMultiUser = !!recipientIds && recipientIds.split(",").length > 1;

  const chatSessionId = [userId, chatWithId || "multi"].sort().join("-");

  const { data: chatData, isLoading } = useQuery({
    queryKey: ["chatData", userId, chatWithId, gradeId, recipientIds],
    queryFn: () =>
      isGradeOnly
        ? getChatByGrade(userId, gradeId)
        : getChatHistory(userId, chatWithId),
    // enabled: !!userId && (isGradeOnly || !!chatWithId),
  });

  // Load messages
  useEffect(() => {
    if (chatData?.data) setMessages(chatData.data);
  }, [chatData]);

  // Load file URLs once per chat
  useEffect(() => {
    const loadFiles = async () => {
      if (!chatData?.data) return;

      const fileIds = chatData.data
        .filter((msg) => msg.fileIdentityId && !fileUrlMap[msg.fileIdentityId])
        .map((msg) => msg.fileIdentityId);

      const uniqueIds = [...new Set(fileIds)];

      const result = await Promise.allSettled(
        uniqueIds.map((id) => getImageUrl(id)),
      );

      const updatedMap = {};
      result.forEach((res, i) => {
        if (res.status === "fulfilled") updatedMap[uniqueIds[i]] = res.value;
      });

      setFileUrlMap((prev) => ({ ...prev, ...updatedMap }));
    };

    loadFiles();
  }, [chatData]);

  // SignalR Handlers
  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = async (message) => {
      const isGroup = message.receiverIds?.split(",")?.length > 1;
      const isGroupMode = isMultiUser && !chatWithId;
      const isRelevant =
        (isOneToOne &&
          ((message.senderId === chatWithId && message.receiverId === userId) ||
            (message.senderId === userId &&
              message.receiverId === chatWithId))) ||
        (isGroupMode &&
          isGroup &&
          message.receiverIds?.split(",").includes(userId.toString()) &&
          recipientIds.split(",").includes(message.senderId.toString())) ||
        isGradeOnly;

      if (isRelevant) {
        setMessages((prev) => [...prev, message]);

        const fileId = message.fileIdentityId;
        if (fileId && !fileUrlMap[fileId]) {
          try {
            const url = await getImageUrl(fileId);
            setFileUrlMap((prev) => ({ ...prev, [fileId]: url }));
          } catch {}
        }
      }

      if (message.receiverId === userId && message.senderId === chatWithId) {
        try {
          await updateUnReadMessage(userId, chatWithId);
        } catch (error) {
          console.error("Message read update failed", error);
        }
      }
    };

    const handleTyping = (senderName) => {
      if (senderName === userData.firstName) return;
      setTypingMessage(`${senderName} is typing...`);
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => setTypingMessage(""), 3000);
    };

    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("ReceiveTypingNotification", handleTyping);

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("ReceiveTypingNotification", handleTyping);
    };
  }, [connection, chatWithId, userId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Chat session group
  useEffect(() => {
    if (!connection || !userId || !chatWithId) return;

    const newSessionId = chatSessionId;

    const updateSession = async () => {
      try {
        if (
          previousChatSessionRef.current &&
          previousChatSessionRef.current !== newSessionId
        ) {
          await connection.invoke(
            "LeaveChatSession",
            previousChatSessionRef.current,
          );
        }
        await connection.invoke("JoinChatSession", newSessionId);
        previousChatSessionRef.current = newSessionId;
      } catch (err) {
        console.error("SignalR session update failed:", err);
      }
    };

    updateSession();
  }, [chatWithId, connection]);

  const handleTyping = () => {
    if (connection?.state === "Connected") {
      connection.invoke(
        "SendTypingNotification",
        chatSessionId,
        userData.firstName,
      );
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setBase64File(base64);
      setFile(selected);
    };
    reader.readAsDataURL(selected);
  };
  const handleExportChat = async () => {
    try {
      const response = await exportChatHistory(userData.userId, chatWithId);
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `chat_history.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error.code && error.code == 204) {
        toast.error(error.message);
      }
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !base64File) return;

    const payload = {
      senderId: userId,
      receiverIds: isMultiUser ? recipientIds : chatWithId,
      messageText: newMessage.trim(),
      base64File: base64File || null,
      fileName: file?.name || null,
      fileType: file?.name?.split(".").pop().toLowerCase() || null,
      gradeId,
      replyToMessageId: replyTo?.messageId || null,
      isGroupMessage: recipientIds.length > true || false,
    };

    try {
      await sendMessage(payload);
      setNewMessage("");
      setFile(null);
      setBase64File(null);
      setReplyTo(null);
    } catch (err) {
      console.error("Send failed:", err);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  let lastDate = null;
  let myname = name;
  return (
    <div className="flex h-full flex-col rounded text-white">
      <div className="flex h-16 items-center justify-between border-b border-gray-300 px-4">
        <div className="flex items-center gap-1">
          <div className="text-primary flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-sm font-semibold">
            {myname
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <p className="text-md font-medium text-gray-800">{myname}</p>
        </div>

        {chatWithId && userData.userTypeId != 6 && (
          <button
            className="text-primary border-primary flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium transition hover:bg-[#00446d85] hover:text-white"
            onClick={handleExportChat}
          >
            <ArrowDownSquareIcon className="h-4 w-4" />
            Export Chat
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
        {isLoading ? (
          <LoadingSpinner fullHeight={false} />
        ) : (
          messages.map((msg, idx) => {
            const currentDate = new Date(msg.time).toDateString();
            const showDateDivider = currentDate !== lastDate;
            lastDate = currentDate;

            return (
              <React.Fragment key={idx}>
                {showDateDivider && (
                  <div className="my-4 text-center text-xs text-gray-400">
                    <span className="inline-block w-full border-t border-gray-300" />
                    <span className="relative -top-3 rounded bg-blue-100 px-2 py-0.5 text-gray-800">
                      {formatDate(msg.time)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${msg.senderId === userId ? "justify-end" : isGradeOnly || recipientIds.length > 1 ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-xs rounded px-4 py-2 ${msg.senderId === userId ? "bg-primary text-white" : "bg-[#f1f1f1] text-gray-900"}`}
                  >
                    {msg.replyToMessageId && (
                      <div className="mb-1 rounded border-l-4 border-gray-500 bg-[#3A3A4D] px-2 py-1 text-xs text-gray-300">
                        <div className="font-semibold text-gray-400">
                          Replied to:
                        </div>
                        <div className="max-h-[4.5em] overflow-hidden text-sm leading-5 text-ellipsis">
                          {msg.replyToMessageText?.trim()
                            ? msg.replyToMessageText
                            : msg.replyToMessageId && msg.replyToFileName
                              ? `${msg.replyToFileName.split(/_(.+)/)[1]}`
                              : ""}
                        </div>
                      </div>
                    )}

                    <div>{msg.messageText}</div>
                    {msg.fileIdentityId &&
                      fileUrlMap[msg.fileIdentityId] &&
                      (() => {
                        const url = fileUrlMap[msg.fileIdentityId];
                        const ext = msg.fileName
                          ?.split(".")
                          .pop()
                          .toLowerCase();
                        const isImage = ["jpg", "jpeg", "png"].includes(ext);

                        return isImage ? (
                          <div className="mt-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              <img
                                src={url}
                                alt="attachment"
                                className="max-h-48 rounded border"
                              />
                            </a>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-blue-300 underline">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              {msg.fileName?.split("_").slice(1).join("_") ||
                                "File"}
                            </a>
                          </div>
                        );
                      })()}
                    <div className="mt-1 text-right text-xs opacity-60">
                      {new Date(msg.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {!isGradeOnly && (
                      <button
                        onClick={() => setReplyTo(msg)}
                        className={`absolute top-1 right-1 opacity-50 hover:opacity-100 ${msg.senderId === userId ? "text-gray-300" : "text-black"}`}
                        title="Reply"
                      >
                        <CornerUpLeft size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div className="flex justify-between border-t border-gray-600 bg-[#2C2C3B] px-4 py-2 text-sm text-gray-300">
          <div>
            Replying to:{" "}
            {replyTo.messageText ||
              (replyTo.fileName ? replyTo.fileName.split(/_(.+)/)[1] : "")}
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-4 text-red-400 underline"
          >
            Cancel
          </button>
        </div>
      )}

      {(recipientIds || chatWithId) && (
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 border-t border-gray-300 px-4 py-3"
        >
          {file && (
            <div className="text-xs text-black">
              Attached: {file.name}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setBase64File(null);
                }}
                className="ml-2 text-red-400 underline"
              >
                Remove
              </button>
            </div>
          )}
          <div className="relative flex w-full items-center gap-2">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-primary"
              title="Emoji"
            >
              <Smile />
            </button>
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-12 left-0 z-10"
              >
                <EmojiPicker
                  onEmojiClick={(e) => setNewMessage((prev) => prev + e.emoji)}
                  theme="dark"
                  emojiStyle="native"
                />
              </div>
            )}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="text-primary flex-1 rounded border border-gray-300 px-3 py-2"
            />
            <label className="cursor-pointer">
              <PaperclipIcon className="text-primary h-5 w-5" />
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              type="submit"
              disabled={!newMessage.trim() && !base64File}
              className="bg-primary flex items-center gap-1.5 rounded px-4 py-2 text-white disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4 text-white" />
              Send
            </button>
          </div>
        </form>
      )}

      {typingMessage && (
        <div className="px-4 pb-2 text-sm text-blue-400 italic">
          {typingMessage}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
