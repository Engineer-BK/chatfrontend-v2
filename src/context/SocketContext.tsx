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

    console.log("🔍 [Socket Debug] Initializing socket connection...");
    console.log("🔍 [Socket Debug] Token exists:", !!token);

    if (token) {
      try {
        // Decode the JWT token
        const payload = JSON.parse(atob(token.split(".")[1]));

        console.log("🔍 [Socket Debug] Full JWT payload:", payload);

        // Try different possible user ID fields
        const userId =
          payload._id || payload.id || payload.userId || payload.sub;

        console.log("🔍 [Socket Debug] User ID extracted:", userId);
        console.log(
          "🔍 [Socket Debug] Socket URL:",
          process.env.NEXT_PUBLIC_SOCKET_URL
        );

        if (!userId) {
          console.error("❌ [Socket] No user ID found in token payload!");
          console.error(
            "❌ [Socket] Available payload keys:",
            Object.keys(payload)
          );
          return;
        }

        // Create socket connection
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
          query: { userId },
          transports: ["websocket", "polling"],
        });

        console.log(
          "🔍 [Socket Debug] Socket instance created with userId:",
          userId
        );

        // Connection successful
        newSocket.on("connect", () => {
          console.log("✅ [Socket] Connected successfully!");
          console.log("✅ [Socket] Socket ID:", newSocket.id);
          console.log("✅ [Socket] User ID sent:", userId);
          console.log(
            "✅ [Socket] Transport:",
            newSocket.io.engine.transport.name
          );
        });

        // Connection error
        newSocket.on("connect_error", (error) => {
          console.error("❌ [Socket] Connection error:", error);
          console.error("❌ [Socket] Error message:", error.message);
        });

        // Disconnected
        newSocket.on("disconnect", (reason) => {
          console.warn("⚠️ [Socket] Disconnected. Reason:", reason);
        });

        // Online users event
        newSocket.on("getOnlineUser", (users: string[]) => {
          console.log("👥 [Socket] Online users received:", users);
          console.log("👥 [Socket] Number of online users:", users.length);
          console.log(
            "👥 [Socket] Is current user online?",
            users.includes(userId)
          );
          setOnlineUsers(users);
        });

        // Typing event
        newSocket.on("userTyping", (data) => {
          console.log("⌨️ [Socket] User typing:", data);
        });

        // Stopped typing event
        newSocket.on("userStoppedTyping", (data) => {
          console.log("⌨️ [Socket] User stopped typing:", data);
        });

        // New message event
        newSocket.on("newMessage", (message) => {
          console.log("💬 [Socket] New message received:", message);
        });

        // Messages seen event
        newSocket.on("messagesSeen", (data) => {
          console.log("✓✓ [Socket] Messages seen:", data);
        });

        // Catch-all for any events
        newSocket.onAny((eventName, ...args) => {
          console.log(`📡 [Socket] Event received: ${eventName}`, args);
        });

        setSocket(newSocket);
        console.log("🔍 [Socket Debug] Socket set in state");

        return () => {
          console.log("🔌 [Socket] Cleaning up socket connection");
          newSocket.close();
        };
      } catch (error) {
        console.error("❌ [Socket] Failed to initialize socket:", error);
        if (error instanceof Error) {
          console.error("❌ [Socket] Error stack:", error.stack);
        }
      }
    } else {
      console.warn(
        "⚠️ [Socket] No token found - skipping socket initialization"
      );
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
