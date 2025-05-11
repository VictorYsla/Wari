import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Share2,
  ShieldClose,
  HelpCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { VehicleTracker } from "@/components/vehicle-tracker";
import { Destination } from "../types";
import { Trip } from "@/app/types/types";
import { Dispatch, SetStateAction } from "react";

interface TrackingViewProps {
  destination?: Destination | null;
  vehicleDetails: {
    plate_number?: string;
    model?: string;
  };
  countdown: number;
  isConnected: boolean;
  isShareLoading: boolean;
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
  isShareLoading,
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

  return (
    <div className="min-h-screen bg-[#fffbeb] flex flex-col items-center px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            Seguimiento
            <br />
            del vehículo
          </h1>
          <p className="text-foreground/80 mt-2">
            Estás siguiendo la ubicación del vehículo en tiempo real
          </p>
        </div>

        {destination && (
          <Card className="bg-white dark:bg-gray-800 p-5 shadow-sm w-full">
            <h2 className="font-bold text-lg mb-1">Destino del viaje</h2>
            <p className="mb-3">{destination.address}</p>

            <div className="space-y-1">
              <p>
                <span className="font-bold">Placa:</span>{" "}
                {vehicleDetails?.plate_number}
              </p>
              <p>
                <span className="font-bold">Vehículo:</span>{" "}
                {vehicleDetails?.model}
              </p>
            </div>
          </Card>
        )}

        {!tripData?.is_active && (
          <Card className="bg-white dark:bg-gray-800 p-5 shadow-sm w-full">
            <Alert className="bg-white border-red-600">
              <AlertCircle className="h-4 w-4 text-red-600" color="red" />
              <AlertTitle className="text-red-800">
                {tripData?.is_canceled_by_passenger
                  ? "Viaje cancelado por el pasajero"
                  : "Viaje cancelado por el conductor"}
              </AlertTitle>
              <AlertDescription className="text-red-700">
                El seguimiento se detendrá en <b>{formattedTime}</b>.
              </AlertDescription>
            </Alert>
          </Card>
        )}

        <VehicleTracker
          vehicleKey={tripIdentifier?.imei || ""}
          destination={destination}
          setIsMapLoaded={setIsMapLoaded}
        />

        <div className="space-y-4 mt-4">
          <Button
            onClick={onShareTracking}
            variant="ghost"
            className="w-full bg-blue-600 hover:bg-orange-600 text-white py-6"
            disabled={
              isShareLoading ||
              !isConnected ||
              !vehicleDetails?.plate_number ||
              !vehicleDetails.model
            }
          >
            {isShareLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-white" />
                Compartir seguimiento
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 mb-10"
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
                <ShieldClose className="mr-2 h-4 w-4" />
                Detener seguimiento
              </>
            )}
          </Button>
        </div>
      </div>

      <a href="tel:+5198756636" className="fixed bottom-6 right-6 z-50">
        <Button className="bg-[#feb801] hover:bg-yellow-500 text-white font-semibold rounded-full p-4 shadow-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Hawk - ¿Necesitas ayuda?
        </Button>
      </a>
    </div>
  );
};
