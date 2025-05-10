export interface Trip {
  created_at: string;
  destination: string;
  id: string;
  imei: string;
  is_active: boolean;
  is_completed: boolean;
  is_canceled_by_passenger: boolean;
  updated_at: string;
  start_date: string;
  has_been_shared: boolean;
  grace_period_active: boolean;
  grace_period_end_time: string;
}

export interface UpdateTripResponse {
  success: boolean;
  data: Trip;
}

export interface CreateTripResponse {
  success: boolean;
  message: string;
  data: Trip;
}

export interface GetTripResponse {
  success: boolean;
  data: Trip;
}

export interface DeviceObject {
  name: string;
  imei: string;
  protocol: string;
  net_protocol: string;
  ip: string;
  port: string;
  active: string;
  expire: string;
  expire_dt: Date;
  device: string;
  sim_number: string;
  model: string;
  vin: string;
  plate_number: string;
}
