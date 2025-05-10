export enum TripStatusType {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  ERROR = "error",
}

export interface TripStatus {
  type: TripStatusType;
  message: string;
  description?: string;
}

export interface TripIdentifier {
  imei: string;
  tripId: string;
}

export interface Destination {
  address: string;
  lat: number;
  lng: number;
}
