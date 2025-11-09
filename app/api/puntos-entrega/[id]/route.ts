import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

// PUT actualizar punto de entrega
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre, direccion, ciudad, provincia, codigo_postal, referencia, es_predeterminado } = await req.json()
    const { id } = params

    // Si es predeterminado, desmarcar otros
    const sql = getDb()
    if (es_predeterminado) {
      await sql`UPDATE punto_entrega SET es_predeterminado = FALSE WHERE idPuntoEntrega != ${id}`
    }

    const result = await sql`UPDATE punto_entrega 
       SET nombre = ${nombre}, direccion = ${direccion}, ciudad = ${ciudad}, provincia = ${provincia}, codigo_postal = ${codigo_postal}, referencia = ${referencia}, es_predeterminado = ${es_predeterminado}
       WHERE idPuntoEntrega = ${id}
       RETURNING *`

    let row: any = null
    if (Array.isArray(result)) row = result[0]
    else if (result && Array.isArray((result as any).rows)) row = (result as any).rows[0]

    return NextResponse.json(row)
  } catch (error) {
    console.error("Error updating punto:", error)
    return NextResponse.json({ error: "Error al actualizar punto de entrega" }, { status: 500 })
  }
}

// DELETE eliminar punto de entrega
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const sql = getDb()
    await sql`DELETE FROM punto_entrega WHERE idPuntoEntrega = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting punto:", error)
    return NextResponse.json({ error: "Error al eliminar punto de entrega" }, { status: 500 })
  }
}
