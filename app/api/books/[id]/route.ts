import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = getDb()
    const result = await sql`
      SELECT l.*, u.nombre as usuario_nombre FROM libro l JOIN usuario u ON l.idUsuario = u.idUsuario WHERE l.idLibro = ${Number.parseInt(
        id,
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { titulo, autor, genero, editorial, descripcion, estado, anio, idUsuario } = body
    
    console.log('[PUT] Received data:', { titulo, autor, genero, estado, anio, idUsuario })
    
    // Validar que el usuario esté autenticado
    if (!idUsuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const sql = getDb()
    const bookId = Number.parseInt(id)

    // Verificar que el libro existe y pertenece al usuario
    const checkResult = await sql`
      SELECT idLibro, idUsuario FROM libro WHERE idLibro = ${bookId}
    `
    const checkRows = Array.isArray(checkResult) ? checkResult : (checkResult as any).rows || []
    
    console.log('[PUT] checkRows:', JSON.stringify(checkRows, null, 2))
    
    if (checkRows.length === 0) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    // Normalizar el idUsuario del libro (puede venir como idusuario o idUsuario)
    const bookOwnerId = checkRows[0].idusuario ?? checkRows[0].idUsuario ?? checkRows[0].idusuario
    console.log('[PUT] bookOwnerId:', bookOwnerId, 'requestUserId:', idUsuario, 'match:', bookOwnerId === idUsuario)
    
    if (bookOwnerId !== idUsuario) {
      return NextResponse.json({ error: "No tienes permiso para editar este libro" }, { status: 403 })
    }

    // Actualizar el libro
    const result = await sql`
      UPDATE libro
      SET titulo = ${titulo}, 
          autor = ${autor}, 
          genero = ${genero}, 
          editorial = ${editorial || null}, 
          descripcion = ${descripcion || null}, 
          estado = ${estado},
          anio = ${anio || null}
      WHERE idLibro = ${bookId}
      RETURNING *
    `

    const rows = Array.isArray(result) ? result : result && Array.isArray((result as any).rows) ? (result as any).rows : []
    if (rows.length === 0) {
      return NextResponse.json({ error: "Error al actualizar libro" }, { status: 500 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error updating book:", error)
    return NextResponse.json({ error: "Error al actualizar libro" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = getDb()
    const bookId = Number.parseInt(id)
    
    // Obtener idUsuario del body o query params
    const body = await request.json().catch(() => ({}))
    const idUsuario = body.idUsuario
    
    console.log('[DELETE] bookId:', bookId, 'idUsuario from body:', idUsuario)
    
    if (!idUsuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el libro existe y pertenece al usuario
    const checkResult = await sql`
      SELECT idLibro, idUsuario FROM libro WHERE idLibro = ${bookId}
    `
    const checkRows = Array.isArray(checkResult) ? checkResult : (checkResult as any).rows || []
    
    console.log('[DELETE] checkRows:', JSON.stringify(checkRows, null, 2))
    
    if (checkRows.length === 0) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    // Normalizar el idUsuario del libro (puede venir como idusuario o idUsuario)
    const bookOwnerId = checkRows[0].idusuario ?? checkRows[0].idUsuario ?? checkRows[0].idusuario
    console.log('[DELETE] bookOwnerId:', bookOwnerId, 'requestUserId:', idUsuario, 'match:', bookOwnerId === idUsuario)
    
    if (bookOwnerId !== idUsuario) {
      return NextResponse.json({ error: "No tienes permiso para eliminar este libro" }, { status: 403 })
    }

    // Eliminar el libro
    const result = await sql`DELETE FROM libro WHERE idLibro = ${bookId} RETURNING idLibro`
    const rows = Array.isArray(result) ? result : result && Array.isArray((result as any).rows) ? (result as any).rows : []

    if (rows.length === 0) {
      return NextResponse.json({ error: "Error al eliminar libro" }, { status: 500 })
    }

    return NextResponse.json({ message: "Libro eliminado" })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json({ error: "Error al eliminar libro" }, { status: 500 })
  }
}
