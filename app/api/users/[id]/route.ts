import { getDb } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

function normalizeRows(res: any) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.rows)) return res.rows
  return []
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const sql = getDb()
    const result = await sql`SELECT * FROM usuario WHERE idUsuario = ${Number.parseInt(id)}`
    const rows = normalizeRows(result)
    return NextResponse.json(rows[0] ?? null)
  } catch (error) {
    console.error("[api/users/[id]] GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const sql = getDb()

    // Log incoming body for debugging (only non-sensitive fields)
    console.debug("[api/users/[id]] PUT params:", { id })
    console.debug("[api/users/[id]] PUT body:", {
      nombre: body.nombre,
      apellido: body.apellido,
      telefono: body.telefono,
      direccion: body.direccion,
    })

    // Ensure telefono is either null or a valid integer
    const telefono = body.telefono === null || body.telefono === undefined ? null : 
                    typeof body.telefono === 'number' ? body.telefono : null;
    
    console.log('Processing phone number:', telefono); // Debug log

    await sql`
      UPDATE usuario SET 
        nombre = ${body.nombre}, 
        apellido = ${body.apellido}, 
        telefono = ${telefono}, 
        direccion = ${body.direccion ?? null}
      WHERE idUsuario = ${Number.parseInt(id)}
    `

    const updatedResult = await sql`SELECT * FROM usuario WHERE idUsuario = ${Number.parseInt(id)}`
    const updatedRows = normalizeRows(updatedResult)
    return NextResponse.json(updatedRows[0] ?? null)
  } catch (error: any) {
    console.error("[api/users/[id]] PUT Error: ", error)
    // Return the error message in development to help debugging (safe for dev only)
    const msg = (error && error.message) ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const sql = getDb()
    await sql`DELETE FROM usuario WHERE idUsuario = ${Number.parseInt(id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/users/[id]] DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
