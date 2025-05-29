// app/api/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "../helpers";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${baseURL}/users/logout`, {
      method: "POST",
      credentials: "include", // Asegura que se incluyan las cookies
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: result.message || "Error al cerrar sesión" },
        { status: 400 }
      );
    }

    const nextResponse = NextResponse.json(result, { status: 200 });

    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      // Importante: si el backend envía varias cookies, puede ser un string con comas,
      // pero aquí asumimos una cookie.
      nextResponse.headers.append("set-cookie", setCookieHeader);
    }

    // No necesitas volver a establecer la cookie aquí, ya que viene del backend
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
