import { NextResponse } from "next/server";
import { baseURL } from "../helpers";

export async function POST(request: Request) {
  const { id, ...rest } = await request.json();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${baseURL}/users/update-user?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error updating user",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
