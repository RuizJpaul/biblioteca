import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const sql = getDb()
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    let users: any[] = []
    if (email) {
      const result = await sql`SELECT idUsuario, nombre, apellido, email, username, tipoUsuario, telefono, direccion, fecha_creacion FROM usuario WHERE email = ${email} LIMIT 1`
      if (Array.isArray(result)) users = result
      else if (result && Array.isArray((result as any).rows)) users = (result as any).rows
      if (users.length > 0) {
        return NextResponse.json({ user: users[0] })
      } else {
        return NextResponse.json({ user: null })
      }
    } else {
      const result = await sql`SELECT idUsuario, nombre, apellido, email, username, tipoUsuario, telefono, direccion, fecha_creacion FROM usuario ORDER BY fecha_creacion DESC`
      if (Array.isArray(result)) users = result
      else if (result && Array.isArray((result as any).rows)) users = (result as any).rows
      return NextResponse.json(users)
    }
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
