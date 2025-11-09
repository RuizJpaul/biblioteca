import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

// GET todos los puntos de entrega del usuario
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 })
    }

    const sql = getDb()
    const result = await sql`SELECT * FROM punto_entrega WHERE idUsuario = ${userId} ORDER BY es_predeterminado DESC, fecha_creacion DESC`
    let puntos: any[] = []
    if (Array.isArray(result)) puntos = result
    else if (result && Array.isArray((result as any).rows)) puntos = (result as any).rows

    return NextResponse.json(puntos)
  } catch (error) {
    console.error("Error fetching puntos:", error)
    return NextResponse.json({ error: "Error al obtener puntos de entrega" }, { status: 500 })
  }
}

// POST crear nuevo punto de entrega
export async function POST(req: NextRequest) {
  try {
    const { idUsuario, nombre, direccion, ciudad, provincia, codigo_postal, referencia } = await req.json()

    const sql = getDb()
    const result = await sql`INSERT INTO punto_entrega (idUsuario, nombre, direccion, ciudad, provincia, codigo_postal, referencia)
       VALUES (${idUsuario}, ${nombre}, ${direccion}, ${ciudad}, ${provincia}, ${codigo_postal}, ${referencia})
       RETURNING *`

    let row: any = null
    if (Array.isArray(result)) row = result[0]
    else if (result && Array.isArray((result as any).rows)) row = (result as any).rows[0]

    return NextResponse.json(row, { status: 201 })
  } catch (error) {
    console.error("Error creating punto:", error)
    return NextResponse.json({ error: "Error al crear punto de entrega" }, { status: 500 })
  }
}
