import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Opcionalmente puedes leer el body si quieres
  // const data = await request.json();

  // Simplemente responde rápido para simular un "pong"
  return NextResponse.json({ message: "ping" });
}
