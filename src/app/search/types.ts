// Tipos actualizados para el nuevo tipado de drivers

export type HawkCustomField = {
  name: string;
  value: string;
};

export type HawkParams = {
  gpslev: string;
  gsmlev: string;
  hdop: string;
  io16: string;
  io200: string;
  io239: string;
  io240: string;
  io241: string;
  io66: string;
  io67: string;
  io68: string;
  io69: string;
  pdop: string;
};

export type HawkData = {
  group_name: string | null;
  imei: string;
  protocol: string;
  net_protocol: string;
  ip: string;
  port: string;
  active: string;
  expire: string;
  expire_dt: string;
  dt_server: string;
  dt_tracker: string;
  lat: string;
  lng: string;
  altitude: string;
  angle: string;
  speed: string;
  params: HawkParams;
  loc_valid: string;
  dt_last_stop: string;
  dt_last_idle: string;
  dt_last_move: string;
  name: string;
  device: string;
  sim_number: string;
  model: string;
  vin: string;
  plate_number: string;
  odometer: string;
  engine_hours: string;
  custom_fields: HawkCustomField[];
};

export type Driver = {
  id: string;
  driverNumber: string;
  plate: string;
  vehicleType: string;
  completedTrips: number;
  lastUpdate: string;
  is_active: boolean;
  is_expired: boolean;
  imei: string;
  hawkData: HawkData;
};

export type VehicleStatus = {
  status: "connected" | "disconnected" | "inactive";
  label: string;
  color: string;
};

export type Sponsor = {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  created_at: string;
  is_active: boolean;
  updated_at: string;
};
