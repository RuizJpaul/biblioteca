"use client"

import { useEffect, useState } from "react"

export interface User {
  idUsuario: number
  nombre: string
  apellido: string
  email: string
  username: string
  tipoUsuario: "admin" | "usuario"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Primero intentar leer localStorage (establecido por el cliente al hacer login)
    const tryFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem("auth_user")
        if (stored) {
          const parsed = JSON.parse(stored)
          // Ensure we have a usable id; if not, prefer fetching from server
          const hasId = parsed && (parsed.idUsuario || parsed.idusuario)
          if (!hasId) return false
            // Normalizar campos
          if (parsed && parsed.tipoUsuario && typeof parsed.tipoUsuario === "string") {
            parsed.tipoUsuario = parsed.tipoUsuario.toLowerCase().trim()
          }
            // Asegurarnos de que los campos nombre y apellido existan
            if (!parsed.nombre || !parsed.apellido) {
              return false // Forzar re-fetch desde el servidor
            }
          setUser(parsed)
          setLoading(false)
          return true
        }
      } catch (e) {
        // ignore
      }
      return false
    }

    // If localStorage had the user, we're done
    if (tryFromLocalStorage()) return

    // Otherwise, call the server endpoint /api/auth/me which reads the HttpOnly cookie
    const fetchMe = async () => {
      try {
        const resp = await fetch("/api/auth/me")
        if (!resp.ok) {
          // fallback: try to parse cookie if available (best-effort)
          try {
            const cookie = document.cookie.split("; ").find((c) => c.startsWith("auth="))
            if (cookie) {
              const userData = JSON.parse(Buffer.from(cookie.split("=")[1], "base64").toString())
              if (userData && userData.tipoUsuario && typeof userData.tipoUsuario === "string") {
                userData.tipoUsuario = userData.tipoUsuario.toLowerCase().trim()
              }
              setUser(userData)
            }
          } catch (e) {
            // ignore
          }
          setLoading(false)
          return
        }

        const data = await resp.json()
        if (data && data.user) {
          const userData = data.user
          if (userData && userData.tipoUsuario && typeof userData.tipoUsuario === "string") {
            userData.tipoUsuario = userData.tipoUsuario.toLowerCase().trim()
          }
          try {
            localStorage.setItem("auth_user", JSON.stringify(userData))
          } catch (e) {
            // ignore
          }
          setUser(userData)
        }
      } catch (err) {
        // ignore network errors
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [])

  const logout = () => {
    ;(async () => {
      try {
        // Ask server to clear the HttpOnly cookie
        await fetch("/api/auth/logout", { method: "POST" })
      } catch (e) {
        // ignore network errors
      }

      try {
        localStorage.removeItem("auth_user")
      } catch (e) {
        // ignore
      }

      // Best-effort clear client cookie (may not affect HttpOnly cookie)
      document.cookie = "auth=; Path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      setUser(null)
    })()
  }

  return { user, loading, logout }
}
