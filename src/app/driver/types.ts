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
  data: User;
}

export interface User {
  plate: string;
  is_active: boolean;
  is_expired: boolean;
  expired_date: Date;
  password: string;
  time_zone: string;
  id: string;
  created_at: Date;
  updated_at: Date;
}
