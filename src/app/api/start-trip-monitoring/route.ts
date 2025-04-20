// app/api/create-trip-monitoring/route.ts

import { NextRequest, NextResponse } from "next/server"
import { baseURL } from "../helpers"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Trip ID is required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${baseURL}/trip/create-trip-monitoring?id=${id}`, {
      method: "POST", // o POST si es necesario
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error fetching trip monitoring data")
    }

    const data = await response.json()

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in /api/create-trip-monitoring:", error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
