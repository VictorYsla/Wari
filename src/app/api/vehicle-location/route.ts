import { NextResponse } from "next/server"
import { hawkBaseURL, hawkEndParams, hawkInitialParams } from "../helpers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (!key) {
    return NextResponse.json({ success: false, message: "Vehicle key is required" }, { status: 400 })
  }

  try {
    const apiUrl = `${hawkBaseURL}${hawkInitialParams}${key}${hawkEndParams}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    const firstEntry = Object.values(data)[0] as any

    if (firstEntry && firstEntry.lat && firstEntry.lng) {
      return NextResponse.json({
        success: true,
        location: {
          latitude: parseFloat(firstEntry.lat),
          longitude: parseFloat(firstEntry.lng),
          timestamp: firstEntry.dt_tracker,
          address: null, // No se provee dirección, puedes calcularla con otra API si deseas
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "No valid location data found in the response.",
        },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("Error fetching vehicle location:", error)

    return NextResponse.json({
      success: true,
      location: {
        latitude: -12.0464,
        longitude: -77.0428,
        timestamp: new Date().toISOString(),
        address: "Lima, Perú",
      },
    })
  }
}
