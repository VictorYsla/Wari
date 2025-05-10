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
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {!tripData?.is_completed ? "Viaje Cancelado" : "Viaje Finalizado"}
          </CardTitle>
          <CardDescription>
            {!tripData?.is_completed
              ? tripData?.is_canceled_by_passenger
                ? "El pasajero ha cancelado el viaje"
                : "El conductor ha cancelado el viaje"
              : "El vehículo ha llegado a su destino"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert
            className={
              !tripData?.is_completed
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
            }
          >
            {!tripData?.is_completed ? (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            ) : (
              <Flag className="h-4 w-4 text-green-600" />
            )}
            <AlertTitle
              className={
                !tripData?.is_completed ? "text-amber-800" : "text-green-800"
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
          <Button className="w-full" onClick={onGoBack}>
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
