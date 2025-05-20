import { NextResponse } from "next/server";
import { baseURL } from "../helpers";

export async function POST(request: Request) {
  const { plate } = await request.json();

  if (!plate) {
    return NextResponse.json(
      { success: false, message: "Plate is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${baseURL}/users/get-user-by-plate?plate=${plate}`,
      {
        method: "GET",
      }
    );

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching user by plate",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
