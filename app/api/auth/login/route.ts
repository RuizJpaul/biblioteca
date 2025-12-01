import { getDb } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }


    const sql = getDb()
    const result = await sql`
      SELECT idUsuario, nombre, apellido, email, username, tipoUsuario, contrasena FROM usuario WHERE email = ${email}
    `

    // Manejar el tipo de resultado: puede ser un array o un objeto con 'rows'
    console.log('DB Result:', JSON.stringify(result, null, 2)) // Debug log
    let user: any | undefined
    if (Array.isArray(result)) {
      if (result.length === 0) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 })
      }
      user = result[0]
    } else if (result && Array.isArray(result.rows)) {
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 })
      }
      user = result.rows[0]
    } else {
      return NextResponse.json({ error: "Error inesperado en la consulta" }, { status: 500 })
    }

    if (!verifyPassword(password, user.contrasena)) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

    console.log('Raw user from DB:', JSON.stringify(user, null, 2)) // Debug log

    // Asegurarnos de que recibimos el rol exacto de la base de datos
    console.log('Raw tipoUsuario from DB:', user.tipousuario, user.tipoUsuario) // Debug: ver cómo viene de la DB
    
    const userData = {
      idUsuario: user.idUsuario ?? user.idusuario ?? null,
      nombre: user.nombre ?? user.nombre,
      apellido: user.apellido ?? user.apellido,
      email: user.email ?? user.email,
      username: user.username ?? user.username,
      // Neon DB puede devolver las columnas en minúsculas
      tipoUsuario: user.tipoUsuario ?? user.tipousuario ?? "usuario",
    }
    
    console.log('Processed userData:', JSON.stringify(userData, null, 2)) // Debug log

    const res = NextResponse.json(
      {
        user: userData,
        message: "Sesión iniciada",
      },
      {
        status: 200,
        headers: {
          // Cookie HttpOnly for improved security; client uses localStorage to detect session
          "Set-Cookie": `auth=${Buffer.from(JSON.stringify(userData)).toString("base64")}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
        },
      },
    )
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
  } catch (error) {
    console.error("Login error:", error)
    const res = NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
  }
}
