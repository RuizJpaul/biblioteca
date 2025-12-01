import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

function normalizeRows(res: any): any[] {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.rows)) return res.rows
  return []
}

export async function GET(request: NextRequest) {
  try {
    const sql = getDb()
    const auth = request.cookies.get('auth')?.value
    let userId = null
    
    if (auth) {
      try {
        const decoded = JSON.parse(Buffer.from(auth, 'base64').toString())
        userId = decoded.idUsuario
      } catch (e) {
        console.error('Error decoding auth cookie:', e)
      }
    }

    // Construir la consulta: si hay usuario autenticado, incluir sus libros además de los disponibles
    const base = sql`
      SELECT 
        l.idLibro,
        l.titulo,
        l.autor,
        l.anio,
        l.descripcion,
        l.editorial,
        l.genero,
        l.img_url,
        l.estado,
        l.idUsuario,
        l.fecha_creacion,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido
      FROM libro l 
      JOIN usuario u ON l.idUsuario = u.idUsuario 
    `

    let result
    if (userId) {
      // Mostrar libros disponibles o que pertenecen al usuario (incluyendo intercambiados)
      result = await sql`
        ${base}
        WHERE (l.estado IN ('disponible', 'intercambiado') OR l.idUsuario = ${userId})
        ORDER BY l.fecha_creacion DESC
      `
    } else {
      // Usuario no autenticado: solo libros disponibles
      result = await sql`
        ${base}
        WHERE l.estado = 'disponible'
        ORDER BY l.fecha_creacion DESC
      `
    }
    console.log('Query result:', result) // Para depuración

    const books = normalizeRows(result)
    console.log('Normalized books:', books) // Para depuración
    
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
