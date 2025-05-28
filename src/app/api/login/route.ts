// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { baseURL } from "../helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${baseURL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Error al iniciar sesión",
          data: null,
        },
        { status: 401 }
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
    console.error("Error en login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        data: null,
      },
      { status: 500 }
    );
  }
}
