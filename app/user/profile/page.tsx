"use client"

import type React from "react"

import { UserNavbar } from "@/components/user-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"
import { DeliveryLocationsForm } from "@/components/delivery-locations-form"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user")
      if (stored) {
        const userData = JSON.parse(stored)
        if (isAdmin(userData.tipoUsuario)) {
          router.push("/admin")
          return
        }
        setUser(userData)
        setFormData({
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          telefono: "",
          direccion: "",
        })
        return
      }
    } catch (e) {
      // ignore
    }

    const cookie = document.cookie.split("; ").find((c) => c.startsWith("auth="))
    if (!cookie) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(Buffer.from(cookie.split("=")[1], "base64").toString())
      if (isAdmin(userData.tipoUsuario)) {
        router.push("/admin")
        return
      }
      setUser(userData)
      setFormData({
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        telefono: "",
        direccion: "",
      })
    } catch (e) {
      router.push("/login")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    console.log("Profile updated:", formData)
    setEditing(false)
  }

  if (!user) return <div className="flex items-center justify-center h-screen">Cargando...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar userName={user.nombre} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              {!editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-semibold">{formData.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Apellido</p>
                      <p className="font-semibold">{formData.apellido}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-semibold">{formData.telefono || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-semibold">{formData.direccion || "No especificada"}</p>
                  </div>
                  <Button onClick={() => setEditing(true)} className="w-full mt-6">
                    Editar Perfil
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nombre</label>
                      <Input name="nombre" value={formData.nombre} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Apellido</label>
                      <Input name="apellido" value={formData.apellido} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input name="email" value={formData.email} onChange={handleChange} disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Teléfono</label>
                    <Input
                      name="telefono"
                      placeholder="Tu teléfono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dirección</label>
                    <Input
                      name="direccion"
                      placeholder="Tu dirección"
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8">
            <DeliveryLocationsForm userId={user.idUsuario} />
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
