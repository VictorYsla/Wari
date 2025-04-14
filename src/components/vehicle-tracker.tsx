"use client"

import { useState, useEffect, useRef, ReactNode, MouseEventHandler } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Clock } from "lucide-react"
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"
import { googleMapsApiKey } from "@/app/api/helpers"

interface VehicleTrackerProps {
  vehicleKey: string
}

interface LocationData {
  latitude: number
  longitude: number
  timestamp: string
  address?: string
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.5rem",
}

export function VehicleTracker({ vehicleKey }: VehicleTrackerProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey || "",
  })

  useEffect(() => {
    // Fetch initial location
    fetchVehicleLocation()

    // Set up interval for real-time updates
    intervalRef.current = setInterval(fetchVehicleLocation, 10000) // Update every 10 seconds

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [vehicleKey])

  const fetchVehicleLocation = async () => {
    try {
      setLoading(true)

      // Fetch location data from the API
      const response = await fetch(`/api/vehicle-location?key=${vehicleKey}`)

      if (!response.ok) {
        throw new Error("Error al obtener la ubicación del vehículo")
      }

      const data = await response.json()

      if (data.success && data.location) {
        setLocation(data.location)
      } else {
        setError(data.message || "No se pudo obtener la ubicación del vehículo")
      }
    } catch (err) {
      console.error("Error fetching vehicle location:", err)
      setError("Error al obtener la ubicación del vehículo")
      toast({
        title: "Error",
        description: "No se pudo obtener la ubicación del vehículo. Intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  if (loadError) {
    return <div>Error al cargar el mapa</div>
  }

  return (
    <div className="space-y-4">
      <div className="w-full h-[300px] rounded-lg bg-muted/30">
        {!isLoaded ? (
          <div className="flex items-center justify-center h-full">
            <p>Cargando mapa...</p>
          </div>
        ) : loading && !location ? (
          <div className="flex items-center justify-center h-full">
            <p>Cargando ubicación...</p>
          </div>
        ) : error && !location ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">{error}</p>
          </div>
        ) : location ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={15}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            <Marker position={{ lat: location.latitude, lng: location.longitude }} />
          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No hay datos de ubicación disponibles</p>
          </div>
        )}
      </div>

      {location && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{location.address || `${location.latitude}, ${location.longitude}`}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">Última actualización: {formatTimestamp(location.timestamp)}</p>
            </div>
          </div>
        </Card>
      )}

      <Button className="w-full" onClick={fetchVehicleLocation} disabled={loading}>
        {loading ? "Actualizando..." : "Actualizar ubicación"}
      </Button>
    </div>
  )
}

interface ButtonProps {
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

// This is a local component just for the VehicleTracker
function Button({ children, className = "", disabled = false, onClick }:ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
