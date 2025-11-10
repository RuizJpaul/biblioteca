import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = getDb()
    const userId = Number.parseInt(id)
    const exchanges = await sql`
      SELECT i.* FROM intercambio i 
      WHERE i.usuario_origen_id = ${userId} OR i.usuario_destino_id = ${userId}
      ORDER BY i.fecha DESC
    `
    return NextResponse.json(exchanges)
  } catch (error) {
    console.error("Error fetching user exchanges:", error)
    return NextResponse.json({ error: "Error al obtener intercambios del usuario" }, { status: 500 })
  }
}
