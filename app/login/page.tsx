"use client"

import type React from "react"

import { PublicNavbar } from "@/components/public-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const GoogleIcon = (
    <svg width="22" height="22" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
      <g>
        <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.91-6.91C36.36 2.34 30.55 0 24 0 14.61 0 6.27 5.7 2.44 14.02l8.06 6.27C12.44 13.13 17.77 9.5 24 9.5z"/>
        <path fill="#34A853" d="M46.09 24.5c0-1.64-.15-3.22-.44-4.75H24v9.02h12.44c-.54 2.91-2.18 5.38-4.64 7.04l7.18 5.59C43.73 37.7 46.09 31.64 46.09 24.5z"/>
        <path fill="#FBBC05" d="M10.5 28.29c-1.13-3.38-1.13-7.02 0-10.4l-8.06-6.27C.81 15.61 0 19.67 0 24c0 4.33.81 8.39 2.44 12.38l8.06-6.27z"/>
        <path fill="#EA4335" d="M24 46c6.55 0 12.36-2.34 16.15-6.31l-7.18-5.59c-2.01 1.35-4.59 2.15-7.47 2.15-6.23 0-11.56-3.63-13.5-8.79l-8.06 6.27C6.27 42.3 14.61 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </g>
    </svg>
  );

  const UserIcon = (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ margin: "0 auto 1rem" }}>
      <circle cx="24" cy="24" r="24" fill="#e3e3e3" />
      <circle cx="24" cy="20" r="10" fill="#bdbdbd" />
      <ellipse cx="24" cy="38" rx="14" ry="8" fill="#bdbdbd" />
    </svg>
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión")
        return
      }

        console.log('Response data:', data) // Debug log

        // Guardar user en localStorage para que el cliente conozca la sesión
        try {
          // Normalize tipoUsuario before storing
          if (data.user && data.user.tipoUsuario && typeof data.user.tipoUsuario === "string") {
            data.user.tipoUsuario = data.user.tipoUsuario.toLowerCase().trim()
            console.log('Normalized tipoUsuario:', data.user.tipoUsuario) // Debug log
          }
          localStorage.setItem("auth_user", JSON.stringify(data.user))
          console.log('Stored in localStorage:', data.user) // Debug log
        } catch (e) {
          console.warn("No se pudo guardar user en localStorage", e)
        }

        console.log('isAdmin check:', data.user.tipoUsuario, isAdmin(data.user.tipoUsuario)) // Debug log
        router.push(isAdmin(data.user.tipoUsuario) ? "/admin" : "/user")
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PublicNavbar />
      <main
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #a7bfe8 0%, #6190e8 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
            width: "100%",
            maxWidth: 800,
            minHeight: 480,
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#f5f8ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
            }}
          >
            {/* Imagen ilustrativa SVG */}
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
              <rect width="220" height="220" rx="32" fill="#e3eafd" />
              <g>
                <rect x="40" y="60" width="140" height="80" rx="16" fill="#b3c7f7" />
                <rect x="60" y="80" width="100" height="40" rx="8" fill="#fff" />
                <circle cx="80" cy="100" r="8" fill="#6190e8" />
                <rect x="100" y="95" width="40" height="10" rx="5" fill="#e3eafd" />
              </g>
            </svg>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
            }}
          >
            <Card style={{ width: "100%", boxShadow: "none", borderRadius: 0, padding: 0, background: "transparent" }}>
              <CardHeader style={{ textAlign: "left", paddingBottom: 0 }}>
                <CardTitle style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Bienvenido</CardTitle>
                <CardDescription style={{ color: "#555", fontSize: 16, marginBottom: 16 }}>
                  Accede con tu cuenta o Google
                </CardDescription>
              </CardHeader>
              <CardContent style={{ paddingTop: 0 }}>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ fontSize: 16, borderRadius: 8, padding: "0.75rem" }}
                  />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ fontSize: 16, borderRadius: 8, padding: "0.75rem" }}
                  />
                  <Button type="submit" disabled={loading} style={{ fontWeight: 600, fontSize: 16, borderRadius: 8, background: "#6190e8" }}>
                    {loading ? "Ingresando..." : "Ingresar"}
                  </Button>
                  <div style={{ textAlign: "center", margin: "1rem 0" }}>
                    <span style={{ color: "#aaa", fontSize: 14 }}>o</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => signIn("google", { callbackUrl: "/user", prompt: "select_account" })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "#fff",
                      color: "#444",
                      border: "1px solid #dadce0",
                      fontWeight: 500,
                      fontSize: 16,
                      borderRadius: 8,
                      boxShadow: "0 1px 2px rgba(60,64,67,.08)",
                      padding: "0.75rem"
                    }}
                  >
                    {GoogleIcon}
                    Iniciar sesión con Google
                  </Button>
                  {error && <div style={{ color: "#d93025", marginTop: "0.5rem", textAlign: "center" }}>{error}</div>}
                </form>
                <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                  <Link href="/register" style={{ color: "#6190e8", fontWeight: 500 }}>¿No tienes cuenta? Regístrate</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
