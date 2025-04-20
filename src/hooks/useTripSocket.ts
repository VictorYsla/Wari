import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './use-toast';
import { baseURL } from '@/app/api/helpers';

export default function useTripSocket(onTripStatusChange: (trip: any) => void) {

  const { toast } = useToast()

  useEffect(() => {

    const socket = io(`${baseURL}`); // El puerto donde corre tu backend Nest

    socket.on('connect', () => {
      console.log('📡 Conectado al socket');
    //   toast({
    //     title: "Conectado al socket",
    //     description: `Conectado al socket`,
    //   })
      
    });

    socket.on('trip-status-change', (trip) => {
      console.log('🚨 is_active cambiado:', trip);
      toast({
        title: "is_active cambiado",
        description: `trip`,
      })
      onTripStatusChange(trip); // Callback para que actualices UI/estado
    });

    return () => {
      socket.disconnect();
    };
  }, [onTripStatusChange]);
}
