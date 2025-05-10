"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  vehicleKey: string;
  isActive: boolean;
  destination?: string;
}

export function QRCodeGenerator({
  vehicleKey,
  isActive,
  destination,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && vehicleKey) {
      QRCode.toCanvas(
        canvasRef.current,
        JSON.stringify({ tripId: vehicleKey, isActive, destination }),
        {
          width: 250,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {}
      );
    }
  }, [vehicleKey, isActive]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
      <canvas ref={canvasRef} />
    </div>
  );
}
