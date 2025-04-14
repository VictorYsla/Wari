"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeScanner } from "@/components/qr-code-scanner"
import { VehicleTracker } from "@/components/vehicle-tracker"
import { useToast } from "@/hooks/use-toast"

export default function PassengerPage() {
  const [vehicleKey, setVehicleKey] = useState("")
  const [isTracking, setIsTracking] = useState(false)
  const { toast } = useToast()

  const handleQRScanned = (data) => {
    if (data) {
      setVehicleKey(data)
      startTracking(data)
    }
  }

  const startTracking = (key) => {
    setIsTracking(true)
    toast({
      title: "Seguimiento iniciado",
      description: "Ahora estás siguiendo la ubicación del vehículo en tiempo real.",
    })
  }

  const stopTracking = () => {
    setIsTracking(false)
    setVehicleKey("")
    toast({
      title: "Seguimiento finalizado",
      description: "Has dejado de seguir la ubicación del vehículo.",
    })
  }

  if (isTracking) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Seguimiento de Vehículo</CardTitle>
            <CardDescription>Estás siguiendo la ubicación del vehículo en tiempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <VehicleTracker vehicleKey={vehicleKey} />
            <Button variant="destructive" className="w-full" onClick={stopTracking}>
              Detener seguimiento
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seguimiento de Vehículo</CardTitle>
          <CardDescription>Escanea el código QR del vehículo para iniciar el seguimiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <QRCodeScanner onScan={handleQRScanned} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
