import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Flag } from "lucide-react";
import { Destination } from "../types";
import { Trip } from "@/app/types/types";

interface TripEndedViewProps {
  destination?: Destination | null;
  tripData: Trip | null;
  onGoBack: () => void;
}
export const TripEndedView = ({
  destination,
  tripData,
  onGoBack,
}: TripEndedViewProps) => {
  return (
    <div className="min-h-screen bg-[#fffbeb] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border-amber-300 border-2 bg-[#fffbeb] p-6 shadow-sm">
          <CardHeader className="px-0 pt-0">
            <CardTitle>
              {!tripData?.is_completed ? "Viaje Cancelado" : "Viaje Finalizado"}
            </CardTitle>
            <p className="text-gray-700">
              {!tripData?.is_completed
                ? tripData?.is_canceled_by_passenger
                  ? "El pasajero ha cancelado el viaje"
                  : "El conductor ha cancelado el viaje"
                : "El vehículo ha llegado a su destino"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-0 pt-4">
            <Alert
              className={
                !tripData?.is_completed
                  ? "bg-amber-100 border-amber-300"
                  : "bg-green-100 border-green-300"
              }
            >
              {!tripData?.is_completed ? (
                <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
              ) : (
                <Flag className="h-5 w-5 mr-2 text-green-600" />
              )}
              <AlertTitle
                className={
                  !tripData?.is_completed
                    ? "text-amber-800 font-bold mb-1"
                    : "text-green-800 font-bold mb-1"
                }
              >
                {!tripData?.is_completed
                  ? "Viaje cancelado"
                  : "Destino alcanzado"}
              </AlertTitle>
              <AlertDescription
                className={
                  !tripData?.is_completed ? "text-amber-700" : "text-green-700"
                }
              >
                {!tripData?.is_completed
                  ? tripData?.is_canceled_by_passenger
                    ? "El pasajero canceló el viaje. El seguimiento de ubicación se ha detenido automáticamente."
                    : "El conductor canceló el viaje. El seguimiento de ubicación se ha detenido automáticamente."
                  : `El vehículo ha llegado a ${
                      destination?.address || "su destino"
                    }. El seguimiento ha finalizado.`}
              </AlertDescription>
            </Alert>
            <Button
              className="w-full border-gray-300 py-6 hover:bg-gray-100"
              onClick={onGoBack}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
