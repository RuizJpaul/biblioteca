import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const sql = getDb()
  try {
    // 1. Ver el usuario actual
    const currentUser = await sql`
      SELECT idUsuario, email, tipoUsuario 
      FROM usuario 
      WHERE email = 'admin@ejemplo.com'
    `
    console.log('Usuario actual:', currentUser)

    // 2. Actualizar a admin
    const updated = await sql`
      UPDATE usuario 
      SET tipoUsuario = 'admin' 
      WHERE email = 'admin@ejemplo.com'
      RETURNING idUsuario, email, tipoUsuario
    `
    console.log('Usuario actualizado:', updated)

    return NextResponse.json({
      message: "Rol actualizado a admin",
      before: currentUser,
      after: updated
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error actualizando rol" }, { status: 500 })
  }
}