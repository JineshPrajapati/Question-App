import { useContext, useEffect, useRef, useState } from "react";
import {
  Send,
  MessageSquare,
  Menu,
  MenuIcon,
  PanelLeftOpenIcon,
  PanelLeftOpen,
  PanelRightOpen,
  Settings,
} from "lucide-react";
import {
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  archiveThread,
  deleteThread,
  getDefaultQuestions,
  listMessages,
  listThreads,
  queryOpenAI,
  renameThread,
} from "../../api/services/chatService";
import toast from "react-hot-toast";
import { AuthContext } from "../../contexts/authContext";
import { useNavigate } from "react-router";
import Skeleton from "../components/common/Skeleton";
import { ChatContainer } from "../containers/ChatContainer";

export default function ChatLayout() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(-1);
  const [threadList, setThreadList] = useState([]);
  const [threadNewName, setThreadNewName] = useState("");
  const [isRenaming, setRenamingStatus] = useState(false);
  const [openMenuThreadId, setOpenMenuThreadId] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewThread, setNewThreadStatus] = useState(true);
  const [defaultQuestionsList, setDefaultQuestionsList] = useState([]);
  const { user: userData, currSelectedFacility } = useContext(AuthContext);

  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  // const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setOpenMenuIndex(null);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);
  const fakeBotReply = (question) => {
    // Simulate dynamic bot response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`This is the bot's answer to: "${question}"`);
      }, 1000);
    });
  };

  const streamBotMessage = (text, context = null) => {
    let currentText = "";
    let index = 0;

    const interval = setInterval(() => {
      currentText += text[index];
      index++;

      // Either update existing bot typing message or add it if not present
      setMessageList((prevMessages) => {
        const last = prevMessages[prevMessages.length - 1];
        if (last?.from === "bot_typing") {
          return [
            ...prevMessages.slice(0, -1),
            { from: "bot_typing", text: currentText },
          ];
        } else {
          return [...prevMessages, { from: "bot_typing", text: currentText }];
        }
      });

      if (index === text.length) {
        clearInterval(interval);
        // Replace "bot_typing" with final bot message
        setMessageList((prev) => [
          ...prev.slice(0, -1),
          { from: "bot", text, context: context },
        ]);
        // setIsBotTyping(false);
      }
    }, 1); // Adjust speed here
  };

  const { mutate: queryMutation, isPending: isSendingMsg } = useMutation({
    mutationFn: (payload) => queryOpenAI(payload),
    onSuccess: (response) => {
      if (response.status === 200) {
        if (activeChat === -1) {
          setThreadId(response.data.message.thread_id);
          getThreads();
          setActiveChat(0);
        }
        streamBotMessage(
          response.data.message.answer,
          response?.data?.context || null,
        );
      } else {
        setMessageList((prev) => prev.slice(0, -1));
      }
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
      setMessageList((prev) => prev.slice(0, -1));
    },
  });
  const { data: defaultQuestions, isLoading: loadingDefaultQuestions } =
    useQuery({
      queryKey: ["defaultQuestions"],
      queryFn: () =>
        getDefaultQuestions(`${userData.userTypeId & currSelectedFacility}`),
    });
  // console.log(defaultQuestions);
  useEffect(() => {
    if (defaultQuestions?.data?.data && defaultQuestions.data.data.length > 0) {
      setDefaultQuestionsList(defaultQuestions.data.data);
    }
  }, [defaultQuestions]);
  // console.log(defaultQuestions, "defaultQuestions");
  const { mutate: getThreadsMutation, isPending: loadingThreads } = useMutation(
    {
      mutationFn: (payload) => listThreads(payload),
      onSuccess: (response) => {
        if (response.isSuccess) {
          setThreadList(response.data);
        } else {
          toast.error(response.message || "An error occurred");
        }
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred");
      },
    },
  );

  const { mutate: renamethreadMutation, isPending: renamingThread } =
    useMutation({
      mutationFn: (payload) => renameThread(payload),
      onSuccess: (response) => {
        if (response.isSuccess) {
          const updatedThreads = threadList.map((thread) =>
            thread.thread_id === openMenuThreadId
              ? { ...thread, thread_title: threadNewName }
              : thread,
          );
          setThreadList([...updatedThreads]);
          setRenamingStatus(false);
        }
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred");
      },
    });

  const { mutate: deletethreadMutation, isPending: deletingThread } =
    useMutation({
      mutationFn: (payload) => deleteThread(payload),
      onSuccess: (response) => {
        if (response.isSuccess) {
          setThreadList((prevThreads) =>
            prevThreads.filter(
              (thread) => thread.thread_id !== openMenuThreadId,
            ),
          );
          if (threadId === openMenuThreadId) {
            setMessageList([]);
            setInput("");
            setActiveChat(-1);
            setNewThreadStatus(true);
            setThreadId(null);
          }
          setOpenMenuIndex(null);
          setOpenMenuThreadId(null);
        }
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred");
      },
    });

  const { mutate: archivedthreadMutation, isPending: archivingThread } =
    useMutation({
      mutationFn: (payload) => archiveThread(payload),
      onSuccess: (response) => {
        if (response.isSuccess) {
          setThreadList((prevThreads) =>
            prevThreads.filter(
              (thread) => thread.thread_id !== openMenuThreadId,
            ),
          );
          if (threadId === openMenuThreadId) {
            setMessageList([]);
            setInput("");
            setActiveChat(-1);
            setNewThreadStatus(true);
            setThreadId(null);
          }
          setOpenMenuIndex(null);
          setOpenMenuThreadId(null);
        }
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred");
      },
    });

  const { mutate: getMessagesFromThreadMutation, isPending: fetchingMsg } =
    useMutation({
      mutationFn: (payload) => listMessages(payload),
      onSuccess: (response) => {
        if (response.isSuccess) {
          try {
            const formattedMessages = response.data?.reduce(
              (msg, { question, answer, context = null }) => {
                msg.push(
                  { text: question, sender: "user" },
                  { text: answer, sender: "bot", context },
                );
                return msg;
              },
              [],
            );
            setMessageList(formattedMessages || []);
          } catch (e) {
            console.error(e);
          }
        } else {
          toast.error(response.message || "An error occurred");
        }
      },
      onError: (error) => {
        toast.error(error.message || "An error occurred");
      },
    });

  const getThreads = () => {
    getThreadsMutation({ userId: userData.userId });
  };

  const getMessages = () => {
    getMessagesFromThreadMutation(threadId);
  };

  useEffect(() => {
    getThreads();
  }, []);

  useEffect(() => {
    if (threadId !== null && !isNewThread) {
      getMessages();
    }
  }, [threadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageList]);

  const sendMessage = (e, msg) => {
    let newQue = "";
    if (e) {
      e.preventDefault();
      if (!input.trim()) return;
      newQue = input;
    } else {
      newQue = msg;
    }
    setMessageList([...messageList, { text: newQue, sender: "user" }]);
    setInput("");
    const queryObject = {
      store: `${currSelectedFacility}_${userData.userTypeId}`,
      query: newQue,
      user_id: userData.userId,
      user_type: userData.userTypeId.toString(),
      facility_id: currSelectedFacility.toString(),
      ...(threadId && { thread_id: threadId }),
    };
    queryMutation(queryObject);
  };

  return (
    <div
      className={`flex h-full ${sidebarOpen && "bg-[#00000061] sm:bg-transparent md:bg-transparent"} `}
    >
      {/* Sidebar */}

      {/* Main Chat Area */}
      <div
        className={`flex h-full w-full flex-col items-center overflow-hidden rounded-md bg-white transition-all ${sidebarOpen ? "" : "md:ml-0"} `}
      >
        <div className="hidden h-16 w-full items-center justify-between border-b-1 border-gray-200 bg-white px-4 md:flex">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="ml-1 text-xl font-bold">AI Assistance</span>
              {/* <span className="text-primary ml-1 text-xl font-bold">AI</span> */}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button>
              <Settings />
            </button>
            {activeChat !== -1 && (
              <button
                className="hover:text-primary hover:border-primary flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-2 py-1 text-sm font-bold text-gray-700 hover:border"
                onClick={() => {
                  setActiveChat(-1);
                  setMessageList([]);
                  setInput("");
                  setThreadId(null);
                  setNewThreadStatus(true);
                }}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                New Chat
              </button>
            )}
            <button
              className="text-primary text-sm font-bold"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {/* {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"} */}
              {/* <MenuIcon /> */}
              {!sidebarOpen && (
                <PanelLeftOpen className="h-6 w-6 text-gray-800" />
              )}
            </button>
            {/* <div
              onClick={() => {
                navigate("/");
              }}
              className="flex h-16 cursor-pointer items-center px-3"
            >
              <img
                className="h-8 w-auto"
                src="/assets/logo/logo-symbol.svg"
                alt="Caregiver Logo"
              />
             
            </div> */}
          </div>
        </div>

        <div className="flex w-full items-center justify-between border-b-1 border-gray-200 p-4 text-gray-800 md:hidden">
          <div className="flex items-center">
            {/* <span className="ml-1 text-xl font-bold">Caregiver</span> */}
            <span className="ml-1 text-xl font-bold">AI Assistance</span>
            {/* <span className="text-primary ml-1 text-xl font-bold">AI</span> */}
          </div>
          <div className="flex items-center gap-2">
            {activeChat !== -1 && (
              <button
                className="items-cente hover:text-primary hover:border-primary flex cursor-pointer gap-2 rounded-md border border-gray-300 px-2 py-1 text-sm font-bold text-gray-700 hover:border"
                onClick={() => {
                  setActiveChat(-1);
                  setMessageList([]);
                  setInput("");
                  setThreadId(null);
                  setNewThreadStatus(true);
                }}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                New Chat
              </button>
            )}
            <button onClick={() => setSidebarOpen(true)}>
              {/* <Menu size={24} /> */}
              <PanelLeftOpen className="h-6 w-6 text-gray-800" />
            </button>
          </div>
        </div>

        <ChatContainer
          activeChat={activeChat}
          scrollRef={scrollRef}
          messageList={messageList}
          defaultQuestionsList={defaultQuestionsList}
          input={input}
          fetchingMsg={fetchingMsg}
          setInput={setInput}
          isSendingMsg={isSendingMsg}
          sendMessage={sendMessage}
        />
      </div>
      <div
        className={`fixed right-0 z-50 flex h-full flex-col overflow-hidden bg-white shadow-lg transition-all md:relative ${sidebarOpen ? "translate-x-0" : "translate-x-full"} md:translate-x-0 ${sidebarOpen ? "md:w-1/5" : "md:w-0"} md:min-w-[240px]" w-2/3 sm:w-1/2`}
      >
        <div className="flex h-16 items-center border-b border-gray-200 px-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-xl text-gray-700"
          >
            {/* ✖ */}
            {sidebarOpen && (
              <PanelRightOpen className="h-6 w-6 text-gray-800" />
            )}
          </button>
          {/* <MenuIcon className="h-6 w-6 text-gray-800" /> */}
          <h2 className="text-md text-left font-bold text-gray-700">
            Chat History
          </h2>
        </div>
        <div className="max-h-full flex-1 overflow-y-auto px-2 py-4">
          {loadingThreads ? (
            <Skeleton count={4} />
          ) : (
            <ul className="space-y-1">
              {threadList.length > 0 ? (
                threadList.map((chat, index) => (
                  <li key={chat.thread_id}>
                    {isRenaming && index === openMenuIndex ? (
                      <form
                        className="relative"
                        onSubmit={(e) => {
                          e.preventDefault();
                          renamethreadMutation({
                            threadId: openMenuThreadId,
                            title: threadNewName,
                          });
                        }}
                      >
                        <input
                          type="text"
                          ref={inputRef}
                          onChange={(e) => setThreadNewName(e.target.value)}
                          value={threadNewName}
                          className="w-full rounded-md border border-gray-300 py-2 pr-14 pl-2 text-sm"
                          placeholder="Type here...."
                        />
                        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 transform items-center space-x-0">
                          <button
                            type="submit"
                            className="text-gray-800 hover:text-green-500"
                          >
                            <CheckCircleIcon className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => setRenamingStatus(false)}
                            className="text-gray-800 hover:text-red-500"
                          >
                            <XCircleIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div
                        onClick={() => {
                          if (isSendingMsg) return;
                          setNewThreadStatus(false);
                          setActiveChat(index);
                          setThreadId(chat.thread_id);
                          setOpenMenuIndex(null);
                        }}
                        className={`group flex cursor-pointer items-center justify-between rounded px-2 py-2 text-left text-sm ${
                          activeChat === index
                            ? "bg-primary text-white"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        <span className="w-full truncate">
                          {chat.thread_title}
                        </span>
                        <div className="relative">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuIndex(
                                openMenuIndex === index ? null : index,
                              );
                              setOpenMenuThreadId(chat.thread_id);
                            }}
                            className={`right-1 flex items-center justify-center rounded p-1 ${
                              openMenuIndex === index
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <EllipsisVerticalIcon
                              className={`h-5 w-5 ${activeChat == index ? "text-white" : "text-gray-800"}`}
                            />
                          </div>
                          {openMenuIndex === index && (
                            <ul
                              className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-gray-600 bg-white shadow-lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <li
                                onClick={() => {
                                  setRenamingStatus(true);
                                  setThreadNewName(chat.thread_title);
                                }}
                                className={`cursor-pointer px-4 py-2 text-gray-800 hover:bg-gray-100`}
                              >
                                Rename Thread
                              </li>
                              <li
                                onClick={() =>
                                  deletethreadMutation({
                                    threadId: chat.thread_id,
                                  })
                                }
                                className={`cursor-pointer px-4 py-2 text-gray-800 hover:bg-gray-100`}
                              >
                                Delete Thread
                              </li>
                              <li
                                onClick={() =>
                                  archivedthreadMutation({
                                    threadId: chat.thread_id,
                                  })
                                }
                                className={`cursor-pointer px-4 py-2 text-gray-800 hover:bg-gray-100`}
                              >
                                Archive Thread
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <p>No Thread Found.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
