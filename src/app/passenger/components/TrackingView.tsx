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
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seguimiento de Vehículo</CardTitle>
          <CardDescription>
            Estás siguiendo la ubicación del vehículo en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {destination && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-1">Destino del viaje</h3>
              <p className="text-sm">{destination.address}</p>
              <div className="flex items-center font-medium mb-1 mt-1">
                <span>Placa de vehículo:</span>
                <span className="text-sm ml-2">
                  {vehicleDetails?.plate_number}
                </span>
              </div>

              <div className="flex items-center font-medium mb-1">
                <span>Vehículo:</span>
                <span className="text-sm ml-2">{vehicleDetails?.model}</span>
              </div>
            </div>
          )}
          {!tripData?.is_active && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">
                {tripData?.is_canceled_by_passenger
                  ? "Viaje cancelado por el pasajero"
                  : "Viaje cancelado por el conductor"}
              </AlertTitle>
              <AlertDescription className="text-amber-700">
                El seguimiento se detendrá en <b>{formattedTime}</b>.
              </AlertDescription>
            </Alert>
          )}
          <VehicleTracker
            vehicleKey={tripIdentifier?.imei || ""}
            destination={destination}
            setIsMapLoaded={setIsMapLoaded}
          />
          <Button
            onClick={onShareTracking}
            variant="ghost"
            className="w-full flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 hover:text-white transition-colors shadow-sm rounded-xl"
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
                Compartir seguimiento{" "}
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            className="w-full"
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
        </CardContent>
      </Card>
      <a href="tel:+5198756636" className="fixed bottom-6 right-6 z-50">
        <Button className="bg-[#feb801] hover:bg-yellow-500 text-white font-semibold rounded-full p-4 shadow-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Hawk - ¿Necesitas ayuda?
        </Button>
      </a>
    </div>
  );
};
