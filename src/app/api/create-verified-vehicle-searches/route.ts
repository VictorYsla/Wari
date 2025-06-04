import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "../helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { plate } = body;

    if (!plate) {
      return NextResponse.json(
        { success: false, message: "Plate is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${baseURL}/verified-vehicle-searches/create-verify-search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save vehicle search");
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
