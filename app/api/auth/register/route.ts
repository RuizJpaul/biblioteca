import { getDb } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { nombre, apellido, email, username, password, confirmPassword } = await request.json()

    if (!nombre || !apellido || !email || !username || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 })
    }

    const sql = getDb()
    const hashedPassword = hashPassword(password)

    try {
      const result = (await sql`
        INSERT INTO usuario (nombre, apellido, email, username, contrasena)
        VALUES (${nombre}, ${apellido}, ${email}, ${username}, ${hashedPassword})
        RETURNING idUsuario, nombre, apellido, email, username, tipoUsuario
      `) as Record<string, any>[]

      const rawUser = result[0]
        const user = {
          idUsuario: rawUser.idUsuario ?? rawUser.idusuario ?? null,
          nombre: rawUser.nombre,
          apellido: rawUser.apellido,
          email: rawUser.email,
          username: rawUser.username,
          tipoUsuario: typeof rawUser.tipoUsuario === "string" ? rawUser.tipoUsuario.toLowerCase().trim() : rawUser.tipousuario ?? "usuario",
        }

      return NextResponse.json(
        {
          user,
          message: "Usuario creado exitosamente",
        },
        {
          status: 201,
          headers: {
            // Cookie HttpOnly for improved security; client can still use response.user
            "Set-Cookie": `auth=${Buffer.from(JSON.stringify(user)).toString("base64")}; Path=/; HttpOnly; SameSite=Strict`,
          },
        },
      )
    } catch (dbError: any) {
      if (dbError.message?.includes("unique")) {
        return NextResponse.json({ error: "El email o username ya está registrado" }, { status: 409 })
      }
      throw dbError
    }
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
