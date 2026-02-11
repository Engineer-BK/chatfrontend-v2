"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload._id;

        // Create socket connection with HTTP long-polling only (no WebSocket)
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
          query: { userId },
          transports: ["polling"], // Force HTTP long-polling instead of WebSocket
          secure: false, // Allow HTTP connection
          rejectUnauthorized: false,
        });

        newSocket.on("getOnlineUsers", (users: string[]) => {
          setOnlineUsers(users);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const SocketData = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("SocketData must be used within SocketProvider");
  }
  return context;
};
