import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { QRCodeScanner } from "@/components/qr-code-scanner";
import { DestinationSelector } from "@/components/destination-selector";

interface QRScanViewProps {
  scannedTripId: string;
  destination: {
    address: string;
    lat: number;
    lng: number;
  } | null;
  isButtonLoading: boolean;
  onQRScanned: (data: string) => void;
  onDestinationSelect: (destination: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  onStartTracking: () => void;
  onResetScan: () => void;
}

export const QRScanView = ({
  scannedTripId,
  destination,
  isButtonLoading,
  onQRScanned,
  onDestinationSelect,
  onStartTracking,
  onResetScan,
}: QRScanViewProps) => {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seguimiento de Vehículo</CardTitle>
          <CardDescription>
            Escanea el código QR e ingresa el destino para iniciar el
            seguimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {!scannedTripId ? (
              <>
                <QRCodeScanner onScan={onQRScanned} />
                <p className="text-sm text-muted-foreground text-center">
                  Apunta la cámara al código QR del vehículo para iniciar el
                  seguimiento
                </p>
              </>
            ) : (
              <>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                  <p className="text-sm text-green-800 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Código QR escaneado correctamente
                  </p>
                </div>

                <DestinationSelector onSelect={onDestinationSelect} />

                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={onStartTracking}
                    disabled={!destination}
                  >
                    {isButtonLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Iniciar seguimiento
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={onResetScan}>
                    Volver a escanear
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
