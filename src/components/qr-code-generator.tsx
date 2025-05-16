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
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (divRef.current && vehicleKey) {
        const svgString = await QRCode.toString(
          JSON.stringify({ tripId: vehicleKey, isActive, destination }),
          { type: "svg", margin: 2, color: { dark: "#000", light: "#fff" } }
        );
        divRef.current.innerHTML = svgString;
      }
    };

    generateQR();
  }, [vehicleKey, isActive, destination]);

  return (
    <div className="flex justify-center items-center p-4">
      <div ref={divRef} className="w-[190px] h-[190px]" />
    </div>
  );
}
