import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";
import BlackScanner from "@/assets/svgs/icon-black-scanner.svg";
import Camera from "@/assets/svgs/icon-camera.svg";

export default function QRCodeScanner({
  onScan,
}: {
  onScan: (data: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scannedRef = useRef(false); // <- para evitar múltiples llamadas

  const stopVideoStream = () => {
    const video = videoRef.current;
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  const startScanner = () => {
    scannedRef.current = false; // resetear flag al iniciar escaneo
    setIsScanning(true);
  };

  const stopScanner = () => {
    stopVideoStream();
    setIsScanning(false);
  };

  useEffect(() => {
    if (!isScanning || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    BrowserMultiFormatReader.listVideoInputDevices().then(
      (videoInputDevices) => {
        const rearCamera =
          videoInputDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || videoInputDevices[0];

        codeReader.decodeFromVideoDevice(
          rearCamera.deviceId,
          videoRef.current!,
          (result, err) => {
            if (result && !scannedRef.current) {
              scannedRef.current = true; // para bloquear futuras llamadas
              onScan(result.getText());
              stopScanner();
            }
          }
        );
      }
    );

    return () => {
      stopVideoStream();
    };
  }, [isScanning, onScan]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mt-4 md:mt-0 px-4">
      <div className="w-full max-w-md aspect-square border-2 border-wari-yellow rounded-3xl mb-6 bg-white overflow-hidden relative">
        {isScanning ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            autoPlay
            playsInline
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Camera className="w-24 h-24 text-gray-800" />
          </div>
        )}
      </div>

      <button
        onClick={isScanning ? stopScanner : startScanner}
        className="w-full md:w-80 bg-wari-yellow hover:bg-amber-300 text-black text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 mt-4 md:mt-12"
      >
        <BlackScanner className="h-6 w-6" />
        {isScanning ? "Detener escáner" : "Iniciar escáner"}
      </button>
    </div>
  );
}
