"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface QRCodeScannerProps {
  onScan: (data: string) => void
}

export function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5Qrcode("qr-reader")
    setScannerInstance(scanner)

    // Cleanup on unmount
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch((error) => {})
      }
    }
  }, [])

  const startScanner = () => {
    if (!scannerInstance) return

    setIsScanning(true)
    const config = { fps: 10, qrbox: { width: 250, height: 250 } }

    scannerInstance
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success callback
          scannerInstance.stop().catch((error) => {})
          setIsScanning(false)
          onScan(decodedText)
        },
        (errorMessage) => {
          // Error callback
        },
      )
      .catch((err) => {
        toast({
          title: "Error al iniciar la cámara",
          description: "Por favor, asegúrate de dar permisos de cámara a la aplicación.",
          variant: "destructive",
        })
        setIsScanning(false)
      })
  }

  const stopScanner = () => {
    if (scannerInstance && scannerInstance.isScanning) {
      scannerInstance.stop().catch((error) => {})
      setIsScanning(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="qr-reader" className="w-full max-w-[300px] h-[300px] border rounded-lg overflow-hidden"></div>

      {!isScanning ? (
        <Button onClick={startScanner} className="w-full">
          Iniciar escáner
        </Button>
      ) : (
        <Button variant="outline" onClick={stopScanner} className="w-full">
          Detener escáner
        </Button>
      )}
    </div>
  )
}
