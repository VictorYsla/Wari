import { Button } from "@/components/ui/button";
import { HelpCircle, Loader2, AlertCircle, Circle, Square } from "lucide-react";
import { VehicleTracker } from "@/components/vehicle-tracker";
import { Destination } from "../types";
import { Trip } from "@/app/types/types";
import { Dispatch, SetStateAction, useEffect } from "react";

interface TrackingViewProps {
  destination?: Destination | null;
  vehicleDetails: {
    plate_number?: string;
    model?: string;
    name: string;
  };
  countdown: number;
  isConnected: boolean;
  isButtonLoading: boolean;
  tripData: Trip | null;
  tripIdentifier: {
    imei: string;
    tripId: string;
  } | null;
  onStopTracking: () => void;
  onShareTracking: () => void;
  setIsMapLoaded: Dispatch<SetStateAction<boolean>>;
}

export const TrackingView = ({
  destination,
  vehicleDetails,
  countdown,
  isConnected,
  isButtonLoading,
  tripIdentifier,
  tripData,
  onStopTracking,
  onShareTracking,
  setIsMapLoaded,
}: TrackingViewProps) => {
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  useEffect(() => {
    // 1. Agrega una entrada al historial para controlar el retroceso
    window.history.pushState(null, "", window.location.href);

    // 2. Maneja el evento de retroceso (botón físico o lógico)
    const handlePopState = () => {
      // Fuerza una recarga completa (reinicia estados de React)
      window.location.replace(`${window.location.origin}/passenger`);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-wari-gray flex flex-col items-center px-4 py-8 md:py-12">
      <div className="bg-white rounded-2xl px-4 w-full max-w-screen-md pb-8 pt-6 flex flex-col items-center">
        <div className="text-center">
          <h1 className="font-montserrat font-bold text-xl">
            <>
              <span className="block md:hidden">
                Seguimiento
                <br />
                de vehículo
              </span>
              <span className="hidden md:inline">Seguimiento de vehículo</span>
            </>
          </h1>
          <p className="font-montserrat font-normal text-base leading-4 mt-4">
            Estás siguiendo la ubicación del vehículo
            <br />
            en tiempo real
          </p>
        </div>

        {destination && (
          <div className="bg-white border-wari-yellow border-2 rounded-3xl dark:bg-gray-800 p-5 shadow-sm w-full my-4">
            <p className="font-montserrat font-bold text-sm leading-4">
              Destino del viaje:{" "}
              <span className="font-montserrat font-normal text-sm leading-4">
                {destination.address}
              </span>
            </p>
            <p className="font-montserrat font-bold text-sm leading-4 my-1">
              Conductor:{" "}
              <span className="font-montserrat font-normal text-sm leading-4">
                {vehicleDetails?.name}
              </span>
            </p>
            <p className="font-montserrat font-bold text-sm leading-4 my-1">
              Placa:{" "}
              <span className="font-montserrat font-normal text-sm leading-4">
                {vehicleDetails?.plate_number}
              </span>
            </p>
            <p className="font-montserrat font-bold text-sm leading-4">
              Vehículo:{" "}
              <span className="font-montserrat font-normal text-sm leading-4">
                {vehicleDetails?.model}
              </span>
            </p>
          </div>
        )}

        {!tripData?.is_active && (
          <div className="bg-white dark:bg-gray-800 p-5 shadow-sm w-full">
            <div className="flex items-start gap-2 border border-red-600 bg-white p-4 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 mt-1" color="red" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">
                  {tripData?.is_canceled_by_passenger
                    ? "Viaje cancelado por el pasajero"
                    : "Viaje cancelado por el conductor"}
                </h4>
                <p className="text-red-700">
                  El seguimiento se detendrá en <b>{formattedTime}</b>.
                </p>
              </div>
            </div>
          </div>
        )}

        <VehicleTracker
          vehicleKey={tripIdentifier?.imei || ""}
          destination={destination}
          setIsMapLoaded={setIsMapLoaded}
          onShareTracking={onShareTracking}
        />

        <button
          className="w-full mb-5 md:w-80 md:mx-auto bg-wari-black hover:bg-gray-900 text-white text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 mt-4 md:mt-12"
          onClick={onStopTracking}
          disabled={!isConnected}
        >
          {isButtonLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deteniendo seguimiento...
            </>
          ) : (
            <>
              {/* Ícono personalizado: círculo con cuadrado */}
              <span className="relative mr-2 w-7 h-7">
                <Circle className="absolute inset-0 w-full h-full text-white" />
                <Square
                  className="absolute inset-[6px] w-4 h-4 text-white"
                  fill="white"
                />
              </span>
              Detener seguimiento
            </>
          )}
        </button>
      </div>

      <a href="tel:+5198756636" className="fixed bottom-6 right-6 z-50">
        <button className="bg-wari-yellow hover:bg-yellow-500 text-white font-montserrat font-bold text-sm rounded-4xl py-3 px-4 shadow-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Hawk - ¿Necesitas ayuda?
        </button>
      </a>
    </div>
  );
};
