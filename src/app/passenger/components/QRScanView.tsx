import { ArrowLeftIcon, Check, Loader2 } from "lucide-react";
import { DestinationSelector } from "@/components/destination-selector";
import WhiteScanner from "@/assets/svgs/icon-white-scaner.svg";
import WhiteCheck from "@/assets/svgs/icon-white-check.svg";
import QRCodeScanner from "@/components/qr-code-scanner";

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
  const goBack = () => {
    if (scannedTripId) {
      window.location.href = "/passenger";
      return;
    }
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-wari-gray flex flex-col items-center px-4 py-8 md:py-12">
      <div className="bg-white rounded-2xl px-1 w-full max-w-screen-md pb-8 pt-16 flex flex-col items-center">
        {/* Botón de Go Back */}
        <button
          onClick={goBack} // Asegúrate de definir esta función, por ejemplo: const goBack = () => router.back()
          className="absolute top-6 left-4 flex items-center gap-2 text-wari-black hover:text-black-500 font-montserrat font-medium mt-6"
        >
          {/* Puedes usar un ícono aquí si tienes uno */}
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </button>
        <div className="flex flex-col items-center justify-center w-full max-w-md md:max-w-xl md:mt-28 px-4">
          <div className="text-center mb-6">
            <h1 className="font-montserrat font-bold text-xl text-center">
              {scannedTripId ? (
                <>
                  <span className="block md:hidden">
                    Selecciona
                    <br />
                    el destino
                  </span>
                  <span className="hidden md:inline">
                    Selecciona el Destino
                  </span>
                </>
              ) : (
                "Escanear QR"
              )}
            </h1>

            {!scannedTripId && (
              <p className="font-montserrat font-normal text-base leading-4 mt-10">
                Apunta la cámara al código QR del
                <br />
                vehículo para iniciar el seguimiento.
              </p>
            )}
          </div>

          {!scannedTripId ? (
            <QRCodeScanner onScan={onQRScanned} />
          ) : (
            <>
              <div className="bg-wari-green dark:bg-green-900/60 dark:text-green-100 py-3 px-6 rounded-3xl mb-6 flex items-center w-full">
                <WhiteCheck className="mr-2 h-5 w-5" />
                <span className="font-montserrat font-bold text-[15px] text-white">
                  QR escaneado correctamente
                </span>
              </div>
              <DestinationSelector
                onSelect={onDestinationSelect}
                destination={destination}
                onStartTracking={onStartTracking}
                isButtonLoading={isButtonLoading}
              />
              <div className="flex flex-col w-full items-center">
                <button
                  onClick={onResetScan}
                  className="w-full mt-4 md:w-80 bg-wari-black hover:bg-black-300 text-white text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 md:mt-12"
                >
                  <WhiteScanner className="h-6 w-6" />
                  Volver a escanear
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
