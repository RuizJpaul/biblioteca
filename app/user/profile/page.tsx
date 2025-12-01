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
import { useSession } from "next-auth/react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  useEffect(() => {
    if ((session?.user as any)?.notRegistered) {
      alert("Usted no ha sido registrado. Por favor contacte al administrador.")
      localStorage.removeItem("auth_user")
      router.push("/login")
    }
  }, [session, router])
  if ((session?.user as any)?.notRegistered) {
    return <div />
  }

  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
  } as {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
  })

  useEffect(() => {
    if (session && session.user) {
      setUser(session.user)
      setFormData({
        nombre: session.user.name || "",
        apellido: "",
        email: session.user.email || "",
        telefono: "",
        direccion: "",
      })
    } else {
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
            nombre: userData.nombre || "",
            apellido: userData.apellido || "",
            email: userData.email || "",
            telefono: userData.telefono || "",
            direccion: userData.direccion || "",
          })
        }
      } catch {}
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    ;(async () => {
      try {
        // Obtener el ID del usuario (normalizar idUsuario/idusuario)
        const userId = user.idUsuario ?? user.idusuario
        
        if (!userId) {
          console.error('Missing user ID, cannot update profile')
          alert('Error: No se pudo identificar el usuario')
          return
        }

        // Validate phone number
        let phoneNumber = null;
        if (formData.telefono && formData.telefono.trim() !== '') {
          // Remove any non-digit characters
          const cleanPhone = formData.telefono.replace(/\D/g, '');
          if (cleanPhone) {
            phoneNumber = parseInt(cleanPhone);
          }
        }

        console.log('Updating user:', userId, 'with phone:', phoneNumber); // Debug log

        const resp = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: phoneNumber,
            direccion: formData.direccion || null,
          }),
        })

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: 'Unknown error' }))
          alert(err.error || 'Error al actualizar el perfil')
          return
        }

        const updated = await resp.json()
        // Actualizar estado local y localStorage
        setUser(updated)
        setFormData({
          nombre: updated.nombre || "",
          apellido: updated.apellido || "",
          email: updated.email || formData.email,
          telefono: updated.telefono || "",
          direccion: updated.direccion || "",
        })
        try {
          localStorage.setItem("auth_user", JSON.stringify(updated))
        } catch (e) {
          // ignore
        }

        setEditing(false)
        alert('Perfil actualizado correctamente')
      } catch (error) {
        console.error('Error updating profile:', error)
        alert('Error al actualizar el perfil')
      }
    })()
  }

  if (status === "loading") return <div>Cargando...</div>
  if (!user) return <div>No autenticado</div>

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
                      type="number"
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
            <DeliveryLocationsForm userId={user.idUsuario ?? user.idusuario} />
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
