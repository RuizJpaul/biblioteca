import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = getDb()
    // use tagged template as required by the neon client
    const result = await sql`SELECT idUsuario, nombre, apellido, email, username, tipoUsuario, telefono, direccion, fecha_creacion FROM usuario ORDER BY fecha_creacion DESC`

    // normalize driver return shape
    let users: any[] = []
    if (Array.isArray(result)) users = result
    else if (result && Array.isArray((result as any).rows)) users = (result as any).rows

    return NextResponse.json(users)
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
