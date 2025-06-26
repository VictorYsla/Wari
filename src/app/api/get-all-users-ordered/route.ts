import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "../helpers";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${baseURL}/users/get-all-users-ordered`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({ success: true, users: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
