import { NextRequest, NextResponse } from "next/server";
import {
  hawkBaseURL,
  hawkEndGetAllParams,
  hawkInitialGetAllParams,
} from "../helpers";

// Interfaces para los tipos de datos
interface DeviceObject {
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

interface GetAllUsers {
  username: string;
  email: string;
  active: string;
  expire: string;
  expire_dt: Date | string;
  privileges: string;
  api: string;
  api_key: string;
  dt_reg: Date | string;
  dt_login: Date | string;
  ip: string;
  info: any | null;
  objects: DeviceObject[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imei } = body;

    if (!imei) {
      return NextResponse.json(
        { success: false, message: "Código number is required" },
        { status: 400 }
      );
    }

    const apiUrl = `${hawkBaseURL}${hawkInitialGetAllParams}${hawkEndGetAllParams}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: GetAllUsers[] = await response.json();

    // Search for the vehicle with the matching imei number across all users
    let foundVehicle: DeviceObject | null = null;

    for (const user of data) {
      if (Array.isArray(user.objects)) {
        const vehicle = user.objects.find((obj) => obj.imei === imei);
        if (vehicle) {
          foundVehicle = vehicle;
          break;
        }
      }
    }

    if (foundVehicle) {
      return NextResponse.json({
        success: true,
        vehicle: foundVehicle,
      });
    } else {
      return NextResponse.json(
        {
          success: true,
          vehicle: null,
          message: "No se encontró un vehículo con la placa ingresada",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    // For demo purposes, return mock data if the API call fails

    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al consultar los datos del vehículo.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
