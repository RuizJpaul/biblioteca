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
