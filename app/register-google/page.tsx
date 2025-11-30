"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PublicNavbar } from "@/components/public-navbar"
import { PublicFooter } from "@/components/public-footer"
import { signIn } from "next-auth/react"

export default function RegisterGooglePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: session?.user?.name || "",
    apellido: "",
    username: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Si el usuario ya está registrado, redirigir al dashboard
    if (typeof window !== "undefined" && session && !(session.user as any)?.notRegistered) {
      window.location.replace("/user")
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      // Enviar datos al backend para crear el usuario
      const response = await fetch("/api/auth/register-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          username: formData.username,
          email: session?.user?.email // El email viene de Google
        })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Error al registrar usuario con Google")
        // Forzar logout si el registro falla
        if (typeof window !== "undefined") {
          const { signOut } = await import("next-auth/react")
          signOut({ callbackUrl: "/login" })
        }
        return
      }
      // Guardar user en localStorage para que el cliente reconozca la sesión
      try {
        localStorage.setItem("auth_user", JSON.stringify(data.user))
      } catch (e) {
        // ignore
      }
      // Fuerza reload de la sesión para que NextAuth actualice el estado
      await signIn("google", { redirect: true, callbackUrl: "/user" })
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
            <CardTitle>Completa tu registro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={loading}>
                {loading ? "Registrando..." : "Completar registro"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </div>
  )
}
