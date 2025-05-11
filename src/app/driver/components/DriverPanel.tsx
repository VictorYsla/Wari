import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { QRGeneratorView } from "./QRGeneratorView";
import { DeviceObject, Trip } from "@/app/types/types";

interface DriverPanelProps {
  vehicleDetails: DeviceObject | null;
  activeTrip: Trip | null;
  isGeneratingQR: boolean;
  isLoading: boolean;
  isConnected: boolean;
  isCancelLoading: boolean;
  onGenerateQR: () => void;
  onCancelTrip: () => void;
  onHideQR: () => void;
  onLogout: () => void;
}

export const DriverPanel = ({
  vehicleDetails,
  activeTrip,
  isGeneratingQR,
  isLoading,
  isConnected,
  isCancelLoading,
  onGenerateQR,
  onCancelTrip,
  onHideQR,
  onLogout,
}: DriverPanelProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Panel del Conductor</CardTitle>
        <CardDescription>
          Código QR para compartir la ubicación de tu vehículo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {vehicleDetails && (
          <div className="p-4 bg-muted rounded-lg mb-4">
            <h3 className="font-medium mb-2">Detalles del vehículo</h3>
            <p className="text-sm">
              <strong>Nombre:</strong> {vehicleDetails.name}
            </p>
            <p className="text-sm">
              <strong>Placa:</strong> {vehicleDetails.plate_number}
            </p>
            <p className="text-sm">
              <strong>Modelo:</strong>{" "}
              {vehicleDetails.model || "No especificado"}
            </p>
          </div>
        )}

        {isGeneratingQR ? (
          <QRGeneratorView
            activeTrip={activeTrip}
            isConnected={isConnected}
            isCancelLoading={isCancelLoading}
            onCancelTrip={onCancelTrip}
            onHideQR={onHideQR}
          />
        ) : (
          <Button
            className="w-full"
            onClick={onGenerateQR}
            disabled={isLoading}
          >
            Mostrar código QR
          </Button>
        )}

        <Button
          variant="destructive"
          className="w-full"
          onClick={onLogout}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cerrando sesión...
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
