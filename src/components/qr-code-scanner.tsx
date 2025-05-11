"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center w-full max-w-md mt-16 md:mt-0">
      <div className="w-full aspect-square max-w-xs border-2 border-gray-800 rounded-md mb-6 flex items-center justify-center bg-white relative overflow-hidden">
        {isScanning ? (
          <div
            ref={qrRef}
            id="qr-reader"
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <Camera className="w-24 h-24 text-gray-800" />
        )}
      </div>

      {!isScanning ? (
        <Button
          onClick={startScanner}
          className="w-full bg-amber-300 hover:bg-amber-400 text-black py-6 rounded-md text-base md:text-lg mb-6"
        >
          Iniciar escáner
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={stopScanner}
          className="w-full bg-amber-300 hover:bg-amber-400 text-black py-6 rounded-md text-base md:text-lg mb-6"
        >
          Detener escáner
        </Button>
      )}
    </div>
  );
}
