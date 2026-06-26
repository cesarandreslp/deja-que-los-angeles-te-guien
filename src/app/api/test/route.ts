import { NextResponse } from "next/server";

// GET /api/test - API de prueba simple
export async function GET() {
  return NextResponse.json({ 
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString()
  });
}