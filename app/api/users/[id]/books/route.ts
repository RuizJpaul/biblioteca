import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params
    const sql = getDb()
    let id = Number.parseInt(String(paramId ?? ""))
    console.log('[api] GET /api/users/:id/books paramId =>', paramId, 'parsed id =>', id)

    // Fallback: try to extract numeric id from URL path if params.id wasn't valid
    if (!id || Number.isNaN(id)) {
      try {
        const url = new URL(request.url)
        const match = url.pathname.match(/\/api\/users\/(\d+)\/books/) || url.pathname.match(/(\d+)/)
        if (match && match[1]) {
          id = Number.parseInt(match[1])
        }
      } catch (e) {
        // ignore
      }
    }

    if (!id || Number.isNaN(id)) {
      console.warn('[api] Invalid or missing user id after fallback, returning empty array to client', { params })
      // Return empty list instead of error so client can render "no books"
      return NextResponse.json([], { status: 200 })
    }

    const result = await sql`SELECT * FROM libro WHERE idUsuario = ${id} ORDER BY fecha_creacion DESC`
    console.log('[api] DB result for user books:', JSON.stringify(result, null, 2))
    let books: any[] = []
    if (Array.isArray(result)) books = result
    else if (result && Array.isArray((result as any).rows)) books = (result as any).rows

    // Always return an array (possibly empty) with 200 so client can render "no books" gracefully
    return NextResponse.json(books, { status: 200 })
  } catch (error) {
    console.error("Error fetching user books:", error)
    return NextResponse.json({ error: "Error al obtener libros del usuario" }, { status: 500 })
  }
}
