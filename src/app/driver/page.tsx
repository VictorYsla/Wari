"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { useToast } from "@/hooks/use-toast"

export default function DriverPage() {
  const [vehicleKey, setVehicleKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const { toast } = useToast()

  // Simulate authentication check
  useEffect(() => {
    // In a real app, you would check if the driver is authenticated
    const checkAuth = () => {
      // This is just a placeholder. In a real app, you would check session/cookies
      const isAuth = localStorage.getItem("driverAuthenticated") === "true"
      setIsAuthenticated(isAuth)
    }

    checkAuth()
  }, [])

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real app, you would validate credentials against your backend
    if (vehicleKey.trim()) {
      localStorage.setItem("driverAuthenticated", "true")
      localStorage.setItem("vehicleKey", vehicleKey)
      setIsAuthenticated(true)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Ahora puedes generar el código QR para tu vehículo.",
      })
    } else {
      toast({
        title: "Error",
        description: "Por favor ingresa una clave de vehículo válida.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("driverAuthenticated")
    localStorage.removeItem("vehicleKey")
    setIsAuthenticated(false)
    setIsGeneratingQR(false)
  }

  const generateQR = () => {
    setIsGeneratingQR(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso de Conductor</CardTitle>
            <CardDescription>Ingresa la clave única de tu vehículo para generar el código QR</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleKey">Clave del vehículo</Label>
                <Input
                  id="vehicleKey"
                  value={vehicleKey}
                  onChange={(e) => setVehicleKey(e.target.value)}
                  placeholder="Ingresa la clave única de tu vehículo"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Panel del Conductor</CardTitle>
          <CardDescription>Genera un código QR para compartir la ubicación de tu vehículo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGeneratingQR ? (
            <div className="flex flex-col items-center space-y-4">
              <QRCodeGenerator vehicleKey={localStorage.getItem("vehicleKey") || vehicleKey} />
              <p className="text-sm text-muted-foreground text-center">
                Este código QR contiene la clave única de tu vehículo. Los pasajeros pueden escanearlo para seguir tu
                ubicación en tiempo real.
              </p>
              <Button variant="outline" onClick={() => setIsGeneratingQR(false)}>
                Ocultar código QR
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={generateQR}>
              Generar código QR
            </Button>
          )}
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
