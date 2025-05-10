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
import { TripStatus, TripStatusType } from "../types";

interface TripStatusCardProps {
  tripStatus: TripStatus;
  onGoBack: () => void;
}

export const TripStatusCard = ({
  tripStatus,
  onGoBack,
}: TripStatusCardProps) => {
  const isCancelled = tripStatus.type === TripStatusType.CANCELLED;

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{tripStatus.message}</CardTitle>
          <CardDescription>
            {tripStatus.type === TripStatusType.ERROR
              ? "Ocurrió un problema al procesar tu solicitud"
              : tripStatus.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert
            className={
              isCancelled
                ? "bg-amber-50 border-amber-200"
                : tripStatus.type === TripStatusType.ERROR
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }
          >
            {isCancelled ? (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            ) : tripStatus.type === TripStatusType.ERROR ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Flag className="h-4 w-4 text-green-600" />
            )}
            <AlertTitle
              className={
                isCancelled
                  ? "text-amber-800"
                  : tripStatus.type === TripStatusType.ERROR
                  ? "text-red-800"
                  : "text-green-800"
              }
            >
              {isCancelled
                ? "Viaje cancelado"
                : tripStatus.type === TripStatusType.ERROR
                ? "Error"
                : "Viaje completado"}
            </AlertTitle>
            <AlertDescription
              className={
                isCancelled
                  ? "text-amber-700"
                  : tripStatus.type === TripStatusType.ERROR
                  ? "text-red-700"
                  : "text-green-700"
              }
            >
              {tripStatus.description}
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
