import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { baseURL } from "@/app/api/helpers";

let globalSocket: Socket | null = null;

export default function useTripSocket(
  id: string,
  onTripStatusChange: (trip: any) => void
) {
  const previousRoomRef = useRef<string | null>(null);

  const [hasDisconnectedOnce, setHasDisconnectedOnce] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (globalSocket) return;

    const socket = io(`${baseURL}`, {
      reconnection: true,
      reconnectionAttempts: Infinity, // reconectar infinitamente
      reconnectionDelay: 1000, // intentar cada segundo
      timeout: 20000, // tiempo máximo para conectar
      reconnectionDelayMax: 5000, // limita el tiempo entre reconexiones
    });

    globalSocket = socket;

    socket.on("connect", () => {
      if (hasDisconnectedOnce && previousRoomRef.current) {
        socket.emit("join-trip-room", { id: previousRoomRef.current });
        setIsConnected(true);
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      setIsConnected(false);
      setHasDisconnectedOnce(true);
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

  return { disconnectTripSocket, isConnected };
}
