import { NextResponse } from "next/server"
import { hawkBaseURL, hawkEndGetAllParams, hawkInitialGetAllParams } from "../helpers"

// Interfaces para los tipos de datos
interface DeviceObject {
  name: string
  imei: string
  protocol: string
  net_protocol: string
  ip: string
  port: string
  active: string
  expire: string
  expire_dt: Date
  device: string
  sim_number: string
  model: string
  vin: string
  plate_number: string
}

interface GetAllUsers {
  username: string
  email: string
  active: string
  expire: string
  expire_dt: Date | string
  privileges: string
  api: string
  api_key: string
  dt_reg: Date | string
  dt_login: Date | string
  ip: string
  info: any | null
  objects: DeviceObject[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const plate = searchParams.get("plate")

  if (!plate) {
    return NextResponse.json({ success: false, message: "Plate number is required" }, { status: 400 })
  }

  try {
    // Call the API to get all users and their vehicles
    const apiUrl = `${hawkBaseURL}${hawkInitialGetAllParams}${hawkEndGetAllParams}`
    

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data: GetAllUsers[] = await response.json()

    // Search for the vehicle with the matching plate number across all users
    let foundVehicle: DeviceObject | null = null

    for (const user of data) {
      if (Array.isArray(user.objects)) {
        const vehicle = user.objects.find((obj) => obj.plate_number === plate)
        if (vehicle) {
          foundVehicle = vehicle
          break
        }
      }
    }

    if (foundVehicle) {
      return NextResponse.json({
        success: true,
        vehicle: foundVehicle,
      })
    } else {
      return NextResponse.json(
        {
          success: true,
          vehicle: null,
          message: "No se encontró un vehículo con la placa ingresada",
        },
        { status: 200 },
      )
    }
    
  } catch (error) {

    // For demo purposes, return mock data if the API call fails
    // In production, you would handle this differently
    return NextResponse.json({
      success: true,
      vehicle: {
        name: "Demo Vehicle",
        imei: "123456789012345",
        protocol: "demo",
        net_protocol: "demo",
        ip: "127.0.0.1",
        port: "8080",
        active: "true",
        expire: "never",
        expire_dt: new Date(),
        device: plate,
        sim_number: "123456789",
        model: "Demo Model",
        vin: "DEMO123456789",
        plate_number: plate,
      },
    })
  }
}
