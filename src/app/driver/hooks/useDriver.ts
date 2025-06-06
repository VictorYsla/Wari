import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DeviceObject, Trip } from "@/app/types/types";
import useTripSocket from "@/hooks/useTripSocket";
import { useAppStore } from "@/hooks/useAppStore";
import { useDetectConnectionStability } from "@/hooks/useDetectConnectionStability";
import { useSyncEvents } from "@/hooks/useSyncEvents";
import { User, UserResponseType } from "../types";
import { useUserStore } from "@/hooks/userStore";
import { convertTimestamptzToUserTimeZone } from "@/helpers/time";

export const useDriver = () => {
  const { toast } = useToast();

  const { logout, fetchUser, user } = useUserStore();

  const plateNumber = useAppStore((state) => state.plateNumber);
  const password = useAppStore((state) => state.password);
  const vehicleDetails = useAppStore((state) => state.vehicleDetails);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const setAuthState = useAppStore((state) => state.setAuthState);

  const activeTrip = useAppStore((state) => state.activeTrip);
  const isGeneratingQR = useAppStore((state) => state.isGeneratingQR);
  const setTripState = useAppStore((state) => state.setTripState);

  const [loading, setLoading] = useState({
    auth: false,
    recharge: true,
    cancel: false,
  });

  const { isConnected, forceReconnect } = useTripSocket(
    activeTrip?.id || "",
    async (trip: Trip | null) => {
      if (trip) {
        setTripState({ activeTrip: trip });

        localStorage.setItem("tripId", trip.id);

        if (!trip.is_active && useAppStore.getState().isAuthenticated) {
          toast({
            title: "QR expirado",
            description: "Se actualizará a un nuevo QR",
            variant: "informative",
          });
          await fetchUser();
          await createTrip(trip.imei).catch((error) => {});
        }
        return;
      }
      await handleLogout();
    }
  );

  const findVehicleByPlate = async (plate: string, isSilently?: boolean) => {
    try {
      const response = await fetch("/api/search-vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      if (!data.success || !data.vehicle) {
        if (!isSilently) {
          throw new Error(data.message || "Vehículo no encontrado");
        }
      }

      return data.vehicle;
    } catch (error) {
      return null;
    }
  };

  const createTrip = async (imei: string) => {
    const response = await fetch(`/api/search-vehicle-with-imei`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imei: imei,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.vehicle) {
      toast({
        title: "Vehículo no encontrado",
        description: data.message || "No se pudo encontrar el vehículo.",
        variant: "destructive",
      });
      return null;
    }

    const vehicle = data.vehicle;

    if (vehicle?.expire_dt) {
      const expireDate = new Date(vehicle?.expire_dt);
      const now = new Date();

      if (expireDate <= now) {
        setTripState({ activeTrip: null });
        toast({
          title: "Pago pendiente",
          description: `Tienes un pago pendiente desde ${convertTimestamptzToUserTimeZone(
            user?.expired_date || "",
            user?.time_zone || ""
          )}`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const response = await fetch("/api/register-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imei,
          plate: vehicle?.plate_number,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear viaje");
      }

      const { data } = await response.json();

      setTripState({ activeTrip: data });

      localStorage.setItem("tripId", data.id);

      return data.id;
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, auth: true }));

    try {
      const vehicle = await findVehicleByPlate(plateNumber.trim());

      const searchUserResponse = await fetch("/api/search-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: vehicle?.plate_number?.trim(), // puedes ajustar esto según el DTO que espera tu endpoint
        }),
      });

      const searchUserResult =
        (await searchUserResponse.json()) as UserResponseType;

      if (searchUserResult.success && !searchUserResult.data.is_active) {
        throw {
          title: "Usuario inactivo",
          message:
            "Tu usuario ha sido desactivado. Si crees que se trata de un error, comunícate con soporte.",
        };
      }

      if (!vehicle?.imei) {
        throw {
          title: "Vehículo no registrado",
          message: "Este vehículo no se encuentra en el sistema",
        };
      }

      const authResult = await handleSession(
        plateNumber,
        password,
        vehicle,
        searchUserResult?.data
      );

      if (!authResult?.success) {
        throw new Error(authResult?.error || "Error en autenticación");
      }

      setAuthState({ isAuthenticated: true, vehicleDetails: vehicle });

      localStorage.setItem("driverAuthenticated", "true");
      localStorage.setItem("plate", plateNumber.trim());

      const tripId = await createTrip(vehicle.imei);

      toast({
        title: "Autenticación exitosa",
        description: `Vehículo: ${vehicle.name}`,
        variant: "informative",
      });
    } catch (error: any) {
      toast({
        title:
          error && typeof error === "object" && "title" in error
            ? (error as any).title
            : "Error",
        description:
          typeof error === "object"
            ? (error as any).description ||
              (error as any).message ||
              "Error en autenticación"
            : "Error en autenticación",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  const handleSession = async (
    plateNumber: string,
    password: string,
    vehicle: DeviceObject,
    foundUser: User
  ) => {
    const rawExpireDt = vehicle?.expire_dt;

    if (!rawExpireDt) {
      throw {
        title: "Fecha de expiración no encontrada",
        message:
          "El vehículo no tiene una fecha de expiración válida. Contacta con soporte.",
      };
    }

    const expireDt = new Date(rawExpireDt);
    const now = new Date();

    // Verifica si expireDt es una instancia de Date válida
    const isValidDate = expireDt instanceof Date && !isNaN(expireDt.getTime());

    if (!isValidDate) {
      throw {
        title: "Fecha inválida",
        message:
          "La fecha de expiración del vehículo es incorrecta. Contacta con soporte.",
      };
    }
    const isExpired = isValidDate && expireDt < now;

    if (isExpired) {
      throw {
        title: "Pago pendiente",
        description: `Tienes un pago pendiente desde ${vehicle.expire_dt}`,
      };
    }

    const isSameExpiredDate =
      expireDt.getTime() === new Date(foundUser?.expired_date).getTime();

    if (foundUser?.id) {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plate: vehicle.plate_number.trim(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
          // Maneja error de login
          return {
            success: false,
            error:
              data.message ??
              "El inicio de sesión no se completó correctamente.",
          };
        }

        if (!isSameExpiredDate) {
          const updateUserResponse = await fetch("/api/update-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: foundUser.id,
              plate: vehicle.plate_number.trim(),
              expired_date: expireDt,
              is_expired: false,
            }),
          });

          const updateUserResult = await updateUserResponse.json();
        }

        await fetchUser();
        return { success: true, isNewUser: false };
      } catch (error: any) {
        return { success: false, error: "Unexpected Error" };
      }
    }

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const createUserResponse = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: vehicle.plate_number.trim(),
          is_active: true,
          is_expired: false,
          expired_date: expireDt, // o puedes establecer una fecha personalizada
          password,
          time_zone: timezone,
          imei: vehicle.imei,
        }),
      });

      const createUserResult = await createUserResponse.json();

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plate: vehicle.plate_number.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        // Maneja error de login
        return {
          success: false,
          error: "El registro no se completó correctamente.",
        };
      }

      await fetchUser();

      return { success: true, isNewUser: true };
    } catch (signUpError) {
      return { success: false, error: "Error en registro" };
    }
  };

  const handleLogout = async () => {
    setLoading((prev) => ({ ...prev, auth: true }));

    try {
      localStorage.removeItem("driverAuthenticated");
      localStorage.removeItem("tripId");
      localStorage.removeItem("plate");

      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return null;
      }

      logout();

      setAuthState({
        plateNumber: "",
        password: "",
        isAuthenticated: false,
        vehicleDetails: null,
      });

      setTripState({
        activeTrip: null,
        isGeneratingQR: false,
      });

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
        variant: "informative",
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

    const isActive = activeTrip?.is_active;
    const hasDestination = !!activeTrip?.destination;

    const stopMonitoringResponse = await fetch(`/api/stop-trip-monitoring`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imei: activeTrip?.imei }),
    });

    const body: any = {
      id: activeTrip?.id,
      is_active: false,
    };

    if (isActive && hasDestination) {
      body.grace_period_active = true;
      body.grace_period_end_time = new Date(
        Date.now() + 10 * 60 * 1000
      ).toISOString();
    }

    const updateResponse = await fetch(`/api/update-trip`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setTripState({ activeTrip: null });

    toast({
      title: "QR expirado",
      description: "Se actualizará a un nuevo QR",
      variant: "informative",
    });

    setLoading({ ...loading, cancel: false });
  };

  // utils/location.ts o en el mismo archivo arriba
  const getVehicleLocation = async (key: string) => {
    try {
      const response = await fetch(`/api/vehicle-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.location) {
        return null;
      }

      return data.location; // contiene lat, lng, timestamp, etc.
    } catch (error) {
      console.error("Error fetching vehicle location:", error);
      return null;
    }
  };

  const silentlyRestoreTripSession = async () => {
    const tripId = localStorage.getItem("tripId");
    const isAuthenticated = localStorage.getItem("driverAuthenticated");
    // const plate = localStorage.getItem("plate");

    if (tripId && isAuthenticated && plateNumber) {
      try {
        const response = await fetch("/api/get-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: tripId }),
        });

        if (!response.ok) return;

        const tripResponse = await response.json();
        const trip = tripResponse.data;

        if (trip.is_active) {
          setTripState({ activeTrip: trip });
        } else {
          createTrip(trip.imei);
        }

        if (plateNumber) {
          const vehicle = await findVehicleByPlate(plateNumber, true);

          const location = await getVehicleLocation(trip.imei);

          const searchUserResponse = await fetch("/api/search-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plate: plateNumber.trim(), // puedes ajustar esto según el DTO que espera tu endpoint
            }),
          });

          const searchUserResult =
            (await searchUserResponse.json()) as UserResponseType;

          if (
            !location?.longitude &&
            searchUserResult.success &&
            searchUserResult.data.is_active
          ) {
            const updateUserResponse = await fetch("/api/update-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: searchUserResult.data.id,
                plate: searchUserResult.data.plate.trim(),
                is_active: false,
              }),
            });
            const stopMonitoringResponse = await fetch(
              `/api/stop-user-monitoring`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: searchUserResult.data.id }),
              }
            );
            await handleLogout();
          }

          if (vehicle) {
            setAuthState({
              plateNumber: plateNumber,
              isAuthenticated: true,
              vehicleDetails: vehicle,
            });
          }
        }
      } catch {
        // Silencioso: no mostramos errores ni toasts
      }
    }
  };

  useDetectConnectionStability(forceReconnect, silentlyRestoreTripSession);
  useSyncEvents({
    forceReconnect,
    silentlySync: silentlyRestoreTripSession,
    isConnected,
  });

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

            if (data.is_active) {
              setTripState({ activeTrip: data });
            } else {
              createTrip(data.imei);
            }

            if (plate) {
              const vehicle = await findVehicleByPlate(plate);
              if (vehicle) {
                setAuthState({
                  plateNumber: plate,
                  isAuthenticated: true,
                  vehicleDetails: vehicle,
                });
              }
            }
          }
        } catch (error) {
          await handleLogout();
        }
      }
      setLoading((prev) => ({ ...prev, recharge: false }));
    };

    loadInitialState();
  }, []);

  const tripState = {
    activeTrip,
    isGeneratingQR,
  };

  const authState = {
    plateNumber,
    password,
    isAuthenticated,
    vehicleDetails,
  };

  return {
    authState,
    tripState,
    loading,
    isConnected,
    activeTrip,

    setAuthState,
    setTripState,

    handleLogin,
    handleLogout,
    findVehicleByPlate,
    createTrip,
    cancelTrip,
  };
};
