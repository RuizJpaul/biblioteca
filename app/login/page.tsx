"use client"

import type React from "react"

import { PublicNavbar } from "@/components/public-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ingresar</CardTitle>
            <CardDescription>Inicia sesión en tu cuenta BookExchange</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
            <p className="text-sm text-center mt-4 text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </div>
  )
}
