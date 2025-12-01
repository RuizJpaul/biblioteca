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

    const booksByCategoryRes = await sql`
      SELECT genero, COUNT(*) as count
      FROM libro
      GROUP BY genero
      ORDER BY count DESC
      LIMIT 12
    `

    const recentBooksRes = await sql`
      SELECT idLibro, titulo, autor, genero, img_url, fecha_creacion
      FROM libro
      ORDER BY fecha_creacion DESC
      LIMIT 6
    `

    const users = Number((Array.isArray(usersRes) ? usersRes[0] : (usersRes as any).rows?.[0])?.count ?? 0)
    const books = Number((Array.isArray(booksRes) ? booksRes[0] : (booksRes as any).rows?.[0])?.count ?? 0)
    const booksByCategory = normalize(booksByCategoryRes)
    const recentBooks = normalize(recentBooksRes)

    const res = NextResponse.json({ users, books, booksByCategory, recentBooks })
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
  } catch (error) {
    console.error("Error fetching public stats:", error)
    const res = NextResponse.json({ error: "Error al obtener estadísticas públicas" }, { status: 500 })
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
  }
}
