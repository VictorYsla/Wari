import { Sponsor } from "@/app/search/types";
import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "../helpers";

type ApiResponse = {
  success: boolean;
  sponsors: Sponsor[];
  error?: string;
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const response = await fetch(`${baseURL}/sponsors/get-all-sponsors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          sponsors: [],
          error: "Error al obtener auspiciadores",
        },
        { status: response.status }
      );
    }

    const sponsors: Sponsor[] = await response.json();
    return NextResponse.json({ success: true, sponsors });
  } catch (error) {
    return NextResponse.json(
      { success: false, sponsors: [], error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
