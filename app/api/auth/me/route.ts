import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || ""
    const cookie = cookieHeader.split("; ").map(c => c.trim()).find(c => c.startsWith("auth="))
    if (!cookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const base = cookie.split("=")[1]
    const decoded = Buffer.from(base, "base64").toString()
    const user = JSON.parse(decoded)

    if (user) {
      // Normalize keys that may come from different drivers
      user.idUsuario = user.idUsuario ?? user.idusuario ?? null
      if (user && user.tipoUsuario && typeof user.tipoUsuario === "string") {
        user.tipoUsuario = user.tipoUsuario.toLowerCase().trim()
      } else if (user && user.tipousuario && typeof user.tipousuario === "string") {
        user.tipoUsuario = user.tipousuario.toLowerCase().trim()
      }
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Invalid auth data" }, { status: 400 })
  }
}
