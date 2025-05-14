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
        <div className="p-4 bg-white border-amber-300 border rounded-lg w-full mb-2">
          <h2 className="font-bold text-lg mb-2">Estado del QR</h2>
          {activeTrip.destination ? (
            <div className="mb-6">
              <div className="space-y-1">
                <p>
                  <span className="font-bold">Destino:</span>{" "}
                  {JSON.parse(activeTrip.destination).address}
                </p>
                <p>
                  <span className="font-bold">Iniciado:</span>{" "}
                  {convertUtcToDeviceTime(activeTrip.start_date)}
                </p>
              </div>
            </div>
          ) : (
            <p>QR activo esperando que un pasajero defina el destino.</p>
          )}
        </div>
      ) : (
        <div className="p-4 bg-white border-amber-300 border rounded-lg w-full mb-2">
          <p className="text-sm text-center">QR disponible. Actualizando...</p>
        </div>
      )}

      <QRCodeGenerator
        vehicleKey={activeTrip?.id || ""}
        isActive={activeTrip?.is_active || false}
        destination={activeTrip?.destination}
      />

      <p className="text-center text-sm text-gray-700 max-w-xs">
        Comparte este código QR con los pasajeros para que puedan seguir tu
        ubicación. El código QR expirará automáticamente al llegar al destino.
      </p>

      <div className="flex space-x-2 w-full">
        <Button
          variant="outline"
          className="w-full bg-amber-300 hover:bg-amber-400 text-black py-6 flex items-center justify-center gap-2"
          onClick={onHideQR}
        >
          Ocultar código QR
        </Button>
      </div>

      <div className="flex space-x-2 w-full">
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 flex items-center justify-center gap-2"
          onClick={onCancelTrip}
          disabled={isCancelLoading || !isConnected || !activeTrip?.id}
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
