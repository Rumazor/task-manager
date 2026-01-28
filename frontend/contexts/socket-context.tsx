"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineCount: number;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineCount: 0,
  subscribe: () => () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: React.ReactNode;
  token: string | null;
}

export function SocketProvider({ children, token }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const { toast } = useToast();
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const newSocket = io(`${socketUrl}/events`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Handle online users count
    newSocket.on("users:online", (data: { count: number }) => {
      setOnlineCount(data.count);
    });

    // Handle notifications
    newSocket.on("notification:new", (notification: any) => {
      toast({
        title: notification.title,
        description: notification.message,
      });
    });

    // Forward events to subscribers
    const events = ["task:created", "task:updated", "task:deleted"];
    events.forEach((event) => {
      newSocket.on(event, (data: any) => {
        const callbacks = subscribersRef.current.get(event);
        if (callbacks) {
          callbacks.forEach((callback) => callback(data));
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, toast]);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(event)) {
      subscribersRef.current.set(event, new Set());
    }
    subscribersRef.current.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      subscribersRef.current.get(event)?.delete(callback);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineCount, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
}
