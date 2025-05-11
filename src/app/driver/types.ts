import { DeviceObject, Trip } from "../types/types";

export interface DriverAuthState {
  plateNumber: string;
  imeiLastDigits: string;
  isAuthenticated: boolean;
  vehicleDetails: DeviceObject | null;
}

export interface TripManagementState {
  activeTrip: Trip | null;
  isGeneratingQR: boolean;
  hasDestination: boolean;
}

export interface DriverStore {
  auth: DriverAuthState;
  trip: TripManagementState;
  loading: {
    isAuthLoading: boolean;
    isRechargeLoading: boolean;
    isCancelLoading: boolean;
  };
}
