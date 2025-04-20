"use client"

import { useState, useEffect, useRef, ReactNode, MouseEventHandler } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Clock, Navigation } from "lucide-react"
import { useJsApiLoader } from "@react-google-maps/api"
import type { Destination } from "./destination-selector"
import { googleMapsApiKey } from "@/app/api/helpers"

interface VehicleTrackerProps {
  vehicleKey: string
  destination?: Destination | null
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

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export function VehicleTracker({ vehicleKey, destination }: VehicleTrackerProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const vehicleMarkerRef = useRef<google.maps.Marker | null>(null)
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

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

  // Update map when location or destination changes
  useEffect(() => {
    if (isLoaded && location) {
      updateMap()
    }
  }, [isLoaded, location, destination])

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

  const updateMap = () => {
    if (!isLoaded || !location) return

    const vehiclePosition = { lat: location.latitude, lng: location.longitude }

    // Initialize map if not already done
    if (!mapRef.current) {
      const map = new window.google.maps.Map(document.getElementById("map-container")!, {
        center: vehiclePosition,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      })
      mapRef.current = map

      // Initialize directions renderer
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4F46E5",
          strokeWeight: 5,
          strokeOpacity: 0.7,
        },
      })
      directionsRenderer.setMap(map)
      directionsRendererRef.current = directionsRenderer
    }

    // Update or create vehicle marker
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setPosition(vehiclePosition)
    } else {
      const vehicleMarker = new window.google.maps.Marker({
        position: vehiclePosition,
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#4F46E5",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
          rotation: 0, // We could update this based on heading if available
        },
        title: "Vehículo",
      })
      vehicleMarkerRef.current = vehicleMarker
    }

    // Update or create destination marker if destination exists
    if (destination) {
      const destinationPosition = { lat: destination.lat, lng: destination.lng }

      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setPosition(destinationPosition)
      } else {
        const destinationMarker = new window.google.maps.Marker({
          position: destinationPosition,
          map: mapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#10B981",
            fillOpacity: 0.7,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          },
          title: "Destino",
        })
        destinationMarkerRef.current = destinationMarker
      }

      // Calculate and display route
      const directionsService = new window.google.maps.DirectionsService()
      directionsService.route(
        {
          origin: vehiclePosition,
          destination: destinationPosition,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result)

            // Fit map to show both markers and route
            const bounds = new window.google.maps.LatLngBounds()
            bounds.extend(vehiclePosition)
            bounds.extend(destinationPosition)
            mapRef.current?.fitBounds(bounds)
          }
        },
      )
    } else {
      // If no destination, just center on vehicle
      mapRef?.current?.panTo(vehiclePosition)

      // Clear any existing directions
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] } as any)
      }

      // Remove destination marker if it exists
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null)
        destinationMarkerRef.current = null
      }
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
        ) : (
          <div id="map-container" style={mapContainerStyle}></div>
        )}
      </div>

      {location && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">
                {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
              </p>
            </div>
            {destination && (
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Destino: {destination.address}</p>
              </div>
            )}
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
