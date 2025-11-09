import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const sql = getDb()
    const result = await sql`
      UPDATE usuario 
      SET tipoUsuario = 'admin'
      WHERE email = ${email}
      RETURNING idUsuario, nombre, apellido, email, username, tipoUsuario
    `

    let user;
    if (Array.isArray(result)) {
      if (result.length === 0) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }
      user = result[0]
    } else if (result && Array.isArray(result.rows)) {
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }
      user = result.rows[0]
    } else {
      return NextResponse.json({ error: "Error inesperado en la consulta" }, { status: 500 })
    }

    // Normalize returned user keys
    const u: any = user
    const normalizedUser = {
      idUsuario: u.idUsuario ?? u.idusuario ?? null,
      nombre: u.nombre ?? u.name ?? null,
      apellido: u.apellido ?? null,
      email: u.email ?? null,
      username: u.username ?? null,
      tipoUsuario: (u.tipoUsuario ?? u.tipousuario ?? "usuario").toString().toLowerCase().trim(),
    }

    return NextResponse.json({ 
      message: "Usuario actualizado a admin",
      user: normalizedUser
    })
  } catch (error) {
    console.error("Error setting admin:", error)
    return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 })
  }
}