"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MapPin, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    google: any
  }
}

export interface Destination {
  address: string
  lat: number
  lng: number
}

interface DestinationSelectorProps {
  onSelect: (destination: Destination) => void
  initialAddress?: string
}

export function DestinationSelector({ onSelect, initialAddress = "" }: DestinationSelectorProps) {
  const [address, setAddress] = useState(initialAddress)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isMapVisible, setIsMapVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showResults, setShowResults] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  // Initialize Google Maps services
  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()

      // Create a dummy div for PlacesService (it requires a DOM element)
      const dummyDiv = document.createElement("div")
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv)
    }
  }, [])

  // Initialize map when it becomes visible
  useEffect(() => {
    if (isMapVisible && mapRef.current && !mapInstanceRef.current && window.google && window.google.maps) {
      // Default to a central location if no coordinates are set
      const defaultLocation = coordinates || { lat: -12.0464, lng: -77.0428 } // Lima, Peru

      const mapOptions = {
        center: defaultLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }

      const map = new window.google.maps.Map(mapRef.current, mapOptions)
      mapInstanceRef.current = map

      // Add a marker if coordinates exist
      if (coordinates) {
        addMarker(coordinates)
      }

      // Add click listener to the map
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        const clickedLocation = e.latLng
        if (clickedLocation) {
          const newCoords = {
            lat: clickedLocation.lat(),
            lng: clickedLocation.lng(),
          }
          setCoordinates(newCoords)
          addMarker(newCoords)

          // Reverse geocode to get address
          reverseGeocode(newCoords)
        }
      })
    }
  }, [isMapVisible])

  // Handle address search
  useEffect(() => {
    if (!address.trim() || !autocompleteServiceRef.current) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set a timeout to avoid too many API calls
    searchTimeoutRef.current = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: address,
          componentRestrictions: { country: "pe" }, // Restrict to Peru, change as needed
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions)
            setShowResults(true)
          } else {
            setSearchResults([])
          }
        },
      )
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [address])

  const addMarker = (position: { lat: number; lng: number }) => {
    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    // Create new marker
    if (mapInstanceRef.current) {
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
        draggable: true,
      })

      // Add drag end listener
      marker.addListener("dragend", () => {
        const position = marker.getPosition()
        if (position) {
          const newCoords = {
            lat: position.lat(),
            lng: position.lng(),
          }
          setCoordinates(newCoords)

          // Reverse geocode to get address
          reverseGeocode(newCoords)
        }
      })

      markerRef.current = marker

      // Center map on marker
      mapInstanceRef.current.panTo(position)
    }
  }

  const handleSelectPlace = (placeId: string, description: string) => {
    setIsLoading(true)
    setShowResults(false)

    placesServiceRef.current?.getDetails(
      {
        placeId,
        fields: ["geometry", "formatted_address"],
      },
      (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          const newCoords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }

          setCoordinates(newCoords)
          setAddress(place.formatted_address || description)

          // Show map and add marker
          setIsMapVisible(true)

          // We need to wait for the map to be initialized
          setTimeout(() => {
            if (mapInstanceRef.current) {
              addMarker(newCoords)
            }
          }, 100)
        } else {
          toast({
            title: "Error",
            description: "No se pudo obtener la ubicación seleccionada",
            variant: "destructive",
          })
        }
        setIsLoading(false)
      },
    )
  }

  const reverseGeocode = (coords: { lat: number; lng: number }) => {
    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode({ location: coords }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
      if (status === "OK" && results && results[0]) {
        setAddress(results[0].formatted_address)
      } else {
        setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`)
      }
    })
  }

  const handleConfirmDestination = () => {
    if (!coordinates) {
      toast({
        title: "Error",
        description: "Por favor selecciona una ubicación en el mapa",
        variant: "destructive",
      })
      return
    }

    onSelect({
      address,
      lat: coordinates.lat,
      lng: coordinates.lng,
    })
  }

  const toggleMap = () => {
    // setIsMapVisible(!isMapVisible)
  }

  const clearSearch = () => {
    setAddress("")
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="destination">Destino del viaje</Label>
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="destination"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Buscar dirección..."
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              {address && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button type="button" variant={isMapVisible ? "default" : "outline"} size="icon" onClick={toggleMap}>
              <MapPin className="h-4 w-4" />
            </Button>
          </div>

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg">
              <ul className="py-1 max-h-60 overflow-auto">
                {searchResults.map((result) => (
                  <li
                    key={result.place_id}
                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => handleSelectPlace(result.place_id, result.description)}
                  >
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{result.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      {isMapVisible && (
        <Card className="p-0 overflow-hidden">
          <div ref={mapRef} className="w-full h-[250px]" />
          <div className="p-3 bg-muted/30 text-xs text-muted-foreground">
            Haz clic en el mapa para seleccionar una ubicación o arrastra el marcador para ajustar.
          </div>
        </Card>
      )}

      <Button type="button" className="w-full" onClick={handleConfirmDestination} disabled={!coordinates || isLoading}>
        Confirmar destino
      </Button>
    </div>
  )
}
