"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import BlackScanner from "@/assets/svgs/icon-black-scanner.svg";
import Camera from "@/assets/svgs/icon-camera.svg";

interface QRCodeScannerProps {
  onScan: (data: string) => void;
}

export function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isScanning || !qrRef.current) return;

    const scanner = new Html5Qrcode(qrRef.current.id);
    scannerRef.current = scanner;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    scanner
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          scanner.stop().catch(() => {});
          setIsScanning(false);
          onScan(decodedText);
        },
        (errorMessage) => {}
      )
      .catch(() => {
        toast({
          title: "Error al iniciar la cámara",
          description:
            "Por favor, asegúrate de dar permisos de cámara a la aplicación.",
          variant: "destructive",
        });
        setIsScanning(false);
      });

    return () => {
      // scanner.stop().catch(() => {});
    };
  }, [isScanning]);

  const startScanner = () => {
    setIsScanning(true);
  };

  const stopScanner = () => {
    scannerRef.current?.stop().catch(() => {});
    setIsScanning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mt-4 md:mt-0 px-4">
      <div className="w-full max-w-md aspect-square border-2 border-wari-yellow rounded-3xl mb-6 bg-white overflow-hidden relative">
        {isScanning ? (
          <div
            ref={qrRef}
            id="qr-reader"
            className="absolute inset-0 w-full h-full object-cover"
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
