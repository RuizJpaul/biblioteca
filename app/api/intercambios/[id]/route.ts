import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

function normalizeRows(res: any): any[] {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.rows)) return res.rows
  return []
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = getDb()
    const exchangeId = Number.parseInt(id)
    const result = await sql`
      SELECT i.*, 
        lo.titulo as libro_ofrecido_titulo,
        lr.titulo as libro_recibido_titulo
      FROM intercambio i
      JOIN libro lo ON i.libro_ofrecido_id = lo.idLibro
      JOIN libro lr ON i.libro_recibido_id = lr.idLibro
      WHERE i.idIntercambio = ${exchangeId}
    `
    
    const exchange = normalizeRows(result)

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Intercambio no encontrado" }, { status: 404 })
    }

    return NextResponse.json(exchange[0])
  } catch (error) {
    console.error("Error fetching exchange:", error)
    return NextResponse.json({ error: "Error al obtener intercambio" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { estado } = await request.json()
    const sql = getDb()
    const exchangeId = Number.parseInt(id)

    const queryResult = await sql`
      UPDATE intercambio 
      SET estado = ${estado} 
      WHERE idIntercambio = ${exchangeId} 
      RETURNING *
    `
    
    const result = normalizeRows(queryResult)

    if (result.length === 0) {
      return NextResponse.json({ error: "Intercambio no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating exchange:", error)
    return NextResponse.json({ error: "Error al actualizar intercambio" }, { status: 500 })
  }
}
