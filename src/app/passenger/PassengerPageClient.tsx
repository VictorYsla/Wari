"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeScanner } from "@/components/qr-code-scanner"
import { VehicleTracker } from "@/components/vehicle-tracker"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Share2, Flag, AlertCircle, Loader2, ShieldClose, ShieldCheck, HelpCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DestinationSelector, type Destination } from "@/components/destination-selector"
import useTripSocket from "@/hooks/useTripSocket"
import type { GetTripResponse, Trip, UpdateTripResponse } from "../types/types"
import { useSearchParams } from "next/navigation"
import { useSafeTimeout } from "@/hooks/useSafeTimeOut"

interface TripData {
  imei: string
  tripId: string
}

// Tipos de estado del viaje para mensajes amigables
enum TripStatusType {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  ERROR = "error",
}

interface TripStatus {
  type: TripStatusType
  message: string
  description?: string
}

export default function PassengerPage() {
  const [destination, setDestination] = useState<Destination | null>(null)
  const [scannedTripId, setScannedTripId] = useState("")
  const [tripData, setTripData] = useState<TripData | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [tripEnded, setTripEnded] = useState(false)
  const [cancelledTrip, setCancelledTrip] = useState(false)
  const [countdown, setCountdown] = useState(600) // 10 minutos en segundos
  const [isLoading, setIsLoading] = useState(true)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tripStatus, setTripStatus] = useState<TripStatus | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isStoppedTracking = useRef(false)
  const { setSafeTimeout, clearSafeTimeout, timeoutRef} = useSafeTimeout();
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const tripIdParam = searchParams.get("tripId")

 const {isConnected} = useTripSocket(scannedTripId,(trip: Trip) => {
    // Verificar que el viaje recibido corresponda al viaje actual que se está siguiendo


    // Viaje finalizado (completado)
    if (trip.is_completed) {
      setTripEnded(true)
      setIsTracking(false)
      setTripStatus({
        type: TripStatusType.COMPLETED,
        message: "Viaje finalizado",
        description: "El viaje ha sido completado exitosamente.",
      })
      toast({
        title: "Viaje finalizado",
        description: "El viaje ha sido completado exitosamente.",
      })
      return
    }

    // Viaje cancelado (no activo y no completado)
    if (!trip.is_active && !trip.is_completed && !isStoppedTracking.current) {
      clearSafeTimeout(); 

      toast({
        title: "Viaje cancelado",
        description: "El conductor ha cancelado el viaje. El compartir ubicación se detendrá en 10 minutos.",
        variant: "destructive",
      })

      setCancelledTrip(true)
      setCountdown(600) // reiniciar cuenta por si acaso

      

      setSafeTimeout(() => {
        setTripEnded(true);
        setIsTracking(false);
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: "El conductor ha cancelado el viaje.",
        });
      }, 600000);
    }
  })

  const handleQRScanned = (data: string) => {
    try {



      // Parse the QR data - could be just the IMEI or a JSON object
      let tripId = data
      let isActive = false


      try {
        // Try to parse as JSON first
        const parsedData = JSON.parse(data)

        
        
        if (parsedData.tripId) {
          tripId = parsedData.tripId
          isActive= parsedData.isActive
        }
      } catch (e) {
        // If parsing fails, assume the data is just the trip ID
      }

      // Validar que el tripId no esté vacío
      if (!tripId || tripId.trim() === "") {
        throw new Error("El código QR no contiene un ID de viaje válido")
      }

      if(isActive){
        const url = `${window.location.origin}/passenger?tripId=${tripId}`
        window.location.href = url;
      }

      setScannedTripId(tripId)
      setError(null)
      setTripStatus(null)

      toast({
        title: "Código QR escaneado",
        description: "Ahora selecciona el destino para iniciar el seguimiento.",
      })
    } catch (error: any) {
      setTripStatus({
        type: TripStatusType.ERROR,
        message: "QR inválido",
        description: "El código QR no contiene datos válidos para el seguimiento.",
      })
      toast({
        title: "QR inválido",
        description: error.message || "El código QR no contiene datos válidos para el seguimiento.",
        variant: "destructive",
      })
    }
  }

  const handleDestinationSelect = (selectedDestination: Destination) => {
    setDestination(selectedDestination)
    setError(null)
    setTripStatus(null)

    toast({
      title: "Destino seleccionado",
      description: selectedDestination.address,
    })
  }

  const cancelTimeout = () => {
    isStoppedTracking.current = true
    setCountdown(600)
    clearSafeTimeout();
    clearInterval(intervalRef.current!)
    intervalRef.current = null

  }

  const startTracking = async () => {
    isStoppedTracking.current = false
    setIsButtonLoading(true)
    try {
      if (!destination) {
        setTripStatus({
          type: TripStatusType.ERROR,
          message: "Destino requerido",
          description: "Por favor selecciona un destino para el viaje.",
        })
        toast({
          title: "Error",
          description: "Por favor selecciona un destino para el viaje.",
          variant: "destructive",
        })
        return
      }

      if (!scannedTripId) {
        setTripStatus({
          type: TripStatusType.ERROR,
          message: "Código QR requerido",
          description: "Primero debes escanear el código QR del vehículo.",
        })
        toast({
          title: "Error",
          description: "Primero debes escanear el código QR del vehículo.",
          variant: "destructive",
        })
        return
      }

      // Actualizar el viaje con el destino
      const updateResponse = await fetch(`/api/update-trip?id=${scannedTripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: {
            address: destination.address,
            lat: destination.lat,
            lng: destination.lng,
          },
        }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.message || "Error al actualizar el viaje")
      }

      const updateTripResponseType = (await updateResponse.json()) as UpdateTripResponse


      // Verificar el estado del viaje
      if (updateTripResponseType.data.is_completed) {
        setTripStatus({
          type: TripStatusType.COMPLETED,
          message: "Viaje finalizado",
          description: "Este viaje ya ha sido completado.",
        })
        toast({
          title: "Viaje finalizado",
          description: "Este viaje ya ha sido completado.",
          variant: "destructive",
        })
        return
      }

      if (!updateTripResponseType.data.is_active) {
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: "Este viaje ha sido cancelado o ya no está activo.",
        })
        toast({
          title: "QR inactivo",
          description: "Este código QR ya no está activo. Solicita al conductor un nuevo código QR.",
          variant: "destructive",
        })
        return
      }

      // Iniciar el monitoreo del viaje
      const startMonitoringResponse = await fetch(`/api/start-trip-monitoring?id=${scannedTripId}`, {
        method: "POST",
      })

      if (!startMonitoringResponse.ok) {
        const errorData = await startMonitoringResponse.json()
        throw new Error(errorData.message || "Error al iniciar el monitoreo del viaje")
      }

      // Todo está correcto, actualizar el estado
      setTripData({
        imei: updateTripResponseType.data.imei,
        tripId: updateTripResponseType.data.id,
      })

      // setIsTracking(true)
      // setError(null)
      // setTripStatus(null)
      // setIsButtonLoading(false)
      const url = `${window.location.origin}/passenger?tripId=${updateTripResponseType.data.id}`;
      window.location.href = url;


      toast({
        title: "Seguimiento iniciado",
        description: `Destino: ${destination.address}`,
      })
    } catch (error: any) {
      setIsButtonLoading(false)
      setTripStatus({
        type: TripStatusType.ERROR,
        message: "Error al iniciar seguimiento",
        description: error.message || "No se pudo iniciar el seguimiento. Intente nuevamente.",
      })
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar el seguimiento. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const stopTracking = async () => {
    try {
      setIsButtonLoading(true)
      cancelTimeout()

      if (!tripData) {
        resetTrackingState()
        return
      }

      // Detener el monitoreo del viaje
      const stopMonitoringResponse = await fetch(`/api/stop-trip-monitoring?imei=${tripData.imei}`, {
        method: "POST",
      })

      if (!stopMonitoringResponse.ok) {
        // Continuamos con el proceso aunque falle
      }

      // Actualizar el estado del viaje a inactivo
      const updateResponse = await fetch(`/api/update-trip?id=${tripData.tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: false,
        }),
      })

      if (!updateResponse.ok) {
        // Continuamos con el proceso aunque falle
      }

      setTripEnded(true)
      setIsTracking(false)
      setCancelledTrip(true)
      setTripStatus({
        type: TripStatusType.CANCELLED,
        message: "Seguimiento cancelado",
        description: "Has dejado de seguir la ubicación del vehículo.",
      })
      setIsButtonLoading(false)



      toast({
        title: "Seguimiento finalizado",
        description: "Has dejado de seguir la ubicación del vehículo.",
      })
    } catch (error: any) {

      // Aún así, reseteamos el estado para que el usuario pueda volver a empezar
      resetTrackingState()
      setIsButtonLoading(false)


      toast({
        title: "Error",
        description: "Hubo un problema al finalizar el seguimiento, pero se ha detenido localmente.",
        variant: "destructive",
      })
    }
  }

  // Función auxiliar para resetear todos los estados relacionados con el seguimiento
  const resetTrackingState = () => {

    isStoppedTracking.current = false
    setIsTracking(false)
    setTripData(null)
    setTripEnded(false)
    setCancelledTrip(false)
    setScannedTripId("")
    setDestination(null)
    setError(null)
    setTripStatus(null)
  }

  const goToNewTrip = () => {
    const url = `${window.location.origin}/passenger`;
    window.location.href = url;
  }

  const resetScan = () => {
    setScannedTripId("")
    setDestination(null)
    setError(null)
    setTripStatus(null)
  }

  const handleShareTracking = () => {
    if (!tripData?.tripId) {
      toast({
        title: "Error",
        description: "No hay un viaje activo para compartir",
        variant: "destructive",
      })
      return
    }

    const url = `${window.location.origin}/passenger?tripId=${tripData.tripId}`
    const message = encodeURIComponent(`🚗 Puedes seguir mi viaje en tiempo real aquí: ${url}`)
    const whatsappUrl = `https://wa.me/?text=${message}`

    window.open(whatsappUrl, "_blank")
  }

  useEffect(() => {
    if (!cancelledTrip) return

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          setTripEnded(true)
          setIsTracking(false)
          setCancelledTrip(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(intervalRef.current!),        
      intervalRef.current = null
}
  }, [cancelledTrip])

  const getTripData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setTripStatus(null)

      if (!tripIdParam || tripIdParam.trim() === "") {
        throw new Error("ID de viaje no válido")
      }

      const response = await fetch(`/api/get-trip?id=${tripIdParam}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error al obtener el viaje: ${response.status}`)
      }

      const tripResponse = (await response.json()) as GetTripResponse

      // Verificar si el viaje existe
      if (!tripResponse.data) {
        throw new Error("No se encontró información del viaje")
      }

      // Verificar el estado del viaje
      if (tripResponse.data.is_completed) {
        setTripStatus({
          type: TripStatusType.COMPLETED,
          message: "Viaje finalizado",
          description: "Este viaje ya ha sido completado.",
        })
        setTripEnded(true)
        setIsLoading(false)
        return
      }

      if (!tripResponse.data.is_active) {
        setTripStatus({
          type: TripStatusType.CANCELLED,
          message: "Viaje cancelado",
          description: "Este viaje ha sido cancelado o ya no está activo.",
        })
        setTripEnded(true)
        setIsLoading(false)
        return
      }

      // Parsear el destino con manejo de errores
      let parsedDestination: Destination | null = null
      try {
        if (tripResponse.data.destination) {
          parsedDestination = JSON.parse(tripResponse.data.destination)
        }
      } catch (e) {
        // Continuamos sin destino si hay error de parseo
      }

      // Actualizar estados
      if (parsedDestination) {
        setDestination(parsedDestination)
      }

      setScannedTripId(tripResponse.data.id)
      setTripData({
        imei: tripResponse.data.imei,
        tripId: tripResponse.data.id,
      })
      setIsTracking(true)
    } catch (error: any) {
      setTripStatus({
        type: TripStatusType.ERROR,
        message: "Error al cargar el viaje",
        description: error.message || "No se pudo cargar la información del viaje.",
      })
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar la información del viaje.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tripIdParam) {
      getTripData()
    } else {
      setIsLoading(false)
    }
  }, [tripIdParam])

  if (isLoading) {
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

  // Mostrar pantalla de estado del viaje (cancelado o completado)
  if (tripStatus && (tripStatus.type === TripStatusType.CANCELLED || tripStatus.type === TripStatusType.COMPLETED)) {
    const isCancelled = tripStatus.type === TripStatusType.CANCELLED

    return (
      <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{tripStatus.message}</CardTitle>
            <CardDescription>{tripStatus.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={isCancelled ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}>
              {isCancelled ? (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              ) : (
                <Flag className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle className={isCancelled ? "text-amber-800" : "text-green-800"}>
                {isCancelled ? "Viaje cancelado" : "Viaje completado"}
              </AlertTitle>
              <AlertDescription className={isCancelled ? "text-amber-700" : "text-green-700"}>
                {tripStatus.description}
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={goToNewTrip}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar pantalla de error técnico
  if (tripStatus && tripStatus.type === TripStatusType.ERROR) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{tripStatus.message}</CardTitle>
            <CardDescription>Ocurrió un problema al procesar tu solicitud</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">{tripStatus.description}</AlertDescription>
            </Alert>
            <Button className="w-full" onClick={goToNewTrip}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tripEnded) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{cancelledTrip ? "Viaje Cancelado" : "Viaje Finalizado"}</CardTitle>
            <CardDescription>
              {cancelledTrip ? "El conductor ha cancelado el viaje" : "El vehículo ha llegado a su destino"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={cancelledTrip ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}>
              {cancelledTrip ? (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              ) : (
                <Flag className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle className={cancelledTrip ? "text-amber-800" : "text-green-800"}>
                {cancelledTrip ? "Viaje cancelado" : "Destino alcanzado"}
              </AlertTitle>
              <AlertDescription className={cancelledTrip ? "text-amber-700" : "text-green-700"}>
                {cancelledTrip
                  ? "El conductor canceló el viaje. El seguimiento de ubicación se ha detenido automáticamente."
                  : `El vehículo ha llegado a ${destination?.address || "su destino"}. El seguimiento ha finalizado.`}
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={goToNewTrip}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isTracking && tripData) {
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`

    return (
      <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Seguimiento de Vehículo</CardTitle>
            <CardDescription>Estás siguiendo la ubicación del vehículo en tiempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {destination && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-1">Destino del viaje</h3>
                <p className="text-sm">{destination.address}</p>
              </div>
            )}
            {cancelledTrip && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Viaje cancelado por el conductor</AlertTitle>
                <AlertDescription className="text-amber-700">
                  El seguimiento se detendrá en <b>{formattedTime}</b>.
                </AlertDescription>
              </Alert>
            )}
            <VehicleTracker vehicleKey={tripData.imei} destination={destination} />
            <Button
              onClick={handleShareTracking}
              variant="ghost"
              className="w-full flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 hover:text-white transition-colors shadow-sm rounded-xl"
            >
              <Share2 className="w-4 h-4 text-white" />
              Compartir seguimiento
            </Button>
            <Button variant="destructive" className="w-full" onClick={stopTracking} disabled={isLoading || !isConnected}>
            {isButtonLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deteniendo seguimiento...
              </>
            ) : (
              <>
                <ShieldClose className="mr-2 h-4 w-4" />  
                Detener seguimiento
              </>
            )}
            </Button>
          </CardContent>
        </Card>
        <a
        href="tel:+5198756636"
        className="fixed bottom-6 right-6 z-50"
        >
          <Button
          className="bg-[#feb801] hover:bg-yellow-500 text-white font-semibold rounded-full p-4 shadow-lg flex items-center gap-2"
          >
            <HelpCircle className="w-5 h-5" />
            Hawk - ¿Necesitas ayuda?
            </Button>
            
        </a>

      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seguimiento de Vehículo</CardTitle>
          <CardDescription>Escanea el código QR e ingresa el destino para iniciar el seguimiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {!scannedTripId ? (
              <>
                <QRCodeScanner onScan={handleQRScanned} />
                <p className="text-sm text-muted-foreground text-center">
                  Apunta la cámara al código QR del vehículo para iniciar el seguimiento
                </p>
              </>
            ) : (
              <>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                  <p className="text-sm text-green-800 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Código QR escaneado correctamente
                  </p>
                </div>

                <DestinationSelector onSelect={handleDestinationSelect} />

                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={startTracking} disabled={!destination}>
                  {isButtonLoading ? (
              <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />  
                      Iniciar seguimiento
                    </>
                  )}
                  </Button>
                  <Button variant="outline" onClick={resetScan}>
                    Volver a escanear
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
