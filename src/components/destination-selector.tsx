"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CircleBlackCheck from "@/assets/svgs/icon-circle-black-check.svg";
import DestinationCircle from "@/assets/svgs/icon-destination.svg";
import MagnificanGlasses from "@/assets/svgs/icon-magni-glass.svg";
import Close from "@/assets/svgs/icon-close.svg";
import MapPinYellow from "@/assets/svgs/icon-mappin-yellow.svg";
import Rocket from "@/assets/svgs/icon-rocket.svg";

declare global {
  interface Window {
    google: any;
  }
}

export interface Destination {
  address: string;
  lat: number;
  lng: number;
}

interface DestinationSelectorProps {
  onSelect: (destination: Destination) => void;
  destination: {
    address: string;
    lat: number;
    lng: number;
  } | null;
  initialAddress?: string;
  onStartTracking: () => void;
  isButtonLoading: boolean;
}

export function DestinationSelector({
  onSelect,
  initialAddress = "",
  destination,
  onStartTracking,
  isButtonLoading,
}: DestinationSelectorProps) {
  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [searchResults, setSearchResults] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null
  );
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLocationCancelledRef = useRef(false);

  const { toast } = useToast();

  // Initialize Google Maps services
  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();

      // Create a dummy div for PlacesService (it requires a DOM element)
      const dummyDiv = document.createElement("div");
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        dummyDiv
      );
      getCurrentLocation();
    }
  }, []);

  // Initialize map when it becomes visible
  useEffect(() => {
    if (
      isMapVisible &&
      mapRef.current &&
      !mapInstanceRef.current &&
      window.google &&
      window.google.maps
    ) {
      // Default to a central location if no coordinates are set
      const defaultLocation = coordinates || { lat: -12.0464, lng: -77.0428 }; // Lima, Peru

      const mapOptions = {
        center: defaultLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
        draggable: true,
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Add a marker if coordinates exist
      if (coordinates) {
        addMarker(coordinates);
      }

      // Add click listener to the map
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        const clickedLocation = e.latLng;
        if (clickedLocation) {
          const newCoords = {
            lat: clickedLocation.lat(),
            lng: clickedLocation.lng(),
          };
          setCoordinates(newCoords);
          addMarker(newCoords);

          // Reverse geocode to get address
          reverseGeocode(newCoords);
        }
      });
    }
  }, [isMapVisible]);

  // Handle address search
  useEffect(() => {
    if (!address.trim() || !autocompleteServiceRef.current) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a timeout to avoid too many API calls
    searchTimeoutRef.current = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: address,
          // componentRestrictions: { country: "pe" }, // Restrict to Peru, change as needed
          location: userLocation
            ? new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
            : undefined,
          radius: userLocation ? 50000 : undefined,
        },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSearchResults(predictions);
            setShowResults(true);
          } else {
            setSearchResults([]);
          }
        }
      );
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [address]);

  const addMarker = (position: { lat: number; lng: number }) => {
    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create new marker
    if (mapInstanceRef.current) {
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
        draggable: true,
      });

      // Add drag end listener
      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        if (position) {
          const newCoords = {
            lat: position.lat(),
            lng: position.lng(),
          };
          setCoordinates(newCoords);

          // Reverse geocode to get address
          reverseGeocode(newCoords);
        }
      });

      markerRef.current = marker;

      // Center map on marker
      mapInstanceRef.current.panTo(position);
    }
  };

  const handleSelectPlace = (placeId: string, description: string) => {
    setIsLoading(true);
    setShowResults(false);

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
          };

          setCoordinates(newCoords);
          setAddress(place.formatted_address || description);

          // Show map and add marker
          setIsMapVisible(true);

          // We need to wait for the map to be initialized
          setTimeout(() => {
            if (mapInstanceRef.current) {
              isLocationCancelledRef.current = true;
              addMarker(newCoords);
            }
          }, 100);
        } else {
          toast({
            title: "Error",
            description: "No se pudo obtener la ubicación seleccionada",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      }
    );
  };

  const reverseGeocode = (coords: { lat: number; lng: number }) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { location: coords },
      (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
      ) => {
        if (status === "OK" && results && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
        }
      }
    );
  };

  const handleConfirmDestination = () => {
    if (!coordinates) {
      toast({
        title: "Error",
        description: "Por favor selecciona una ubicación en el mapa",
        variant: "destructive",
      });
      return;
    }

    onSelect({
      address,
      lat: coordinates.lat,
      lng: coordinates.lng,
    });
  };

  const clearSearch = () => {
    setAddress("");
    setSearchResults([]);
    setShowResults(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalización no soportada",
        description: "Tu navegador no soporta la geolocalización",
        variant: "destructive",
      });
      return;
    }

    setLoadingMap(true);
    isLocationCancelledRef.current = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserLocation(coords);
        if (!isLocationCancelledRef.current) {
          mapInstanceRef?.current?.panTo(coords);
        }
        setLoadingMap(false);
      },
      (error) => {
        setLoadingMap(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            title: "Permiso de ubicación denegado",
            description:
              "Activa el permiso desde Ajustes > Safari o tu navegador > Ubicación",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Error",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <div className="flex items-center mb-2">
          <DestinationCircle className="mr-2 h-5 w-5" />
          <h2 className="font-montserrat font-bold text-sm">
            Destino del viaje
          </h2>
        </div>
        <div className="relative w-full">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnificanGlasses className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                id="destination"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                type="text"
                placeholder="Buscar dirección..."
                className="bg-white border-2 text-sm border-wari-black h-12 w-full font-montserrat font-normal rounded-4xl placeholder-black py-2 px-8 focus:outline-none"
                disabled={isLoading}
              />
              {address && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <Close className="h-4 w-4 text-muted-foreground hover:text-foreground " />
                </button>
              )}
            </div>
            <button type="button" onClick={getCurrentLocation}>
              <MapPinYellow className="h-10 w-10" />
            </button>
          </div>

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-background border rounded-3xl shadow-lg">
              <ul className="py-1 max-h-60 overflow-auto">
                {searchResults.map((result) => (
                  <li
                    key={result.place_id}
                    className="px-4 py-2 hover:bg-muted cursor-pointer font-montserrat font-no text-sm"
                    onClick={() =>
                      handleSelectPlace(result.place_id, result.description)
                    }
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
        <div className="p-0 overflow-hidden border-2 border-black dark:border-gray-700 rounded-3xl relative">
          <div
            ref={mapRef}
            className="w-full h-[250px] border-b border-black dark:border-gray-700 overflow-hidden"
          />

          {/* {loadingMap && (
            <div className="absolute top-2 right-2 z-10">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )} */}

          {loadingMap && (
            <div className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-black/60 rounded-full p-1 shadow-md">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="p-3 text-xs font-montserrat font-normal border-t border-black dark:border-gray-700">
            <p>
              Haz clic en el mapa para seleccionar una
              <br />
              ubicación o arrastra el marcador para ajustar.
            </p>
          </div>
        </div>
      )}

      <div className="w-full  max-w-screen-md mx-auto flex flex-col items-center md:flex-row md:justify-center md:gap-6">
        <button
          className="w-full md:w-80 md:mx-auto bg-wari-yellow hover:bg-amber-400 text-black text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 mt-4 md:mt-12"
          onClick={handleConfirmDestination}
          disabled={!coordinates || isLoading}
        >
          <CircleBlackCheck className="h-6 w-6" />
          Confirmar destino
        </button>

        <button
          className="w-full md:w-80 md:mx-auto bg-wari-blue hover:bg-blue-400 text-white text-[15px] font-montserrat font-bold py-3 px-8 rounded-4xl flex items-center justify-center gap-2 disabled:opacity-50 mt-4 md:mt-12"
          onClick={onStartTracking}
          disabled={!destination}
        >
          {isButtonLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Iniciando...
            </>
          ) : (
            <>
              <Rocket className="h-6 w-6" />
              Iniciar seguimiento
            </>
          )}
        </button>
      </div>
    </div>
  );
}
