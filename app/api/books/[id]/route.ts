import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb()
    const result = await sql`
      SELECT l.*, u.nombre as usuario_nombre FROM libro l JOIN usuario u ON l.idUsuario = u.idUsuario WHERE l.idLibro = ${Number.parseInt(
        params.id,
      )}
    `

    const rows = Array.isArray(result) ? result : result && Array.isArray((result as any).rows) ? (result as any).rows : []
    if (rows.length === 0) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching book:", error)
    return NextResponse.json({ error: "Error al obtener libro" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { titulo, autor, genero, editorial, descripcion, estado } = await request.json()
    const sql = getDb()
    const result = await sql`
      UPDATE libro
      SET titulo = ${titulo}, autor = ${autor}, genero = ${genero}, editorial = ${editorial}, descripcion = ${descripcion}, estado = ${estado}
      WHERE idLibro = ${Number.parseInt(params.id)}
      RETURNING *
    `

    const rows = Array.isArray(result) ? result : result && Array.isArray((result as any).rows) ? (result as any).rows : []
    if (rows.length === 0) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error updating book:", error)
    return NextResponse.json({ error: "Error al actualizar libro" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb()
    const result = await sql`DELETE FROM libro WHERE idLibro = ${Number.parseInt(params.id)} RETURNING idLibro`
    const rows = Array.isArray(result) ? result : result && Array.isArray((result as any).rows) ? (result as any).rows : []

    if (rows.length === 0) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Libro eliminado" })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json({ error: "Error al eliminar libro" }, { status: 500 })
  }
}
