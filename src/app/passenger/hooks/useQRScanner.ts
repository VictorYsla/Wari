import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TripStatus, TripStatusType } from "../types";

export const useQRScanner = () => {
  const [scannedTripId, setScannedTripId] = useState("");
  const { toast } = useToast();
  const [tripStatus, setTripStatus] = useState<TripStatus | null>(null);

  const handleQRScanned = (data: string) => {
    try {
      let tripId = data;
      let isActive = false;
      let destination = "";

      try {
        const parsedData = JSON.parse(data);
        if (parsedData.tripId) {
          tripId = parsedData.tripId;
          isActive = parsedData.isActive;
          destination = parsedData.destination;
        }
      } catch (e) {
        // Si parsing falla, asumimos que es solo el trip ID
      }

      if (!tripId || tripId.trim() === "") {
        throw new Error("El código QR no contiene un ID de viaje válido");
      }

      const isDifferentId = tripId !== scannedTripId;

      if (isActive && tripId && destination) {
        const url = `${window.location.origin}/passenger?tripId=${tripId}`;
        window.location.href = url;
      }

      setScannedTripId(tripId);
      setTripStatus(null);

      toast({
        title: "Código QR escaneado",
        description: "Ahora selecciona el destino para iniciar el seguimiento.",
      });
    } catch (error: any) {
      setTripStatus({
        type: TripStatusType.ERROR,
        message: "QR inválido",
        description:
          "El código QR no contiene datos válidos para el seguimiento.",
      });
      toast({
        title: "QR inválido",
        description:
          error.message ||
          "El código QR no contiene datos válidos para el seguimiento.",
        variant: "destructive",
      });
    }
  };

  const resetScan = () => {
    setScannedTripId("");
    setTripStatus(null);
  };

  return {
    handleQRScanned,
    resetScan,
    setScannedTripId,
    scannedTripId,
    tripStatus,
  };
};
