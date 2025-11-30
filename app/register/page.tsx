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
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al registrarse")
        return
      }

      // Guardar user en localStorage para que el cliente reconozca la sesión
      try {
        if (data.user && data.user.tipoUsuario && typeof data.user.tipoUsuario === "string") {
          data.user.tipoUsuario = data.user.tipoUsuario.toLowerCase().trim()
        }
        localStorage.setItem("auth_user", JSON.stringify(data.user))
      } catch (e) {
        console.warn("No se pudo guardar user en localStorage", e)
      }

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
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Únete a BookExchange hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <Input
                    name="nombre"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Apellido</label>
                  <Input
                    name="apellido"
                    placeholder="Tu apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Usuario</label>
                <Input
                  name="username"
                  placeholder="tu_usuario"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirmar Contraseña</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={loading}>
                {loading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>
            <div className="my-4 flex items-center justify-center">
              <span className="text-muted-foreground">o</span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => signIn("google", { callbackUrl: "/user", prompt: "select_account" })}
            >
              <svg width="22" height="22" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
                <g>
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.91-6.91C36.36 2.34 30.55 0 24 0 14.61 0 6.27 5.7 2.44 14.02l8.06 6.27C12.44 13.13 17.77 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.09 24.5c0-1.64-.15-3.22-.44-4.75H24v9.02h12.44c-.54 2.91-2.18 5.38-4.64 7.04l7.18 5.59C43.73 37.7 46.09 31.64 46.09 24.5z"/>
                  <path fill="#FBBC05" d="M10.5 28.29c-1.13-3.38-1.13-7.02 0-10.4l-8.06-6.27C.81 15.61 0 19.67 0 24c0 4.33.81 8.39 2.44 12.38l8.06-6.27z"/>
                  <path fill="#EA4335" d="M24 46c6.55 0 12.36-2.34 16.15-6.31l-7.18-5.59c-2.01 1.35-4.59 2.15-7.47 2.15-6.23 0-11.56-3.63-13.5-8.79l-8.06 6.27C6.27 42.3 14.61 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </g>
              </svg>
              Registrarse con Google
            </Button>
            <p className="text-sm text-center mt-4 text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </div>
  )
}
