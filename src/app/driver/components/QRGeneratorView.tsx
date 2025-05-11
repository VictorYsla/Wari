import { Button } from "@/components/ui/button";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { Loader2, XCircle } from "lucide-react";
import { convertUtcToDeviceTime } from "@/helpers/time";
import { Trip } from "@/app/types/types";

interface QRGeneratorViewProps {
  activeTrip: Trip | null;
  isConnected: boolean;
  isCancelLoading: boolean;
  onCancelTrip: () => void;
  onHideQR: () => void;
}

export const QRGeneratorView = ({
  activeTrip,
  isConnected,
  isCancelLoading,
  onCancelTrip,
  onHideQR,
}: QRGeneratorViewProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {activeTrip && activeTrip.is_active ? (
        <div className="p-4 bg-muted rounded-lg w-full mb-2">
          <h3 className="font-medium mb-1">Estado del QR</h3>
          {activeTrip.destination ? (
            <>
              <p className="text-sm">
                <strong>Destino:</strong> {activeTrip.destination}
              </p>
              <p className="text-sm">
                <strong>Iniciado:</strong>{" "}
                {convertUtcToDeviceTime(activeTrip.start_date)}
              </p>
            </>
          ) : (
            <p className="text-sm">
              QR activo esperando que un pasajero defina el destino.
            </p>
          )}
        </div>
      ) : (
        <div className="p-4 bg-muted rounded-lg w-full mb-2">
          <p className="text-sm text-center">QR disponible. Actualizando...</p>
        </div>
      )}

      <QRCodeGenerator
        vehicleKey={activeTrip?.id || ""}
        isActive={activeTrip?.is_active || false}
        destination={activeTrip?.destination}
      />

      <p className="text-sm text-muted-foreground text-center">
        Comparte este código QR con los pasajeros para que puedan seguir tu
        ubicación. El código QR expirará automáticamente al llegar al destino.
      </p>

      <div className="flex space-x-2 w-full">
        <Button variant="outline" className="flex-1" onClick={onHideQR}>
          Ocultar código QR
        </Button>
      </div>

      <div className="flex space-x-2 w-full">
        <Button
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold"
          onClick={onCancelTrip}
          disabled={isCancelLoading || !isConnected}
        >
          {isCancelLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelando...
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              Cancelar viaje
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
