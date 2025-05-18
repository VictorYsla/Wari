import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { baseURL } from "@/app/api/helpers";

let globalSocket: Socket | null = null;

export default function useTripSocket(
  id: string,
  onTripStatusChange: (trip: any) => void
) {
  const previousRoomRef = useRef<string | null>(null);
  const hasDisconnectedOnceRef = useRef(false); // ✅ Cambio: ref en vez de estado

  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = () => {
    if (globalSocket) return;

    const socket = io(`${baseURL}`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
      reconnectionDelayMax: 5000,
    });

    globalSocket = socket;

    socket.on("connect", () => {
      if (hasDisconnectedOnceRef.current && previousRoomRef.current) {
        socket.emit("join-trip-room", { id: previousRoomRef.current });
        setIsConnected(true);
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      setIsConnected(false);
      hasDisconnectedOnceRef.current = true; // ✅ Cambio aquí
    });

    socket.on("reconnect", () => {
      if (previousRoomRef.current) {
        socket.emit("join-trip-room", { id: previousRoomRef.current });
        setIsConnected(true);
      }
    });

    socket.on("trip-status-change", (trip) => {
      onTripStatusChange(trip);
    });
  };

  useEffect(() => {
    connectSocket();
  }, [onTripStatusChange]);

  useEffect(() => {
    if (!id || !globalSocket) return;

    if (previousRoomRef.current && previousRoomRef.current !== id) {
      globalSocket.emit("leave-trip-room", { id: previousRoomRef.current });
    }

    globalSocket.emit("join-trip-room", { id });
    setIsConnected(true);
    previousRoomRef.current = id;
  }, [id]);

  function disconnectTripSocket() {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
  }

  function forceReconnect() {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
    setIsConnected(false);
    connectSocket();
  }

  return {
    disconnectTripSocket,
    forceReconnect,
    isConnected,
  };
}
