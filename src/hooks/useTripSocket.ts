import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './use-toast';
import { baseURL } from '@/app/api/helpers';

let globalSocket: Socket | null = null;

export default function useTripSocket(
  id: string,
  onTripStatusChange: (trip: any) => void
) {
  const { toast } = useToast();
  const previousRoomRef = useRef<string | null>(null);

  let hasDisconnectedOnce = false;


  useEffect(() => {
    if (globalSocket) return;

    const socket = io(`${baseURL}`, {
      reconnection: true,
      reconnectionAttempts: Infinity, // reconectar infinitamente
      reconnectionDelay: 1000, // intentar cada segundo
    });

    globalSocket = socket;

    socket.on('connect', () => {
      console.log('📡 Conectado al socket');
    
      if (hasDisconnectedOnce && previousRoomRef.current) {
        socket.emit('join-trip-room', { id: previousRoomRef.current });
        console.log(`♻️ Reunido a sala trip-${previousRoomRef.current} después de desconexión completa`);
      }
    });

    socket.on('disconnect', (reason) => {
      hasDisconnectedOnce = true;
      console.warn('⚠️ Socket desconectado:', reason);
    });

    socket.on('reconnect', () => {
      console.log('✅ Reconectado al socket');
      if (previousRoomRef.current) {
        socket.emit('join-trip-room', { id: previousRoomRef.current });
        console.log(`♻️ Reunido a sala trip-${previousRoomRef.current} después de reconexión`);
      }
    });

    socket.on('trip-status-change', (trip) => {
      console.log('🚨 is_active cambiado:', trip);
      onTripStatusChange(trip);
    });
  }, [onTripStatusChange]);

  useEffect(() => {
    if (!id || !globalSocket) return;

    if (previousRoomRef.current && previousRoomRef.current !== id) {
      globalSocket.emit('leave-trip-room', { id: previousRoomRef.current });
      console.log(`🚪 Saliendo de sala trip-${previousRoomRef.current}`);
    }

    globalSocket.emit('join-trip-room', { id });
    console.log(`✅ Unido a sala trip-${id}`);
    previousRoomRef.current = id;
  }, [id]);

  function disconnectTripSocket() {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
      console.log('❌ Socket desconectado manualmente');
    }
  }

  return { disconnectTripSocket };
}
