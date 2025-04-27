import { NextRequest, NextResponse } from "next/server"
import { baseURL } from "../helpers"

export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la solicitud (en lugar de la URL)
    const { imei } = await request.json()

    if (!imei) {
      return NextResponse.json(
        { success: false, message: "IMEI is required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${baseURL}/trip/stop-trip-monitoring?imei=${imei}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error stopping trip monitoring")
    }

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
