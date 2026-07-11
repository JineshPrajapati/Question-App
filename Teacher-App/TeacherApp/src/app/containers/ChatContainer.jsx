import {
  Send,
  MessageSquare,
  Menu,
  CopyIcon,
  ThumbsUp,
  ThumbsDown,
  Speaker,
  Volume2Icon,
  InfoIcon,
  MicIcon,
  XIcon,
  SendIcon,
  TrashIcon,
} from "lucide-react";
import { ChatBubbleLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import ScaleLoader from "../components/common/ScaleLoader";
import Skeleton from "../components/common/Skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
// import { Tooltip } from "";
import rehypeSanitize from "rehype-sanitize";
import { toast } from "react-toastify";
import MessageSpeaker from "../components/common/MessageSpeaker";
import { Tooltip } from "../components/common/Tooltip";
import { useState } from "react";

export const ChatContainer = ({
  activeChat,
  sendMessage,
  input,
  defaultQuestionsList,
  fetchingMsg,
  setInput,
  isSendingMsg,
  scrollRef,
  messageList,
}) => {
  const [openSource, setOpenSource] = useState({
    flag: false,
    activeThread: null,
  });
  function cleanMarkdown(md) {
    return md
      .replace(/(\d+\.)\n+/g, "$1 ") // Fix "1.\n" into "1. "
      .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
      .trim();
  }
  const handleClear = () => {
    setInput("");
  };
  return (
    <div className="container flex flex-1 flex-col overflow-hidden">
      {/* <div className="container"> 

      </div> */}
      {!isSendingMsg && activeChat == -1 && (
        <div className="flex h-full w-full flex-col items-center justify-end px-4">
          {/* <img src="public/assets/logo/main-logo.png" className="h-20" /> */}
          <SparklesIcon fill="#00446d" stroke="#00446d" className="h-20 w-20" />
          <p className="text-5xl font-medium text-gray-700">
            Chat with your data
          </p>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              "What is included in my Northwind Health Plus plan that is not in standard?",
              "What happens in a performance review?",
              "What does a Product Manager do?",
            ].map((text, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-200 p-4 shadow-2xs transition duration-200 hover:shadow-md"
              >
                <p className="text-xl font-medium text-gray-800">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid w-full grid-cols-2 gap-2">
            {defaultQuestionsList.length > 0 &&
              defaultQuestionsList.map((defaultQue, index) => (
                <div
                  key={index}
                  onClick={() => sendMessage(null, defaultQue.defaultQuestion)}
                  className="hover:border-primary flex h-full cursor-pointer flex-col rounded-md border border-gray-300 p-2 text-left"
                >
                  <p className="text-sm font-bold text-gray-800">
                    {defaultQue.title || ""}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {defaultQue.defaultQuestion || ""}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex w-full flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        {fetchingMsg &&
          [...Array(4)].map((dummyMsg, index) => (
            <Skeleton
              height={index % 2 === 0 ? "10" : "20"}
              count={1}
              color={` max-w-3/4 md:max-w-2/3 ${index % 2 === 0 ? "bg-primary-300 ml-auto self-end " : "bg-gray-300"}`}
            />
          ))}
        {messageList.length > 0 &&
          !fetchingMsg &&
          messageList?.map((msg, index) => (
            <>
              <div
                key={index}
                className={`max-w-3/4 rounded-lg p-3 md:max-w-2/3 ${msg.sender && msg.sender == "user" ? "bg-primary-500 ml-auto w-auto self-end text-left text-white" : "w-auto bg-gray-100 text-left text-black"} `}
              >
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {msg.sender && msg.sender == "user" ? (
                    msg.text
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="my-6 text-4xl font-bold text-gray-900"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="my-5 text-3xl font-semibold text-gray-800"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="my-4 text-2xl font-medium text-gray-700"
                            {...props}
                          />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4
                            className="my-3 text-xl font-semibold text-gray-700"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="my-3 leading-relaxed text-gray-700"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="my-3 list-inside list-disc space-y-1 text-gray-700"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="my-3 ml-6 list-decimal space-y-2 text-gray-800"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            className="ml-2 leading-relaxed text-gray-700"
                            {...props}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-primary my-4 rounded border-l-4 bg-blue-50 px-4 py-2 text-blue-900 italic"
                            {...props}
                          />
                        ),
                        code: ({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }) => {
                          return inline ? (
                            <code
                              className="rounded bg-gray-200 px-1 py-0.5 font-mono text-sm text-purple-700"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <pre className="my-4 overflow-auto rounded bg-gray-900 p-4 font-mono text-sm text-gray-100 shadow-inner">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        },
                        table: ({ node, ...props }) => (
                          <div className="my-4 overflow-auto">
                            <table
                              className="min-w-full border-collapse border border-gray-300"
                              {...props}
                            />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold text-gray-700"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className="border border-gray-300 px-4 py-2 text-gray-600"
                            {...props}
                          />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-primary underline transition-colors hover:text-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                        img: ({ node, ...props }) => (
                          <img
                            className="my-4 h-auto max-w-full rounded-lg shadow"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {cleanMarkdown(msg.text)}
                    </ReactMarkdown>
                  )}
                </div>
                {(msg.sender || msg.from) &&
                  (msg.sender == "bot" || msg.from == "bot") &&
                  msg.context &&
                  msg.context.length > 0 && (
                    <>
                      {index == openSource.activeThread && openSource.flag ? (
                        <button
                          onClick={() => {
                            setOpenSource({
                              flag: false,
                              activeThread: null,
                            });
                          }}
                          className="mb-2 cursor-pointer font-medium text-gray-800 underline"
                        >
                          Hide Source
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setOpenSource({
                              flag: true,
                              activeThread: index,
                            });
                          }}
                          className="mb-2 cursor-pointer font-medium text-gray-800 underline"
                        >
                          View Source
                        </button>
                      )}

                      {index == openSource.activeThread && openSource.flag && (
                        <div className="flex w-full flex-col gap-2">
                          {msg.context.map((ctx, ctxIndex) => (
                            <div
                              key={ctxIndex}
                              className="text-gring-gray-700 flex justify-between rounded-xl bg-white p-2 text-sm"
                            >
                              <div>
                                {`${ctxIndex + 1}. ${ctx.file_name} (Page No. ${ctx.page_number})`}
                              </div>

                              <div>
                                <Tooltip content={<div>{ctx.chunk_text}</div>}>
                                  <InfoIcon className="h-4 w-4 text-gray-700" />
                                </Tooltip>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                {/* <div className="absolute top-2 right-2 flex gap-2">
                <CopyIcon  />
              </div> */}
              </div>
              {(msg.sender || msg.from) &&
                (msg.sender == "bot" || msg.from == "bot") && (
                  <div className="item-center flex w-auto max-w-3/4 gap-3 rounded-lg p-3 text-left text-black md:max-w-2/3">
                    <CopyIcon
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(msg.text);
                          toast.success("Text copied to clipboard!", {
                            position: "bottom-center",
                            autoClose: 1000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: true,
                            progress: undefined,
                          });
                          // alert("Text copied to clipboard!");
                        } catch (err) {
                          // alert("Failed to copy!");
                          console.error(err);
                        }
                      }}
                      className="hover:text-primary h-5 w-5 cursor-pointer text-gray-800"
                    />
                    <MessageSpeaker msg={{ text: msg.text }} />
                    <ThumbsUp
                      onClick={() => {
                        // toast.success("Thank you for your feedback", {
                        //   position: "bottom-center",
                        //   autoClose: 1000,
                        //   hideProgressBar: true,
                        //   closeOnClick: true,
                        //   pauseOnHover: false,
                        //   draggable: true,
                        //   progress: undefined,
                        // });
                      }}
                      className="hover:text-primary h-5 w-5 cursor-pointer text-gray-300"
                    />
                    <ThumbsDown
                      // onClick={() => {
                      //   toast.success("Thank you for your feedback", {
                      //     position: "bottom-center",
                      //     autoClose: 1000,
                      //     hideProgressBar: true,
                      //     closeOnClick: true,
                      //     pauseOnHover: false,
                      //     draggable: true,
                      //     progress: undefined,
                      //   });
                      // }}
                      className="hover:text-primary h-5 w-5 cursor-pointer text-gray-300"
                    />
                    {/* {"speechSynthesis" in window && (
                    <Volume2Icon
                      onClick={() => {
                        if ("speechSynthesis" in window) {
                          setIsSpeaking(!isSpeaking);
                          const utterance = new SpeechSynthesisUtterance(
                            msg.text,
                          );
                          window.speechSynthesis.speak(utterance);
                        } else {
                          alert(
                            "Sorry, your browser doesn't support Text to Speech.",
                          );
                        }
                      }}
                      className="hover:text-primary h-5 w-5 cursor-pointer text-gray-800"
                    />
                  )} */}
                  </div>
                )}
            </>
          ))}
        {/* <ScaleLoader  /> */}
      </div>

      {/* <form
        onSubmit={sendMessage}
        className="shadw flex w-full items-center gap-3 px-4"
      >
        <div className="flex w-full items-center gap-3 border-t border-gray-200 py-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Question..."
            className="focus:ring-primary flex-1 rounded-lg border border-gray-400 p-3 focus:ring-2 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={isSendingMsg}
            type="submit"
            className="bg-primary hover:bg-primary flex items-center gap-2 rounded-lg p-3 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSendingMsg ? (
              <LoadingSpinner fullHeight={false} size={5} color={"white"} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form> */}
      <form
        onSubmit={sendMessage}
        className="relative flex w-full flex-col px-4 py-2"
      >
        {/* <label className="mb-1 text-sm text-gray-500">Prompt</label> */}

        <div className="relative">
          {/* Textarea */}
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Question, Add prompts..."
            className="focus:border-primary focus:ring-primary w-full resize-none rounded-md border border-gray-300 bg-white p-3 pr-20 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />

          {/* Voice icon top-right */}
          <button
            type="button"
            className="text-primary hover:text-primary absolute top-2 right-2"
          >
            <MicIcon className="h-5 w-5" />
          </button>

          {/* Message thread + close icons inside bottom-right */}
          <div className="absolute right-20 bottom-2 flex items-center gap-2">
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <XIcon className="h-4 w-4" />
            </button>
            <ChatBubbleLeftIcon className="h-5 w-5 text-pink-600" />
          </div>

          {/* Character counter */}
          <div className="absolute right-2 bottom-1 mb-1 text-xs text-gray-400">
            {input.length} / 1000
          </div>
        </div>
        <p className="text-start text-xs text-gray-400">
          Use Shift+Enter for new lines.
        </p>

        {/* Buttons */}
        <div className="mt-1 flex justify-end gap-2">
          <button
            type="submit"
            disabled={isSendingMsg}
            className="flex items-center gap-2 rounded-full bg-pink-500 px-6 py-2 text-white shadow-md transition hover:bg-pink-600 disabled:bg-gray-400"
          >
            {isSendingMsg ? (
              <LoadingSpinner fullHeight={false} size={5} color={"white"} />
            ) : (
              <>
                <SendIcon className="h-4 w-4" />
                CHAT
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="bg-primary hover:bg-primary rounded-full p-3 text-white"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Input Field */}
    </div>
  );
};
