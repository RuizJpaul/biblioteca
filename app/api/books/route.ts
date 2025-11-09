import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

function normalizeRows(res: any): any[] {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.rows)) return res.rows
  return []
}

export async function GET() {
  try {
    const sql = getDb()
    const result = await sql`SELECT l.*, u.nombre as usuario_nombre FROM libro l JOIN usuario u ON l.idUsuario = u.idUsuario ORDER BY l.fecha_creacion DESC`
    const books = normalizeRows(result)
    return NextResponse.json(books)
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json({ error: "Error al obtener libros" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { titulo, autor, genero, anio, editorial, descripcion, idUsuario } = await request.json()

    if (!titulo || !autor || !genero || !idUsuario) {
      return NextResponse.json({ error: "Campos requeridos incompletos" }, { status: 400 })
    }

    const sql = getDb()
    const result = await sql`
      INSERT INTO libro (titulo, autor, genero, anio, editorial, descripcion, idUsuario)
      VALUES (${titulo}, ${autor}, ${genero}, ${anio ?? null}, ${editorial ?? null}, ${descripcion ?? null}, ${idUsuario})
      RETURNING *
    `

    const rows = normalizeRows(result)
    return NextResponse.json(rows[0] ?? null, { status: 201 })
  } catch (error) {
    console.error("Error creating book:", error)
    return NextResponse.json({ error: "Error al crear libro" }, { status: 500 })
  }
}
