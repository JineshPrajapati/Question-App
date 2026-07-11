import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./authContext";
import { getNotification } from "../api/services/notificationService";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user: userData, currSelectedSchool } = useContext(AuthContext);
  const schoolId = currSelectedSchool;
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [totalUnReadMsg, setTotalUnReadMessage] = useState(0);

  useEffect(() => {
    if (userData?.userId && schoolId) {
      getNotification(userData.userId, schoolId)
        .then((res) => {
          setHasUnreadMessages(res.data.data[0].notification > 0);
          setTotalUnReadMessage(res.data.data[0].unReadMessages);
        })
        .catch(() => setHasUnreadMessages(false));
    }
  }, [userData?.userId, schoolId]);

  return (
    <NotificationContext.Provider
      value={{
        hasUnreadMessages,
        setHasUnreadMessages,
        totalUnReadMsg,
        setTotalUnReadMessage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
