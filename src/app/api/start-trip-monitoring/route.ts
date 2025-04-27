import { NextRequest, NextResponse } from "next/server"
import { baseURL } from "../helpers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Trip ID is required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${baseURL}/trip/create-trip-monitoring?id=${id}`, {
      method: "POST",
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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
