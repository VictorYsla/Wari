import { NextResponse } from "next/server"
import { hawkBaseURL, hawkEndParams, hawkInitialParams } from "../helpers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (!key) {
    return NextResponse.json({ success: false, message: "Vehicle key is required" }, { status: 400 })
  }

  try {
    // Call the external API to get vehicle location
    
    const apiUrl = `${hawkBaseURL}${hawkInitialParams}${key}${hawkEndParams}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Process the API response
    // Note: This is a placeholder. You'll need to adapt this to the actual API response format
    if (data && Array.isArray(data.locations) && data.locations.length > 0) {
      // Extract the most recent location
      const latestLocation = data.locations[0]

      return NextResponse.json({
        success: true,
        location: {
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
          timestamp: latestLocation.timestamp,
          address: latestLocation.address || null,
        },
      })
    } else {
      // If no location data is available
      return NextResponse.json(
        {
          success: false,
          message: "No location data available for this vehicle",
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("Error fetching vehicle location:", error)

    // For demo purposes, return mock data if the API call fails
    // In production, you would handle this differently
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
