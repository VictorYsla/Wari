import { NextRequest, NextResponse } from "next/server";
import { hawkBaseURL, hawkEndParams, hawkInitialParams } from "../helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { success: false, message: "Vehicle key is required" },
        { status: 400 }
      );
    }

    const apiUrl = `${hawkBaseURL}${hawkInitialParams}${key}${hawkEndParams}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    const firstEntry = Object.values(data)[0] as any;

    if (firstEntry && firstEntry.lat && firstEntry.lng) {
      return NextResponse.json({
        success: true,
        location: {
          latitude: parseFloat(firstEntry.lat),
          longitude: parseFloat(firstEntry.lng),
          timestamp: firstEntry.dt_tracker,
          address: null, // No se provee dirección, puedes calcularla con otra API si deseas
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "No valid location data found in the response.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error -No valid location.",
      },
      { status: 500 }
    );
  }
}
