import { DeviceObject, Trip } from "../types/types";

export interface DriverAuthState {
  plateNumber: string;
  password: string;
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

export interface UserResponseType {
  success: boolean;
  message: string;
  data: Data;
}

export interface Data {
  id: string;
  plate: string;
  is_active: boolean;
  expired: boolean;
  expired_date: Date;
  created_at: Date;
  updated_at: Date;
}
