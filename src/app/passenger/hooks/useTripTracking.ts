import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSafeTimeout } from "@/hooks/useSafeTimeOut";
import {
  TripStatus,
  TripStatusType,
  TripIdentifier,
  NetworkInformation,
} from "../types";
import useTripSocket from "@/hooks/useTripSocket";
import { useSearchParams } from "next/navigation";
import { Trip } from "@/app/types/types";

export const useTripTracking = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get("tripId");
  const { setSafeTimeout, clearSafeTimeout } = useSafeTimeout();

  const [tripIdentifier, setTripIdentifier] = useState<TripIdentifier | null>(
    null
  );
  const [isTracking, setIsTracking] = useState(false);
  const [cancelledTrip, setCancelledTrip] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [tripStatus, setTripStatus] = useState<TripStatus | null>(null);
  const [isCancelledByPassenger, setIsCancelledByPassenger] = useState(false);
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppedTracking = useRef(false);

  const { isConnected, forceReconnect } = useTripSocket(
    tripIdParam || "",
    (trip: Trip) => {
      setTripData(trip);
      setIsCancelledByPassenger(trip.is_canceled_by_passenger);

      if (trip.is_completed) {
        handleTripCompleted();
        return;
      }

      if (trip.is_canceled_by_passenger && !isStoppedTracking.current) {
        handlePassengerCancelled();
        return;
      }

      if (
        !trip.is_active &&
        !trip.is_completed &&
        !isStoppedTracking.current &&
        !trip.destination
      ) {
        handleDriverCancelledPendingTrip();
        return;
      }

      if (!trip.is_active && !trip.is_completed && !isStoppedTracking.current) {
        handleDriverCancelledWithTimeout();
      }
    }
  );

  const handleTripCompleted = () => {
    setIsTracking(false);
    setTripStatus({
      type: TripStatusType.COMPLETED,
      message: "Viaje finalizado",
      description: "El viaje ha sido completado exitosamente.",
    });
    toast({
      title: "Viaje finalizado",
      description: "El viaje ha sido completado exitosamente.",
    });
  };

  const handlePassengerCancelled = () => {
    const graceEnd = tripData?.grace_period_end_time
      ? new Date(tripData.grace_period_end_time).getTime()
      : null;

    toast({
      title: "Viaje cancelado",
      description: `El pasajero ha cancelado el viaje. El compartir ubicación se detendrá en 10 minutos.`,
      variant: "destructive",
    });

    if (graceEnd) {
      const now = Date.now();
      const remainingSeconds = Math.max(Math.floor((graceEnd - now) / 1000), 0);

      setCountdown(remainingSeconds);

      setSafeTimeout(() => {
        setIsTracking(false);
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: "El pasajero ha cancelado el viaje.",
        });
      }, remainingSeconds * 1000);
    } else {
      // fallback por si no viene grace_period_end_time
      setCountdown(600);
      setSafeTimeout(() => {
        setIsTracking(false);
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: "El pasajero ha cancelado el viaje.",
        });
      }, 600000);
    }
  };

  const handleDriverCancelledPendingTrip = () => {
    const graceEnd = tripData?.grace_period_end_time
      ? new Date(tripData.grace_period_end_time).getTime()
      : null;

    toast({
      title: "Viaje cancelado",
      description: "El conductor ha cancelado el viaje. El QR expiró",
      variant: "destructive",
    });

    setTripStatus({
      type: TripStatusType.CANCELLED,
      message: "Viaje cancelado",
      description: "El conductor ha cancelado el viaje.",
    });
  };

  const handleDriverCancelledWithTimeout = () => {
    clearSafeTimeout();

    const graceEnd = tripData?.grace_period_end_time
      ? new Date(tripData.grace_period_end_time).getTime()
      : null;

    toast({
      title: "Viaje cancelado",
      description:
        "El conductor ha cancelado el viaje. El compartir ubicación se detendrá en 10 minutos.",
      variant: "destructive",
    });

    if (graceEnd) {
      const now = Date.now();
      const remainingSeconds = Math.max(Math.floor((graceEnd - now) / 1000), 0);

      setCountdown(remainingSeconds);

      setSafeTimeout(() => {
        setIsTracking(false);
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: "El conductor ha cancelado el viaje.",
        });
      }, remainingSeconds * 1000);
    } else {
      // fallback por si no viene grace_period_end_time
      setCountdown(600);
      setSafeTimeout(() => {
        setIsTracking(false);
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: "El conductor ha cancelado el viaje.",
        });
      }, 600000);
    }
  };

  const cancelTimeout = () => {
    isStoppedTracking.current = true;
    setCountdown(600);
    clearSafeTimeout();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTrackingState = () => {
    isStoppedTracking.current = false;
    setIsTracking(false);
    setTripIdentifier(null);
    setCancelledTrip(false);
    setTripStatus(null);
  };

  const silentlyUpdateTripData = async () => {
    try {
      if (!tripIdParam || tripIdParam.trim() === "") return;

      const response = await fetch(`/api/get-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tripIdParam }),
      });

      if (!response.ok) return;

      const tripResponse = await response.json();
      if (!tripResponse.data) return;

      // Actualiza estado si está finalizado o cancelado
      if (tripResponse.data.is_completed) {
        setTripStatus({
          type: TripStatusType.COMPLETED,
          message: "Viaje finalizado",
          description: "Este viaje ha sido completado.",
        });
      } else if (
        !tripResponse.data.is_active &&
        !tripResponse.data.grace_period_active
      ) {
        const isCancelledByPassenger = tripResponse.data
          .is_canceled_by_passenger
          ? "pasajero"
          : "conductor";
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: `Este viaje ha sido cancelado por el ${isCancelledByPassenger} o ya no está activo.`,
        });
      }
      setTripData({ ...tripResponse.data });
    } catch {
      // Silenciar errores
    }
  };

  useEffect(() => {
    // if (!tripData?.is_active && !tripData?.grace_period_end_time) return;
    // el viaje está activo y el periodo es 0 este pasará y causará que el viaje se cancele

    if (!tripData?.is_active && tripData?.grace_period_end_time) {
      const targetTime = new Date(tripData.grace_period_end_time).getTime();

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.max(Math.floor((targetTime - now) / 1000), 0);

        setCountdown(secondsLeft);

        if (secondsLeft <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          setIsTracking(false);
          setCancelledTrip(true);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tripData?.is_active, tripData?.grace_period_end_time]);

  useEffect(() => {
    const handleFocus = () => {
      forceReconnect();
      silentlyUpdateTripData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        forceReconnect();
        silentlyUpdateTripData();
      }
    };

    const handleOnline = () => {
      console.log("Conexión a internet restaurada");
      forceReconnect();
      silentlyUpdateTripData();
    };

    const handleOffline = () => {
      toast({
        title: "Sin conexión de internet",
        description: "Los datos se actualizarán cuando la conexión retorne",
        variant: "destructive",
      });
      // Aquí podrías mostrar un mensaje al usuario, si quieres
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if ("connection" in navigator) {
      const connection = navigator.connection as NetworkInformation;

      const handleConnectionChange = () => {
        console.log("Tipo:", connection.effectiveType);
        console.log("RTT:", connection.rtt);

        if (
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.effectiveType === "3g" || // <-- Aquí agregamos 3g
          (connection.rtt !== undefined && connection.rtt > 300)
        ) {
          console.warn("Conexión inestable detectada");
          toast({
            title: "Conexión a internet inestable",
            description:
              "Conexión inestable, los datos pueden no estar actualizados",
            variant: "destructive",
          });
        }
      };

      connection.addEventListener("change", handleConnectionChange);

      // Llamamos la primera vez para detectar estado actual
      handleConnectionChange();

      return () => {
        connection.removeEventListener("change", handleConnectionChange);
      };
    }
  }, []);

  return {
    tripIdentifier,
    setTripIdentifier,
    isTracking,
    setIsTracking,
    cancelledTrip,
    setCancelledTrip,
    countdown,
    tripStatus,
    setTripStatus,
    isCancelledByPassenger,
    isConnected,
    cancelTimeout,
    resetTrackingState,
    tripIdParam,
    isStoppedTracking,
    tripData,
    setTripData,
    setIsMapLoaded,
    isMapLoaded,
  };
};
