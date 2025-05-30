import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "../helpers";
import { cookies } from "next/headers";

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim().split("=").map(decodeURIComponent))
      .filter(([key]) => key)
  );
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies(); // <-- esto NO es una promesa aquí
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 401 });
  }

  try {
    const response = await fetch(`${baseURL}/users/me`, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
