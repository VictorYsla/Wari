import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { DeviceObject, Trip } from "@/app/types/types";
import useTripSocket from "@/hooks/useTripSocket";

export const useDriver = () => {
  const { toast } = useToast();
  const isLogged = useRef(false);

  // Estado de autenticación
  const [authState, setAuthState] = useState({
    plateNumber: "",
    imeiLastDigits: "",
    isAuthenticated: false,
    vehicleDetails: null as DeviceObject | null,
  });

  // Estado del viaje
  const [tripState, setTripState] = useState({
    activeTrip: null as Trip | null,
    isGeneratingQR: false,
  });

  // Estados de carga
  const [loading, setLoading] = useState({
    auth: false,
    recharge: true,
    cancel: false,
  });

  const { isConnected } = useTripSocket(
    tripState.activeTrip?.id,
    (trip: Trip) => {
      setTripState((prev) => ({
        ...prev,
        activeTrip: trip,
      }));

      localStorage.setItem("tripId", trip.id); // actualiza localStorage

      // Crear nuevo viaje con manejo de errores
      if (!trip.is_active && isLogged.current) {
        toast({
          title: "QR expirado",
          description: "Se actualizará a un nuevo QR",
        });

        createTrip(trip.imei).catch((error) => {
          toast({
            title: "Error al actualizar QR",
            description:
              "No se pudo generar un nuevo código QR. Intente nuevamente.",
            variant: "destructive",
          });
        });
      }
    }
  );

  // Función para buscar vehículo por placa
  const findVehicleByPlate = async (plate: string, imeiLastDigits: string) => {
    try {
      const response = await fetch("/api/search-vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      if (!data.success || !data.vehicle) {
        throw new Error(data.message || "Vehículo no encontrado");
      }

      const last4Imei = data.vehicle.imei.slice(-4);
      if (imeiLastDigits !== last4Imei) {
        throw new Error("Los últimos 4 dígitos del IMEI no coinciden");
      }

      return data.vehicle;
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al buscar vehículo",
        variant: "destructive",
      });
      return null;
    }
  };

  // Función para crear un nuevo viaje
  const createTrip = async (imei: string) => {
    try {
      const response = await fetch("/api/register-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imei }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear viaje");
      }

      const { data } = await response.json();

      setTripState((prev) => ({
        ...prev,
        tripId: data.id,
        activeTrip: data,
      }));

      localStorage.setItem("tripId", data.id);
      return data.id;
    } catch (error) {
      throw error;
    }
  };

  // Manejo de login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, auth: true }));

    try {
      const vehicle = await findVehicleByPlate(
        authState.plateNumber.trim(),
        authState.imeiLastDigits.trim()
      );

      if (vehicle?.imei) {
        const tripId = await createTrip(vehicle.imei);

        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          vehicleDetails: vehicle,
        }));

        localStorage.setItem("driverAuthenticated", "true");
        localStorage.setItem("plate", authState.plateNumber.trim());
        isLogged.current = true;

        toast({
          title: "Autenticación exitosa",
          description: `Vehículo: ${vehicle.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error en autenticación",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  // Manejo de logout
  const handleLogout = async () => {
    setLoading((prev) => ({ ...prev, auth: true }));

    const isActive = tripState.activeTrip?.is_active;

    try {
      if (tripState.activeTrip?.imei) {
        await fetch("/api/stop-trip-monitoring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imei: tripState.activeTrip.imei }),
        });

        await fetch("/api/update-trip", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: tripState.activeTrip.id,
            is_active: false,
            grace_period_active: isActive ? true : false,
            grace_period_end_time: isActive
              ? new Date(Date.now() + 10 * 60 * 1000).toISOString()
              : null,
          }),
        });
      }

      localStorage.removeItem("driverAuthenticated");
      localStorage.removeItem("tripId");
      localStorage.removeItem("plate");

      setAuthState({
        plateNumber: "",
        imeiLastDigits: "",
        isAuthenticated: false,
        vehicleDetails: null,
      });

      setTripState({
        activeTrip: null,
        isGeneratingQR: false,
      });

      isLogged.current = false;

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  const cancelTrip = async () => {
    setLoading({ ...loading, cancel: true });

    const isActive = tripState.activeTrip?.is_active;

    const stopMonitoringResponse = await fetch(`/api/stop-trip-monitoring`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imei: tripState.activeTrip?.imei }), // Enviar el imei en el cuerpo de la solicitud
    });

    const updateResponse = await fetch(`/api/update-trip`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tripState.activeTrip?.id, // ahora el id va en el body
        is_active: false,
        grace_period_active: isActive ? true : false,
        grace_period_end_time: isActive
          ? new Date(Date.now() + 10 * 60 * 1000).toISOString()
          : null,
      }),
    });

    setLoading({ ...loading, cancel: false });
  };

  const generateQR = () => {
    if (!tripState.activeTrip?.id || tripState.activeTrip?.id.trim() === "") {
      toast({
        title: "Error",
        description:
          "No se puede generar el código QR porque no hay un viaje activo.",
        variant: "destructive",
      });
      return;
    }

    setTripState({ ...tripState, isGeneratingQR: true });
  };

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    const loadInitialState = async () => {
      const tripId = localStorage.getItem("tripId");
      const isAuthenticated = localStorage.getItem("driverAuthenticated");
      const plate = localStorage.getItem("plate");

      if (tripId && isAuthenticated) {
        try {
          const response = await fetch("/api/get-trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: tripId }),
          });

          if (response.ok) {
            const { data } = await response.json();

            setTripState((prev) => ({
              ...prev,
              tripId,
              activeTrip: data,
            }));

            if (plate) {
              const vehicle = await findVehicleByPlate(
                plate,
                data.imei.slice(-4)
              );
              if (vehicle) {
                setAuthState((prev) => ({
                  ...prev,
                  plateNumber: plate,
                  isAuthenticated: true,
                  vehicleDetails: vehicle,
                }));
                isLogged.current = true;
              }
            }
          }
        } catch (error) {
          console.error("Error loading trip:", error);
          handleLogout();
        }
      }
      setLoading((prev) => ({ ...prev, recharge: false }));
    };

    loadInitialState();
  }, []);

  return {
    // Estados
    authState,
    tripState,
    loading,
    isConnected,

    // Setters
    setAuthState,
    setTripState,

    // Métodos
    handleLogin,
    handleLogout,
    findVehicleByPlate,
    createTrip,
    cancelTrip,
    generateQR,
  };
};
