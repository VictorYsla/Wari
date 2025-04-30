"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, LogOut, ShieldCheck, XCircle } from "lucide-react"
import type { CreateTripResponse, DeviceObject, GetTripResponse, Trip } from "../types/types"
import useTripSocket from "@/hooks/useTripSocket"
import { convertUtcToDeviceTime } from "@/helpers/time"

// Interfaces para los tipos de datos



export default function DriverPage() {
  const [plateNumber, setPlateNumber] = useState("")
  const [imeiLastDigits, setImeiLastDigits] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tripId, setTripId] = useState("")
  const [vehicleDetails, setVehicleDetails] = useState<DeviceObject | null>(null)
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [isRechargeLoading, setIsRechargeLoading] = useState(true)
  const [hasDestination, setHasDestination] = useState(false)
  const [isCancelTripLoading, setIsCancelTripLoading] = useState(false)

  const isLogged = useRef(false)
  const { toast } = useToast()

  const {isConnected} = useTripSocket(tripId,(trip: Trip) => {

    setHasDestination(!!trip.destination)
 
    setActiveTrip({...trip})
    localStorage.setItem("tripId", trip.id) // actualiza localStorage


    // Crear nuevo viaje con manejo de errores
    if(!trip.is_active && isLogged.current){

      toast({
        title: "QR expirado",
        description: "Se actualizará a un nuevo QR",
      })

      createTrip(trip.imei).catch((error) => {
        toast({
          title: "Error al actualizar QR",
          description: "No se pudo generar un nuevo código QR. Intente nuevamente.",
          variant: "destructive",
        })
      })
    }
  })

  // Mejorar la función findVehicleByPlate para validar correctamente los datos
  const findVehicleByPlate = async (plate: string, imeiLastDigits: string) => {
    try {
      // Call API to search for vehicle by plate number and verify IMEI
      const response = await fetch('/api/search-vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plate: plate })
      });


      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const data = await response.json()

      // Verificar que data.vehicle exista antes de acceder a sus propiedades
      if (!data.success || !data.vehicle) {
        toast({
          title: "Verificación fallida",
          description: data.message || "No se pudo encontrar el vehículo con la placa proporcionada.",
          variant: "destructive",
        })
        return null
      }

      // Verificar que el IMEI exista
      if (!data.vehicle.imei) {
        toast({
          title: "Error de datos",
          description: "El vehículo no tiene un IMEI registrado.",
          variant: "destructive",
        })
        return null
      }

      const last4Imei = data.vehicle.imei.slice(-4)

      if (imeiLastDigits !== last4Imei) {
        toast({
          title: "Credenciales no válidas",
          description: "Los últimos 4 dígitos del IMEI no coinciden.",
          variant: "destructive",
        })
        return null
      }

      // Almacenar detalles del vehículo
      setVehicleDetails(data.vehicle)
      return data.vehicle
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Ocurrió un error al buscar el vehículo. Intente nuevamente.",
        variant: "destructive",
      })
      return null
    }
  }

  // Mejorar handleLogin para manejar errores y estados de carga correctamente
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!plateNumber.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa la placa del vehículo.",
        variant: "destructive",
      })
      return
    }

    if (!imeiLastDigits.trim() || imeiLastDigits.length !== 4 || !/^\d{4}$/.test(imeiLastDigits)) {
      toast({
        title: "Error",
        description: "Por favor ingresa los 4 dígitos de tu código de seguridad.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const vehicle = await findVehicleByPlate(plateNumber.trim(), imeiLastDigits.trim())

      if (vehicle && vehicle.imei) {



        try {
          localStorage.setItem("driverAuthenticated", "true")
          localStorage.setItem("plate", plateNumber.trim())
          await createTrip(vehicle.imei)

          setIsAuthenticated(true)
          isLogged.current = true


          toast({
            title: "Verificación exitosa",
            description: `Vehículo encontrado: ${vehicle.name}`,
          })
        } catch (error) {
          toast({
            title: "Error al crear el viaje",
            description: error instanceof Error ? error.message : "No se pudo crear el viaje. Intente nuevamente.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: "Ocurrió un error durante el proceso de autenticación.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mejorar createTrip para manejar errores y validar respuestas
  const createTrip = async (imei: string) => {
    if (!imei) {
      throw new Error("IMEI no válido")
    }

    try {
      const response = await fetch("/api/register-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imei,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error al registrar viaje: ${response.status}`)
      }

      const typedRegisterTripResponse = (await response.json()) as CreateTripResponse

      if(!typedRegisterTripResponse.success){
        setTripId(typedRegisterTripResponse.data.id)
        setActiveTrip(typedRegisterTripResponse.data)
        localStorage.setItem("tripId", typedRegisterTripResponse.data.id)
        return
      }
      

      if (!typedRegisterTripResponse.data || !typedRegisterTripResponse.data.id) {
        throw new Error("Respuesta inválida del servidor al crear viaje")
      }

      const newTrip = typedRegisterTripResponse.data


      setTripId(typedRegisterTripResponse.data.id)
      setActiveTrip(newTrip)

      // Guardar en localStorage
      localStorage.setItem("tripId", newTrip.id)


    } catch (error) {
      throw error // Re-lanzar para manejo en el nivel superior
    }
  }



  // Mejorar handleLogout para manejar errores y validar datos
  const handleLogout = async (imei: string) => {
    isLogged.current = false
    setIsLoading(true)

    try {
      if (!imei) {
        throw new Error("IMEI no válido para cerrar sesión")
      }

      // Detener monitoreo del viaje
      const stopMonitoringRes = await fetch(`/api/stop-trip-monitoring`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imei: imei }), // Enviar el imei en el cuerpo de la solicitud
      });

      if (!stopMonitoringRes.ok) {
        // Continuamos a pesar del error
      }

      // Actualizar estado del viaje solo si hay un ID de viaje válido
      if (tripId) {
        const updateTripRes = await fetch(`/api/update-trip`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: tripId,           // ahora el id va en el body
            is_active: false,
          }),
        })

        if (!updateTripRes.ok) {
          // Continuamos a pesar del error
        } else {
          // Solo intentamos procesar la respuesta JSON si la respuesta fue exitosa
          const updateData = await updateTripRes.json().catch(() => ({}))
        }
      }

      // Limpiar estados y almacenamiento local
      localStorage.removeItem("driverAuthenticated")
      localStorage.removeItem("tripId")
      setIsAuthenticated(false)
      setIsGeneratingQR(false)
      setVehicleDetails(null)
      setTripId("")
      setPlateNumber("")
      setImeiLastDigits("")
      setActiveTrip(null)

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al cerrar sesión.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mejorar generateQR para validar mejor el tripId
  const generateQR = () => {
    if (!tripId || tripId.trim() === "") {
      toast({
        title: "Error",
        description: "No se puede generar el código QR porque no hay un viaje activo.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingQR(true)
  }

  const cancelTrip = async () => {
    setIsCancelTripLoading(true)
    const stopMonitoringResponse = await fetch(`/api/stop-trip-monitoring`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imei: activeTrip?.imei }), // Enviar el imei en el cuerpo de la solicitud
    });

    const updateResponse = await fetch(`/api/update-trip`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: activeTrip?.id,           // ahora el id va en el body
        is_active: false,
      }),
    })

    setIsCancelTripLoading(false)

  }

const getTrip = async (tripId:string)=>{
  const response = await fetch(`/api/get-trip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: tripId,
    }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error al obtener el viaje: ${response.status}`)
  }

  const tripResponse = data as GetTripResponse

  return tripResponse.data
}

useEffect(() => {
  const loadTripFromStorage = async () => {
    setIsRechargeLoading(true) // <- Mostrar indicador de carga
    const tripId = localStorage.getItem("tripId")
    const isDriverAuthenticated = localStorage.getItem("driverAuthenticated")
    const plate = localStorage.getItem("plate")

    

    if (tripId && isDriverAuthenticated ) {

      try {
        const tripData = await getTrip(tripId)
        await findVehicleByPlate(plate ||'', tripData.imei.slice(-4)
      )
      if(!!tripData.destination){
        setHasDestination(true)
      }

        setTripId(tripId)
        setActiveTrip(tripData)
        setIsAuthenticated(true)
        isLogged.current = true
        setIsRechargeLoading(false)
      } catch (error) {
        localStorage.removeItem('tripId')
        localStorage.removeItem('driverAuthenticated')
        localStorage.removeItem("plate")
        setIsAuthenticated(false)
        setIsGeneratingQR(false)
        setVehicleDetails(null)
        setTripId("")
        setPlateNumber("")
        setImeiLastDigits("")
        setActiveTrip(null)
        setIsRechargeLoading(false)
      }
    }

    setIsRechargeLoading(false) // <- Ocultar indicador
  }

  loadTripFromStorage()
}, [])


if (isRechargeLoading) {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Cargando información del viaje...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          </div>
          <CardDescription className="text-center text-gray-500">
            Estamos obteniendo todos los detalles para ti. Esto puede tardar unos momentos.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}



  if (!isAuthenticated || !tripId) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso de Conductor</CardTitle>
            <CardDescription>Ingresa la placa del vehículo y el código de acceso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Placa del vehículo</Label>
                <Input
                  id="plateNumber"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="Ej: ABC-123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imeiLastDigits">Código de acceso</Label>
                <Input
                  id="imeiLastDigits"
                  value={imeiLastDigits}
                  onChange={(e) => setImeiLastDigits(e.target.value)}
                  placeholder="Ej: 1234"
                  maxLength={4}
                  pattern="\d{4}"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verificar y acceder
                  </>
                )}
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
          <CardDescription>Código QR para compartir la ubicación de tu vehículo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicleDetails && (
            <div className="p-4 bg-muted rounded-lg mb-4">
              <h3 className="font-medium mb-2">Detalles del vehículo</h3>
              <p className="text-sm">
                <strong>Nombre:</strong> {vehicleDetails.name}
              </p>
              <p className="text-sm">
                <strong>Placa:</strong> {vehicleDetails.plate_number}
              </p>
              <p className="text-sm">
                <strong>Modelo:</strong> {vehicleDetails.model || "No especificado"}
              </p>
            </div>
          )}

          {isGeneratingQR ? (
            <div className="flex flex-col items-center space-y-4">
              {activeTrip && activeTrip.is_active ? (
                <div className="p-4 bg-muted rounded-lg w-full mb-2">
                  <h3 className="font-medium mb-1">Estado del QR</h3>
                  {activeTrip.destination ? (
                    <>
                      <p className="text-sm">
                        <strong>Destino:</strong> {activeTrip.destination}
                      </p>
                      <p className="text-sm">
                        <strong>Iniciado:</strong> {convertUtcToDeviceTime(activeTrip.start_date)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm">QR activo esperando que un pasajero defina el destino.</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg w-full mb-2">
                  <p className="text-sm text-center">QR disponible. Actualizando...</p>
                </div>
              )}

              <QRCodeGenerator vehicleKey={tripId} isActive={hasDestination} />
              <p className="text-sm text-muted-foreground text-center">
                Comparte este código QR con los pasajeros para que puedan seguir tu ubicación. El código QR expirará
                automáticamente al llegar al destino.
              </p>
              <div className="flex space-x-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsGeneratingQR(false)}
                  disabled={isLoading}
                >
                  Ocultar código QR
                </Button>
              </div>
              <div className="flex space-x-2 w-full">
                <Button
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                  onClick={() => cancelTrip()}
                  disabled={isCancelTripLoading || !isConnected}
                >
                 
                  {isCancelTripLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Cancelar viaje
              </>
            )}
                </Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={generateQR} disabled={isLoading}>
              Mostrar código QR
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => handleLogout(vehicleDetails?.imei || "")}
            disabled={isLoading || !vehicleDetails?.imei || !isConnected}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando sesión...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
