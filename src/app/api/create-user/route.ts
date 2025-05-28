import { NextResponse } from "next/server";
import { baseURL } from "../helpers";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.plate) {
    return NextResponse.json(
      { success: false, message: "Plate is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${baseURL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error creating user",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
