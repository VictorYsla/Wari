"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeGeneratorProps {
  vehicleKey: string
}

export function QRCodeGenerator({ vehicleKey }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  console.log("vehicleKey:",vehicleKey)

  useEffect(() => {
    if (canvasRef.current && vehicleKey) {
      QRCode.toCanvas(
        canvasRef.current,
        vehicleKey,
        {
          width: 250,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error)
        },
      )
    }
  }, [vehicleKey])

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
      <canvas ref={canvasRef} />
    </div>
  )
}
