import { NextResponse } from "next/server";

// GET /api/mentor/test - Ruta de prueba para verificar que la API funciona
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API del mentor funcionando correctamente",
    timestamp: new Date().toISOString()
  });
}