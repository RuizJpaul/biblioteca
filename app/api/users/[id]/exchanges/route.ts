import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = getDb()
    const userId = Number.parseInt(id)
    const exchanges = await sql`
      SELECT i.*, lo.titulo as libro_ofrecido_titulo, lr.titulo as libro_recibido_titulo
      FROM intercambio i
      JOIN libro lo ON i.libro_ofrecido_id = lo.idLibro
      JOIN libro lr ON i.libro_recibido_id = lr.idLibro
      WHERE i.usuario_origen_id = ${userId} OR i.usuario_destino_id = ${userId}
      ORDER BY i.fecha DESC
    `
    return NextResponse.json(exchanges)
  } catch (error) {
    console.error("Error fetching user exchanges:", error)
    return NextResponse.json({ error: "Error al obtener intercambios del usuario" }, { status: 500 })
  }
}
