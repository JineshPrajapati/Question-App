import { useContext, useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { AuthContext } from "../../contexts/authContext";

import { useSignalR } from "../../contexts/SignalRContext";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "../layouts/MainLayout";
import { FormLabel, FormSelect } from "../components/form/FormElements";
import {
  getTeachersGradeList,
  getStudentDropdown,
} from "../../api/services/dropDownMasterService";
import { exportChatHistory } from "../../api/services/familyPortalChatService";
import { useNotification } from "../../contexts/NotificationContext";
import ChatWindow from "../components/Chat/chatWindow";
import { toast } from "react-toastify";
import { ArrowDownSquareIcon, SendIcon } from "lucide-react";

export const Chats = () => {
  const {
    user: userData,
    currSelectedSchool,
    currSelectedAcademicYear,
  } = useContext(AuthContext);
  const schoolId = currSelectedSchool;
  const loggedInUserId = userData.userId;

  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [gradeId, setGradeId] = useState(userData.userTypeId == 2 ? "0" : "0");
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [chatWithId, setChatWithId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [userTypeId, setUserTypeId] = useState(
    userData.userTypeId === 3 // supritendent
      ? "2"
      : userData.userTypeId === 4 //admin
        ? "3"
        : userData.userTypeId === 6 || userData.userTypeId === 2 //(guardian or principal)
          ? "1"
          : "5",
  );

  const { connection, hasUnreadChat, setHasUnreadChat } = useSignalR();
  const connectionRef = useRef(connection);
  const chatWithIdRef = useRef(chatWithId);

  const {
    hasUnreadMessages,
    setHasUnreadMessages,
    totalUnReadMsg,
    setTotalUnReadMessage,
  } = useNotification();

  useEffect(() => {
    chatWithIdRef.current = chatWithId;
  }, [chatWithId]);

  useEffect(() => {
    if (!connection) return;

    connectionRef.current = connection;

    const receiveMessageHandler = (message) => {
      const { senderId, receiverId, receiverIds } = message;

      const currentChatWithId = chatWithIdRef.current;
      const currentRecipientIds = selectedStudentIdsRef.current || [];
      const isGroupChat = !currentChatWithId && currentRecipientIds.length > 1;
      const isGradeChat =
        !currentChatWithId &&
        currentRecipientIds.length === 0 &&
        selectedGradeId;

      const isMessageGroup = receiverIds?.split(",")?.length > 1;
      const isMessageToTeacher = receiverId == loggedInUserId;

      if (isGroupChat && isMessageGroup && isMessageToTeacher) {
        // Group mode + group message → append
        appendMessage(message);
      } else if (currentChatWithId === senderId && !isMessageGroup) {
        // 1-to-1 mode + direct message
        appendMessage(message);
      } else if (isGradeChat) {
        // In grade chat, allow only messages sent with gradeId (handled separately)
        appendMessage(message); // or do extra validation on gradeId
      } else if (senderId != userData.userId && senderId != chatWithId) {
        // not current chat
        setHasUnreadChat(true);
        setTotalUnReadMessage((prv) => prv + 1);
        setStudents((prevStudents) => {
          const updatedList = prevStudents.map((student) =>
            student.value === senderId
              ? {
                  ...student,
                  unReadMessages: (student.unReadMessages || 0) + 1,
                }
              : student,
          );

          const sender = updatedList.find((s) => s.value === senderId);
          const others = updatedList.filter((s) => s.value !== senderId);

          return sender ? [sender, ...others] : updatedList;
        });
      } else if (senderId == userData.userId) {
        setStudents((prevStudents) => {
          const sender = prevStudents.find((s) => s.value === receiverId);
          const others = prevStudents.filter((s) => s.value !== receiverId);

          return sender ? [sender, ...others] : prevStudents;
        });
      }
    };
    connection.on("ReceiveMessage", receiveMessageHandler);

    return () => {
      connection.off("ReceiveMessage", receiveMessageHandler);
    };
  }, [connection, loggedInUserId]);

  const selectedStudentIdsRef = useRef([]);

  useEffect(() => {
    selectedStudentIdsRef.current = selectedStudentIds;
  }, [selectedStudentIds]);

  useEffect(() => {
    if (selectedStudentIds.length === 1) {
      // 1-to-1 Chat
      setChatWithId(selectedStudentIds[0]);
      const student = students.find((s) => s.value === selectedStudentIds[0]);
      setSelectedStudent(student || null);
    } else if (selectedStudentIds.length > 1) {
      // Group Chat
      setChatWithId(null);
      setSelectedStudent(null);
    } else {
      // Grade-level Chat or nothing selected
      setChatWithId(null);
      setSelectedStudent(null);
    }
  }, [selectedStudentIds, students]);
  const { data: gradeData } = useQuery({
    queryKey: ["gradeData", loggedInUserId, currSelectedAcademicYear],
    queryFn: () =>
      getTeachersGradeList(loggedInUserId, schoolId, currSelectedAcademicYear),
  });
  const type = userData.userTypeId === 3 ? "Teachers" : "students";
  const { data: studentDropdownData } = useQuery({
    queryKey: [
      "students",
      schoolId,
      gradeId,
      currSelectedAcademicYear,
      userTypeId,
    ],
    queryFn: () =>
      getStudentDropdown(schoolId, gradeId, loggedInUserId, userTypeId),
    enabled: !!gradeId,
  });

  useEffect(() => {
    if (gradeData?.isSuccess) setGrades(gradeData.data?.data || []);
  }, [gradeData]);

  useEffect(() => {
    if (studentDropdownData?.isSuccess)
      setStudents(studentDropdownData.data?.data || []);
  }, [studentDropdownData]);

  const handleStudentClick = (student) => {
    setChatWithId(student.value);
    setChatWithId(`${student.studentId}_${student.value}`);
    setSelectedStudent(student);
    setSelectedStudentIds([student.value]);
    setSelectedStudents((prev) => {
      if (prev.find((s) => s.studentId === student.studentId)) return prev; // already exists
      return [...prev, student];
    });
    handleUnreadMessage(student);
    setStudents((prevStudents) =>
      prevStudents.map((s) =>
        s.value === student.value ? { ...s, unReadMessages: 0 } : s,
      ),
    );
  };

  const handleUnreadMessage = (std) => {
    if (std.unReadMessages > 0) {
      setTotalUnReadMessage((prvCount) => {
        return prvCount - std.unReadMessages;
      });
    }
  };

  useEffect(() => {
    if (totalUnReadMsg == 0) {
      setHasUnreadMessages(false);
      setHasUnreadChat(false);
    }
  }, [totalUnReadMsg]);

  const handleExportChat = async () => {
    try {
      const response = await exportChatHistory(loggedInUserId, chatWithId);
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
  return (
    <div className="flex h-full w-full rounded-md border border-gray-200 bg-white shadow-2xl">
      <div className="flex h-full w-1/4 flex-col border-r border-gray-300">
        <div className="h-27 items-center border-b border-gray-300 bg-white px-4 text-left">
          <h1 className="text-xl font-bold text-gray-800">Chat</h1>
          <div className="flex gap-2">
            <div className="items-center gap-2">
              <label
                htmlFor="group"
                className="my-1 block text-sm font-medium text-gray-700"
              >
                Group
              </label>
              <select
                id="group"
                name="group"
                className="focus:border-primary focus:ring-primary mt-0 w-full max-w-50 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                value={userTypeId}
                onChange={(e) => {
                  const selectedGroupId = e.target.value;
                  setUserTypeId(selectedGroupId);

                  // Clear selection and data when group changes
                  setGradeId("0");
                  setSelectedGradeId("");
                  setChatWithId(null);
                  setSelectedStudent(null);
                  setSelectedStudentIds([]);
                  setSelectedStudents([]);
                  setStudents([]);
                }}
              >
                <option value="1">Teacher</option>
                {userData.userTypeId != 6 && (
                  <option value="2">Principal</option>
                )}
                {userData.userTypeId != 6 && (
                  <>
                    <option value="4">Administrator</option>
                    <option value="3">Superintendent</option>
                  </>
                )}
                {(userData.userTypeId == 1 || userData.userTypeId == 2) && (
                  <option value="5">Student</option>
                )}
              </select>
            </div>
            {(userData.userTypeId == 1 || userData.userTypeId == 2) &&
              userTypeId == "5" && (
                <div className="items-center gap-2">
                  <label
                    htmlFor="grade"
                    className="my-1 block text-sm font-medium text-gray-700"
                  >
                    Grade
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    className="focus:border-primary focus:ring-primary w-full max-w-50 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    value={gradeId}
                    onChange={(e) => {
                      const selectedGrade = e.target.value;
                      setGradeId(selectedGrade);
                      setSelectedGradeId(selectedGrade);
                      setChatWithId(null);
                      setSelectedStudent(null);
                      setSelectedStudentIds([]);
                      setSelectedStudents([]);
                      setStudents([]);
                    }}
                  >
                    <option value="0">Select All</option>
                    {grades.map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
          </div>
          <div className="mb-3 flex items-center gap-4"></div>
          <div className="flex items-center gap-4"></div>
        </div>
        {userData.userTypeId != 2 && students.length > 0 && (
          <div className="flex gap-2 px-4 py-3 text-start">
            <input
              type="checkbox"
              id="SelectAll"
              checked={
                students.length > 0 &&
                selectedStudentIds.length === students.length
              }
              onChange={(e) => {
                if (e.target.checked) {
                  const allStudentIds = students.map((s) => s.value);
                  setSelectedStudentIds(allStudentIds);
                  setSelectedStudents(students);
                  setChatWithId(null);
                } else {
                  setSelectedStudentIds([]);
                  setSelectedStudents([]);
                }
              }}
            />
            <label htmlFor="SelectAll">Select All</label>
          </div>
        )}
        <div className="h-full flex-1 overflow-hidden">
          <div className="max-h-full overflow-y-auto">
            {students.map((student) => {
              const isSelected = selectedStudentIds.includes(student.value);
              return (
                <div
                  key={student.value}
                  className={`flex items-center gap-2 border-t border-gray-300 bg-white px-4 py-3 hover:bg-blue-50 ${
                    isSelected ? "bg-blue-100" : ""
                  } last:border-b`}
                >
                  {userData.userTypeId != 2 && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const updatedIds = [
                            ...selectedStudentIds,
                            student.value,
                          ];
                          const updatedStudents = [
                            ...selectedStudents,
                            student,
                          ];
                          setSelectedStudentIds(updatedIds);
                          setSelectedStudents(updatedStudents);

                          if (updatedIds.length == 1) {
                            setChatWithId(null); // switch to group chat
                            setSelectedStudent(null);
                          }
                        } else {
                          const updatedIds = selectedStudentIds.filter(
                            (id) => id !== student.value,
                          );
                          const updatedStudents = selectedStudents.filter(
                            (s) => s.value !== student.value,
                          );
                          setSelectedStudentIds(updatedIds);
                          setSelectedStudents(updatedStudents);

                          if (updatedIds.length === 1) {
                            setChatWithId(updatedIds[0]); // back to single chat
                            const singleStudent = students.find(
                              (s) => s.value === updatedIds[0],
                            );
                            setSelectedStudent(singleStudent);
                          } else {
                            setChatWithId(null);
                            setSelectedStudent(null);
                          }
                        }
                      }}
                    />
                  )}

                  <div
                    onClick={() => handleStudentClick(student)}
                    className="flex w-full cursor-pointer items-center gap-2"
                  >
                    <div className="text-primary flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-sm font-semibold">
                      {(student.guardianName || student.label)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="text-left font-medium">
                        {student.label}
                      </span>
                      <span className="text-left text-xs text-gray-600">
                        {student.guardianName || student.schoolName}
                      </span>
                    </div>

                    {/* Right (Unread Badge) */}
                    {student.unReadMessages > 0 && (
                      <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {student.unReadMessages > 99
                          ? "99+"
                          : student.unReadMessages}
                      </div>
                    )}
                    {/* {true && (
                      <div className="bg-primary ml-auto flex items-center justify-center rounded-full p-1 text-[10px] font-bold text-white">
                        100
                      </div>
                    )} */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-3/4">
        {console.log("selectedStudent", selectedStudent)}
        {connection &&
        (selectedStudentIds.length > 0 ||
          (selectedGradeId && selectedStudentIds.length === 0)) ? (
          <ChatWindow
            userData={userData}
            userId={loggedInUserId}
            chatWithId={
              selectedStudentIds.length === 1 ? selectedStudentIds[0] : null
            }
            recipientIds={
              selectedStudentIds.length > 1 ? selectedStudentIds.join(",") : ""
            }
            gradeId={selectedGradeId || null}
            connection={connection}
            name={
              selectedStudentIds.length > 1
                ? "" //selectedStudent.guardianName
                : selectedStudent?.guardianName || selectedStudent?.label || ""
            }
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 rounded-xl bg-gray-50 text-gray-400">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-gray-200">
              <SendIcon className="h-[35px] w-[35px] text-gray-700" />{" "}
            </div>
            {userData.userTypeId == 6 ? (
              <p className="text-md font-medium">
                Select a teacher to start chat
              </p>
            ) : (
              <p className="text-md font-medium text-gray-800">
                Select a student or group to start chat
              </p>
            )}
            {/* {userData.userTypeId == 6 ? (
              <p className="text-sm">Select a teacher to start chat</p>
            ) : (
              <p className="text-sm">Select a student or grade to start chat</p>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};
