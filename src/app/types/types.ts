export interface Trip {
  created_at: string;
  destination: string;
  id: string;
  imei: string;
  is_active: boolean;
  is_completed: boolean;
  updated_at: string;
  }
  
  export interface UpdateTripResponse {
    success: boolean
    data: Trip
  }
  
  export interface CreateTripResponse {
    success: boolean
    message:string
    data: Trip
  }

  export interface GetTripResponse {
    success: boolean
    data: Trip
  }