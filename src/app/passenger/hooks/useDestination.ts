import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TripStatus, Destination } from "../types";

export const useDestination = () => {
  const [destination, setDestination] = useState<Destination | null>(null);
  const { toast } = useToast();
  const [tripStatus, setTripStatus] = useState<TripStatus | null>(null);

  const handleDestinationSelect = (selectedDestination: Destination) => {
    setDestination(selectedDestination);
    setTripStatus(null);

    toast({
      title: "Destino seleccionado",
      description: selectedDestination.address,
      variant: "informative",
    });
  };

  return {
    destination,
    setDestination,
    handleDestinationSelect,
    tripStatus,
  };
};
