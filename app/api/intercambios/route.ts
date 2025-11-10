import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

interface Book {
  idLibro: number
  idUsuario: number
}

export async function GET() {
  try {
    const sql = getDb()
    const result = await sql`
      SELECT i.*, 
        lo.titulo as libro_ofrecido_titulo, 
        lr.titulo as libro_recibido_titulo,
        uo.nombre as usuario_origen_nombre,
        ud.nombre as usuario_destino_nombre
      FROM intercambio i
      JOIN libro lo ON i.libro_ofrecido_id = lo.idLibro
      JOIN libro lr ON i.libro_recibido_id = lr.idLibro
      JOIN usuario uo ON i.usuario_origen_id = uo.idUsuario
      JOIN usuario ud ON i.usuario_destino_id = ud.idUsuario
      ORDER BY i.fecha DESC`
    
    // Normalize result
    let exchanges = []
    if (Array.isArray(result)) exchanges = result
    else if (result && Array.isArray((result as any).rows)) exchanges = (result as any).rows
    return NextResponse.json(exchanges)
  } catch (error) {
    console.error("Error fetching exchanges:", error)
    return NextResponse.json({ error: "Error al obtener intercambios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { libro_ofrecido_id, libro_recibido_id, usuario_origen_id, usuario_destino_id } = await request.json()

    if (!libro_ofrecido_id || !libro_recibido_id || !usuario_origen_id || !usuario_destino_id) {
      return NextResponse.json({ error: "Campos requeridos incompletos" }, { status: 400 })
    }

    // No permitir que el libro ofrecido y el recibido sean el mismo
    if (Number(libro_ofrecido_id) === Number(libro_recibido_id)) {
      return NextResponse.json({ error: "No puedes proponer un intercambio con el mismo libro" }, { status: 400 })
    }

    // Validar que no sea un auto-intercambio
    if (usuario_origen_id === usuario_destino_id) {
      return NextResponse.json({ error: "No puedes intercambiar libros contigo mismo" }, { status: 400 })
    }

    const db = getDb()
    
    // Verificar propiedad de los libros
    const books = await db`
      SELECT idLibro, idUsuario 
      FROM libro 
      WHERE idLibro IN (${libro_ofrecido_id}, ${libro_recibido_id})`

    if (!Array.isArray(books) && !Array.isArray((books as any).rows)) {
      return NextResponse.json({ error: "Error al validar libros" }, { status: 500 })
    }

    const bookList = Array.isArray(books) ? books : (books as any).rows
    if (bookList.length !== 2) {
      return NextResponse.json({ error: "Uno o ambos libros no existen" }, { status: 404 })
    }

    const libroOfrecido = bookList.find((b: Book) => b.idLibro === Number(libro_ofrecido_id))
    const libroRecibido = bookList.find((b: Book) => b.idLibro === Number(libro_recibido_id))

    // Validar que cada usuario sea dueño del libro que ofrece
    if (libroOfrecido?.idUsuario !== Number(usuario_origen_id)) {
      return NextResponse.json({ error: "No eres dueño del libro que ofreces" }, { status: 403 })
    }
    if (libroRecibido?.idUsuario !== Number(usuario_destino_id)) {
      return NextResponse.json({ error: "El libro solicitado no pertenece al usuario destino" }, { status: 403 })
    }

    // Insertar intercambio
    const result = await db`
      INSERT INTO intercambio (libro_ofrecido_id, libro_recibido_id, usuario_origen_id, usuario_destino_id) 
      VALUES (${libro_ofrecido_id}, ${libro_recibido_id}, ${usuario_origen_id}, ${usuario_destino_id}) 
      RETURNING *`

    // Asumimos que el primer registro es el intercambio creado
    const exchange = Array.isArray(result) ? result[0] : (result as any).rows?.[0]
    if (!exchange) {
      return NextResponse.json({ error: "Error al crear intercambio" }, { status: 500 })
    }

    return NextResponse.json(exchange, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear intercambio" }, { status: 500 })
  }
}
