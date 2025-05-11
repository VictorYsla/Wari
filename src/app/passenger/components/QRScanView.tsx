import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Camera,
  Check,
} from "lucide-react";
import { QRCodeScanner } from "@/components/qr-code-scanner";
import { DestinationSelector } from "@/components/destination-selector";
import Link from "next/link";
import { useState } from "react";

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
    <div className="min-h-screen bg-[#fffbeb] flex flex-col items-center px-4 py-8 md:py-12">
      {/* Botón de regreso */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <Link href="/">
          <Button variant="ghost" className="text-gray-800 hover:bg-amber-200">
            ← Volver
          </Button>
        </Link>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center w-full max-w-md mt-20 md:mt-28 px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {scannedTripId ? "Selecciona el Destino" : "Escanear QR"}
          </h1>
          {!scannedTripId && (
            <p className="text-gray-700 text-sm md:text-base max-w-xs mx-auto">
              Escanea el código QR e ingresa el destino para iniciar el
              seguimiento
            </p>
          )}
        </div>

        {!scannedTripId ? (
          <QRCodeScanner onScan={onQRScanned} />
        ) : (
          <>
            <div className="bg-green-200 dark:bg-green-900/60 text-green-800 dark:text-green-100 p-3 rounded-md mb-6 flex items-center w-full">
              <Check className="mr-2 h-5 w-5" />
              <span>Código QR escaneado correctamente</span>
            </div>
            <DestinationSelector onSelect={onDestinationSelect} />
            <div className="flex flex-col w-full space-y-3 mt-4">
              <Button
                className="w-full bg-black hover:bg-[#3a3426] dark:bg-[#1a1a1a] dark:hover:bg-[#2a2a2a] text-white py-6"
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
              <Button
                variant="outline"
                onClick={onResetScan}
                className="w-full border-black dark:border-gray-700 py-6"
              >
                Volver a escanear
              </Button>
            </div>
          </>
        )}

        {!scannedTripId && (
          <p className="text-gray-700 text-sm md:text-base text-center max-w-xs mt-6">
            Apunta la cámara al código QR del vehículo para iniciar el
            seguimiento
          </p>
        )}
      </div>
    </div>
  );
};
