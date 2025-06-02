import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "../helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { imei, plate } = body;

    if (!imei) {
      return NextResponse.json(
        { success: false, message: "IMEI is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${baseURL}/trip/create-trip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imei,
        plate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error creating trip");
    }

    const data = await response.json();

    return NextResponse.json({ ...data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
