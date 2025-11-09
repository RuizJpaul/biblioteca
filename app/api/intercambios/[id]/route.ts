import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb()
    const exchange = await sql(
      `SELECT i.*, 
        lo.titulo as libro_ofrecido_titulo,
        lr.titulo as libro_recibido_titulo
      FROM intercambio i
      JOIN libro lo ON i.libro_ofrecido_id = lo.idLibro
      JOIN libro lr ON i.libro_recibido_id = lr.idLibro
      WHERE i.idIntercambio = $1`,
      [Number.parseInt(params.id)],
    )

    if (exchange.length === 0) {
      return NextResponse.json({ error: "Intercambio no encontrado" }, { status: 404 })
    }

    return NextResponse.json(exchange[0])
  } catch (error) {
    console.error("Error fetching exchange:", error)
    return NextResponse.json({ error: "Error al obtener intercambio" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { estado } = await request.json()
    const sql = getDb()

    const result = await sql("UPDATE intercambio SET estado = $1 WHERE idIntercambio = $2 RETURNING *", [
      estado,
      Number.parseInt(params.id),
    ])

    if (result.length === 0) {
      return NextResponse.json({ error: "Intercambio no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating exchange:", error)
    return NextResponse.json({ error: "Error al actualizar intercambio" }, { status: 500 })
  }
}
