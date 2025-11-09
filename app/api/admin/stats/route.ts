import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

function normalize(res: any) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.rows)) return res.rows
  return []
}

export async function GET() {
  try {
    const sql = getDb()

    const usersRes = await sql`SELECT COUNT(*) as count FROM usuario`
    const booksRes = await sql`SELECT COUNT(*) as count FROM libro`
    const exchangesRes = await sql`SELECT COUNT(*) as count FROM intercambio`

    const users = Number((Array.isArray(usersRes) ? usersRes[0] : (usersRes as any).rows?.[0])?.count ?? 0)
    const books = Number((Array.isArray(booksRes) ? booksRes[0] : (booksRes as any).rows?.[0])?.count ?? 0)
    const exchanges = Number((Array.isArray(exchangesRes) ? exchangesRes[0] : (exchangesRes as any).rows?.[0])?.count ?? 0)

    const recentBooksRes = await sql`
      SELECT l.*, u.nombre as usuario_nombre
      FROM libro l
      JOIN usuario u ON l.idUsuario = u.idUsuario
      ORDER BY l.fecha_creacion DESC
      LIMIT 6
    `

    const recentExchangesRes = await sql`
      SELECT i.*, lo.titulo as libro_ofrecido_titulo, lr.titulo as libro_recibido_titulo
      FROM intercambio i
      JOIN libro lo ON i.libro_ofrecido_id = lo.idLibro
      JOIN libro lr ON i.libro_recibido_id = lr.idLibro
      ORDER BY i.fecha DESC
      LIMIT 6
    `

    const recentBooks = normalize(recentBooksRes)
    const recentExchanges = normalize(recentExchangesRes)

    return NextResponse.json({ users, books, exchanges, recentBooks, recentExchanges })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
