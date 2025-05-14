import { DeviceObject, Trip } from "@/app/types/types";
import { create } from "zustand";

interface AuthState {
  plateNumber: string;
  password: string;
  isAuthenticated: boolean;
  vehicleDetails: DeviceObject | null;
  setAuthState: (auth: Partial<AuthState>) => void;
}

interface TripState {
  activeTrip: Trip | null;
  isGeneratingQR: boolean;
  setTripState: (trip: Partial<TripState>) => void;
}

interface LoadingState {
  auth: boolean;
  recharge: boolean;
  cancel: boolean;
  setLoading: (loading: Partial<LoadingState>) => void;
}

export const useAppStore = create<AuthState & TripState & LoadingState>(
  (set) => ({
    // Auth state
    plateNumber: "",
    password: "",
    isAuthenticated: false,
    vehicleDetails: null,
    setAuthState: (auth) => set((state) => ({ ...state, ...auth })),

    // Trip state
    activeTrip: null,
    isGeneratingQR: false,
    setTripState: (trip) => set((state) => ({ ...state, ...trip })),

    // Loading state
    auth: false,
    recharge: true,
    cancel: false,
    setLoading: (loading) => set((state) => ({ ...state, ...loading })),
  })
);
