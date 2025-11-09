import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb()
    const exchanges = await sql(
      `SELECT i.* FROM intercambio i 
      WHERE i.usuario_origen_id = $1 OR i.usuario_destino_id = $1 
      ORDER BY i.fecha DESC`,
      [Number.parseInt(params.id)],
    )
    return NextResponse.json(exchanges)
  } catch (error) {
    console.error("Error fetching user exchanges:", error)
    return NextResponse.json({ error: "Error al obtener intercambios del usuario" }, { status: 500 })
  }
}
