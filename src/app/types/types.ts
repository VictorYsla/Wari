export interface Trip {
    id: string
    imei: string
    destination: string | null
    is_active: boolean
    is_completed: boolean
    created_at: string
    updated_at: string
  }
  
  export interface UpdateTripResponse {
    success: boolean
    data: Trip
  }
  
  export interface CreateTripResponse {
    success: boolean
    data: Trip
  }

  export interface GetTripResponse {
    success: boolean
    data: Trip
  }