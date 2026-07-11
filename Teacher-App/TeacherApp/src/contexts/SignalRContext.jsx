import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as signalR from "@microsoft/signalr";
import { AuthContext } from "./authContext";
import { useNotification } from "./NotificationContext";

export const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const { user: userData } = useContext(AuthContext);
  const [connection, setConnection] = useState(null);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const connectionRef = useRef(null);
  const connectedUserIdRef = useRef(null); // 🛠️ New
  const { setTotalUnReadMessage } = useNotification();

  useEffect(() => {
    if (!userData?.userId) return;
    if (connectedUserIdRef.current === userData.userId) return; // 🛠️ No duplicate connection

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `${import.meta.env.VITE_API_BASE_URL}/chathub?userId=${userData.userId}`,
      )
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => {
        console.log("SignalR Connected ✅");
        connectionRef.current = newConnection;
        setConnection(newConnection);
        connectedUserIdRef.current = userData.userId; // mark as connected

        newConnection.on("ReceiveMessage", (message) => {
          const { senderId, receiverId } = message;
          if (
            userData.userId === receiverId &&
            window.location.pathname !== "/chatMessage"
          ) {
            setHasUnreadChat(true);
            setTotalUnReadMessage((prv) => prv + 1);
          }
        });
      })
      .catch((err) => console.error("SignalR Connection Failed ❌:", err));

    return () => {
      newConnection.stop();
      console.log("SignalR Disconnected 🛑");
      connectedUserIdRef.current = null;
    };
  }, [userData?.userId]);

  return (
    <SignalRContext.Provider
      value={{ connection, hasUnreadChat, setHasUnreadChat }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);
