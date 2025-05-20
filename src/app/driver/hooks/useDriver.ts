import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { DeviceObject, Trip } from "@/app/types/types";
import useTripSocket from "@/hooks/useTripSocket";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { useAppStore } from "@/hooks/useAppStore";
import { NetworkInformation } from "@/app/passenger/types";
import { useDetectConnectionStability } from "@/hooks/useDetectConnectionStability";
import { UserResponseType } from "../types";

export const useDriver = () => {
  const { toast } = useToast();

  const { signUp, setActive: setActiveRegister } = useSignUp();
  const { signIn, setActive: setActiveLogin } = useSignIn();
  const { signOut } = useAuth();

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
    async (trip: Trip) => {
      setTripState({ activeTrip: trip });

      localStorage.setItem("tripId", trip.id);

      if (!trip.is_active && useAppStore.getState().isAuthenticated) {
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

  const findVehicleByPlate = async (plate: string) => {
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

  const createTrip = async (imei: string) => {
    if (vehicleDetails?.expire_dt) {
      const expireDate = new Date(vehicleDetails.expire_dt);
      const now = new Date();

      if (expireDate <= now) {
        setTripState({ activeTrip: null });
        toast({
          title: "Pago pendiente",
          description: `Tienes un pago pendiente desde ${vehicleDetails.expire_dt}`,
          variant: "destructive",
        });
        return;
      }
    }

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

      if (vehicle?.imei) {
        const authResult = await handleAuthWithClerk(
          plateNumber,
          password,
          vehicle
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

  const handleLogout = async () => {
    setLoading((prev) => ({ ...prev, auth: true }));

    try {
      localStorage.removeItem("driverAuthenticated");
      localStorage.removeItem("tripId");
      localStorage.removeItem("plate");

      await signOut();

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
    });

    setLoading({ ...loading, cancel: false });
  };

  const handleAuthWithClerk = async (
    plateNumber: string,
    password: string,
    vehicle: DeviceObject
  ) => {
    const searchUserResponse = await fetch("/api/search-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plate: plateNumber.trim(), // puedes ajustar esto según el DTO que espera tu endpoint
      }),
    });

    const searchUserResult =
      (await searchUserResponse.json()) as UserResponseType;

    const expireDt = vehicle?.expire_dt
      ? new Date(vehicle.expire_dt).toISOString()
      : new Date().toISOString();

    const isSameExpiredDate =
      expireDt === searchUserResult?.data?.expired_date.toString();

    if (searchUserResult?.success) {
      try {
        const signInResult = await signIn?.create({
          identifier: plateNumber.trim(),
          password: password.trim(),
        });

        if (signInResult?.status === "complete" && setActiveLogin) {
          await setActiveLogin({ session: signInResult.createdSessionId });
          if (!isSameExpiredDate) {
            const updateUserResponse = await fetch("/api/update-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: searchUserResult.data.id,
                plate: plateNumber.trim(), // Identificador para actualizar el usuario
                expired_date: expireDt, // Nueva fecha de expiración en timestamptz ISO string
                is_expired: false,
              }),
            });

            const updateUserResult = await updateUserResponse.json();
          }
          return { success: true, isNewUser: false };
        }

        return { success: false, error: "Login no completado" };
      } catch (signInError) {
        return { success: false, error: "Error en al iniciar sesión" };
      }
    }

    try {
      const signUpResult = await signUp?.create({
        username: plateNumber.trim(),
        password: password.trim(),
      });

      if (signUpResult?.status === "complete" && setActiveRegister) {
        await setActiveRegister({ session: signUpResult.createdSessionId });

        try {
          const createUserResponse = await fetch("/api/create-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plate: plateNumber.trim(),
              is_active: true,
              expired: false,
              expired_date: expireDt, // o puedes establecer una fecha personalizada
              clerk_id: signUpResult.id?.toString(),
              clerk_created_user_id: signUpResult.createdUserId?.toString(),
            }),
          });

          const createUserResult = await createUserResponse.json();

          if (!createUserResult.success) {
          }
        } catch (apiError) {}

        return { success: true, isNewUser: true };
      }
    } catch (signUpError) {
      return { success: false, error: "Error en registro" };
    }
  };

  const silentlyRestoreTripSession = async () => {
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

        if (!response.ok) return;

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
      } catch {
        // Silencioso: no mostramos errores ni toasts
      }
    }
  };

  useDetectConnectionStability(forceReconnect, silentlyRestoreTripSession);

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
          handleLogout();
        }
      }
      setLoading((prev) => ({ ...prev, recharge: false }));
    };

    loadInitialState();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      forceReconnect();
      silentlyRestoreTripSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        forceReconnect();
      }
    };

    const handleOnline = () => {
      forceReconnect();
      silentlyRestoreTripSession();
    };

    const handleOffline = () => {
      toast({
        title: "Sin conexión de internet",
        description: "Los datos se actualizarán cuando la conexión retorne",
        variant: "destructive",
      });
      // Aquí podrías mostrar un mensaje al usuario, si quieres
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleTouchSync = () => {
      if (!isConnected) {
        forceReconnect();
        silentlyRestoreTripSession();
      }
    };

    window.addEventListener("touchend", handleTouchSync);

    return () => {
      window.removeEventListener("touchend", handleTouchSync);
    };
  }, [isConnected]);

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

function isClerkUserNotFoundError(error: any): boolean {
  const notFoundCodes = [
    "form_identifier_not_found",
    "user_not_found",
    "identifier_not_found",
  ];
  return notFoundCodes.includes(error?.errors?.[0]?.code);
}
