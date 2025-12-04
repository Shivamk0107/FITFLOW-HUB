import { useEffect, useRef, useState } from "react";

export function useWebSocket(exercise: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!exercise) return;

    const socketUrl = `ws://127.0.0.1:8000/ws/ai_trainer/${exercise}`;
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log(`✅ Connected to ${exercise} WebSocket`);
    };

    socket.onmessage = (event) => {
      console.log(`📨 Message from ${exercise}:`, event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onerror = (err) => {
      console.error(`❌ WebSocket error (${exercise})`, err);
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.warn(`⚠️ Disconnected from ${exercise}`);
    };

    return () => {
      socket.close();
    };
  }, [exercise]);

  const sendMessage = (data: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      console.warn("WebSocket not connected, cannot send data");
    }
  };

  return { isConnected, messages, sendMessage };
}
