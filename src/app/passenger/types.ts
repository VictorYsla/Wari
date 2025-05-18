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

export interface NetworkInformation extends EventTarget {
  readonly effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  readonly downlink?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject
  ) => void;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject
  ) => void;
}
