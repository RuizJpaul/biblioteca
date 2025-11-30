import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nombre, apellido, username, email } = body
    if (!nombre || !apellido || !username || !email) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    const db = getDb()
    // Verifica si el usuario ya existe
    const existing = await db`SELECT * FROM usuario WHERE email = ${email}`
    const existingRows = Array.isArray(existing) ? existing : (existing?.rows ?? [])
    if (existingRows.length > 0) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 })
    }

    // Crea el usuario en la base de datos
    const result = await db`
      INSERT INTO usuario (nombre, apellido, username, email, contrasena, tipoUsuario)
      VALUES (${nombre}, ${apellido}, ${username}, ${email}, 'google', 'usuario')
      RETURNING *
    `
    const rows = Array.isArray(result) ? result : (result?.rows ?? [])
    const user = rows[0]

    return NextResponse.json({ user }, { status: 201 })
  } catch (err: any) {
    console.error("Error en register-google:", err)
    return NextResponse.json({ error: err?.message || "Error al registrar usuario", details: err }, { status: 500 })
  }
}
