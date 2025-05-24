"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as htmlToImage from "html-to-image";

// Components
import { LoadingView } from "../../components/LoadingView";
import { TrackingView } from "./components/TrackingView";
import { QRScanView } from "./components/QRScanView";
import { ErrorView } from "../../components/ErrorView";
import { TripEndedView } from "./components/TripEndedView";

// Hooks
import { useTripTracking } from "./hooks/useTripTracking";
import { useQRScanner } from "./hooks/useQRScanner";
import { useDestination } from "./hooks/useDestination";

// Types
import { TripStatusType, Destination } from "./types";
import { isValidMobileDevice } from "@/helpers/isValidMobileDevice";

export default function PassengerPage() {
  // Hooks
  const {
    tripData,
    tripIdentifier,
    setTripIdentifier,
    isTracking,
    setIsTracking,
    countdown,
    tripStatus,
    setTripStatus,
    isConnected,
    cancelTimeout,
    resetTrackingState,
    tripIdParam,
    isStoppedTracking,
    setTripData,
    setIsMapLoaded,
    isMapLoaded,
  } = useTripTracking();

  const { scannedTripId, handleQRScanned, resetScan, setScannedTripId } =
    useQRScanner();

  const { destination, setDestination, handleDestinationSelect } =
    useDestination();

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [captureFile, setCaptureFile] = useState<File | null>(null);

  // Refs and hooks
  const { toast } = useToast();

  const getVehicleByImei = async (imei: string) => {
    const response = await fetch(`/api/search-vehicle-with-imei`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imei: imei,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.vehicle) {
      toast({
        title: "Verificación fallida",
        description: data.message || "No se pudo encontrar el vehículo.",
        variant: "destructive",
      });
      return null;
    }

    setVehicleDetails(data.vehicle);
    return data.vehicle;
  };

  const startTracking = async () => {
    isStoppedTracking.current = false;
    setIsButtonLoading(true);
    try {
      if (!destination) {
        setTripStatus({
          type: TripStatusType.ERROR,
          message: "Destino requerido",
          description: "Por favor selecciona un destino para el viaje.",
        });
        toast({
          title: "Selecciona un destino",
          description: "Por favor selecciona un destino para el viaje.",
          variant: "destructive",
        });
        return;
      }

      if (!scannedTripId) {
        setTripStatus({
          type: TripStatusType.ERROR,
          message: "Código QR requerido",
          description: "Primero debes escanear el código QR del vehículo.",
        });
        toast({
          title: "Escanea un código QR",
          description: "Primero debes escanear el código QR del vehículo.",
          variant: "destructive",
        });
        return;
      }

      const updateResponse = await fetch(`/api/update-trip`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: scannedTripId,
          start_date: new Date().toISOString(),
          destination: {
            address: destination.address,
            lat: destination.lat,
            lng: destination.lng,
          },
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || "Error al actualizar el viaje");
      }

      const updateTripResponseType = await updateResponse.json();

      if (updateTripResponseType.data.is_completed) {
        setTripStatus({
          type: TripStatusType.COMPLETED,
          message: "Viaje finalizado",
          description: "Este viaje ya ha sido completado.",
        });
        toast({
          title: "Viaje finalizado",
          description: "Este viaje ya ha sido completado.",
          variant: "positive",
        });
        return;
      }

      if (!updateTripResponseType.data.is_active) {
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: "Este viaje ha sido cancelado o ya no está activo.",
        });
        toast({
          title: "QR inactivo",
          description:
            "Este código QR ya no está activo. Solicita al conductor un nuevo código QR.",
          variant: "destructive",
        });
        return;
      }

      const startMonitoringResponse = await fetch(
        `/api/start-trip-monitoring`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: scannedTripId,
          }),
        }
      );

      if (!startMonitoringResponse.ok) {
        const errorData = await startMonitoringResponse.json();
        throw new Error(
          errorData.message || "Error al iniciar el monitoreo del viaje"
        );
      }

      setTripIdentifier({
        imei: updateTripResponseType.data.imei,
        tripId: updateTripResponseType.data.id,
      });

      await getVehicleByImei(updateTripResponseType?.data.imei);

      const url = `${window.location.origin}/passenger?tripId=${updateTripResponseType.data.id}`;
      window.location.href = url;

      toast({
        title: "Seguimiento iniciado",
        description: `Destino: ${destination.address}`,
        variant: "informative",
      });
    } catch (error: any) {
      setIsButtonLoading(false);
      setTripStatus({
        type: TripStatusType.ERROR,
        message: "Error al iniciar seguimiento",
        description:
          error.message ||
          "No se pudo iniciar el seguimiento. Intente nuevamente.",
      });
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo iniciar el seguimiento. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const stopTracking = async () => {
    try {
      setIsButtonLoading(true);
      cancelTimeout();

      if (!tripIdentifier) {
        resetTrackingState();
        return;
      }

      const isActive = tripData?.is_active;
      const hasDestination = !!tripData?.destination;

      const stopMonitoringResponse = await fetch(`/api/stop-trip-monitoring`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imei: tripIdentifier.imei }),
      });
      const body: any = {
        id: tripIdentifier?.tripId,
        is_active: false,
        is_canceled_by_passenger: true,
      };

      if (isActive && hasDestination) {
        body.grace_period_active = true;
        body.grace_period_end_time = new Date(
          Date.now() + 10 * 60 * 1000
        ).toISOString();
      }

      const updateResponse = await fetch(`/api/update-trip`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setIsTracking(false);
      setTripStatus({
        type: TripStatusType.CANCELLED,
        message: "Seguimiento cancelado",
        description: "Has dejado de seguir la ubicación del vehículo.",
      });
      setIsButtonLoading(false);

      toast({
        title: "Seguimiento finalizado",
        description: `Has dejado de seguir la ubicación del vehículo`,
        variant: "informative",
      });
    } catch (error: any) {
      resetTrackingState();
      setIsButtonLoading(false);

      toast({
        title: "Error",
        description:
          "Hubo un problema al finalizar el seguimiento, intenta otra vez",
        variant: "destructive",
      });
    }
  };

  const handleShareTracking = async () => {
    if (!tripIdentifier?.tripId) {
      toast({
        title: "Error",
        description: "No hay un viaje activo para compartir",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = `${window.location.origin}/passenger?tripId=${tripIdentifier.tripId}`;
      const message = `Puedes seguir mi viaje en tiempo real aquí:\n ${url}`;

      const textToShare = `🚗 Datos del vehículo:
      • Placa: ${vehicleDetails?.plate_number || "N/A"}
      • Modelo: ${vehicleDetails?.model || "N/A"}
      Puedes seguir mi viaje en tiempo real aquí:
      ${url}`;

      if (isValidMobileDevice()) {
        if (
          !captureFile &&
          navigator.canShare &&
          navigator.canShare({
            title: "Sigue mi viaje 🚗",
            text: textToShare,
          })
        ) {
          await navigator.share({
            title: "Sigue mi viaje 🚗",
            text: textToShare,
          });
          const updateResponse = await fetch(`/api/update-trip`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: tripIdentifier?.tripId,
              has_been_shared: true,
            }),
          });

          return;
        }

        if (
          navigator.canShare &&
          captureFile &&
          navigator.canShare({ files: [captureFile] })
        ) {
          await navigator.share({
            title: "Sigue mi viaje 🚗",
            text: message,
            files: [captureFile],
          });

          const updateResponse = await fetch(`/api/update-trip`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: tripIdentifier?.tripId,
              has_been_shared: true,
            }),
          });
        }
      } else {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `\n🚗 *Datos del vehículo:*\n• Placa: ${
            vehicleDetails?.plate_number || "N/A"
          }\n• Modelo: ${vehicleDetails?.model || "N/A"}\n${message}`
        )}`;
        window.open(whatsappUrl, "_blank");
        const updateResponse = await fetch(`/api/update-trip`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: tripIdentifier?.tripId,
            has_been_shared: true,
          }),
        });
      }
    } catch (error) {}
  };

  const getTripData = async () => {
    try {
      setIsLoading(true);
      setTripStatus(null);

      if (!tripIdParam || tripIdParam.trim() === "") {
        throw new Error("ID de viaje no válido");
      }

      const response = await fetch(`/api/get-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tripIdParam,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error al obtener el viaje: ${response.status}`
        );
      }

      const tripResponse = await response.json();

      if (!tripResponse.data) {
        throw new Error("No se encontró información del viaje");
      }

      await getVehicleByImei(tripResponse?.data.imei);

      if (tripResponse.data.is_completed) {
        setTripStatus({
          type: TripStatusType.COMPLETED,
          message: "Viaje finalizado",
          description: "Este viaje  ha sido completado.",
        });
        setTripData({ ...tripResponse.data });
        setIsLoading(false);
        return;
      }

      if (
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
        setTripData({ ...tripResponse.data });

        setIsLoading(false);
        return;
      }

      let parsedDestination: Destination | null = null;
      try {
        if (tripResponse.data.destination) {
          parsedDestination = JSON.parse(tripResponse.data.destination);
        }
      } catch (e) {
        // Continuamos sin destino si hay error de parseo
      }

      if (parsedDestination) {
        setDestination(parsedDestination);
      }

      setScannedTripId(tripResponse.data.id);
      setTripIdentifier({
        imei: tripResponse.data.imei,
        tripId: tripResponse.data.id,
      });
      setIsTracking(true);
      setTripData({ ...tripResponse.data });
    } catch (error: any) {
      setTripStatus({
        type: TripStatusType.ERROR,
        message: "Error al cargar el viaje",
        description:
          error.message || "No se pudo cargar la información del viaje.",
      });
      toast({
        title: "Error",
        description:
          error.message || "No se pudo cargar la información del viaje.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToNewTrip = () => {
    const url = `${window.location.origin}/passenger`;
    window.location.href = url;
  };

  useEffect(() => {
    if (isValidMobileDevice()) {
      setIsShareLoading(true);
      const captureScreen = async () => {
        try {
          const element = document.body;
          const dataUrl = await htmlToImage.toPng(element, {
            cacheBust: true,
            skipFonts: true,
          });

          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const generatedFile = new File([blob], "captura-viaje.png", {
            type: "image/png",
          });

          setCaptureFile(generatedFile);
        } catch (error) {
        } finally {
          setIsShareLoading(false);
        }
      };

      if (isMapLoaded) {
        captureScreen();
      }
    }
  }, [isMapLoaded]);

  useEffect(() => {
    if (tripIdParam) {
      getTripData();
      window.onpopstate = () => {
        const url = `${window.location.origin}/passenger`;
        window.location.href = url;
      };
    } else {
      setIsLoading(false);
    }
  }, [tripIdParam]);

  if (isLoading) {
    return <LoadingView />;
  }

  if (tripStatus && tripStatus.type === TripStatusType.ERROR) {
    return <ErrorView tripStatus={tripStatus} onGoBack={goToNewTrip} />;
  }

  if (
    (!tripData?.is_active && !tripData?.grace_period_active && tripData?.id) ||
    tripStatus?.type === TripStatusType.CANCELLED ||
    tripStatus?.type === TripStatusType.COMPLETED
  ) {
    return (
      <TripEndedView
        tripData={tripData}
        destination={destination}
        onGoBack={goToNewTrip}
      />
    );
  }

  if (isTracking && tripIdentifier) {
    return (
      <TrackingView
        destination={destination}
        vehicleDetails={vehicleDetails}
        countdown={countdown}
        isConnected={isConnected}
        isShareLoading={isShareLoading}
        isButtonLoading={isButtonLoading}
        tripIdentifier={tripIdentifier}
        tripData={tripData}
        onStopTracking={stopTracking}
        onShareTracking={handleShareTracking}
        setIsMapLoaded={setIsMapLoaded}
      />
    );
  }

  return (
    <QRScanView
      scannedTripId={scannedTripId}
      destination={destination}
      isButtonLoading={isButtonLoading}
      onQRScanned={handleQRScanned}
      onDestinationSelect={handleDestinationSelect}
      onStartTracking={startTracking}
      onResetScan={resetScan}
    />
  );
}
