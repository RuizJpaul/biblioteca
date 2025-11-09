"use client"

import type React from "react"

import { UserNavbar } from "@/components/user-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { isAdmin } from "@/lib/role"

export default function AddBookPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    anio: new Date().getFullYear(),
    genero: "",
    editorial: "",
    descripcion: "",
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
    } catch (e) {
      router.push("/login")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      try {
        console.log("Book add payload:", formData)
        const uid = (user as any).idUsuario ?? (user as any).idusuario
        if (!uid) {
          console.error("Missing user id, cannot create book", user)
          router.push("/login")
          return
        }

        const res = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, idUsuario: uid }),
        })

        if (!res.ok) {
          const body = await res.text().catch(() => "<no body>")
          console.error("Failed to create book", res.status, body)
          return
        }

        const created = await res.json()
        console.log("Created book:", created)
        router.push("/user/my-books")
      } catch (err) {
        console.error("Error creating book:", err)
      }
    })()
  }

  if (!user) return <div className="flex items-center justify-center h-screen">Cargando...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar userName={user.nombre} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Libro</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      name="titulo"
                      placeholder="Título del libro"
                      value={formData.titulo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Autor</label>
                    <Input
                      name="autor"
                      placeholder="Autor del libro"
                      value={formData.autor}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Año</label>
                    <Input type="number" name="anio" value={formData.anio} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Género</label>
                    <select
                      name="genero"
                      value={formData.genero}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md"
                      required
                    >
                      <option value="">Selecciona un género</option>
                      <option>Ficción</option>
                      <option>Misterio</option>
                      <option>Ciencia Ficción</option>
                      <option>Romance</option>
                      <option>Historia</option>
                      <option>Autoayuda</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Editorial</label>
                  <Input
                    name="editorial"
                    placeholder="Editorial (opcional)"
                    value={formData.editorial}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    name="descripcion"
                    placeholder="Describe el libro..."
                    rows={4}
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Foto del Libro</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-muted-foreground mb-2">Arrastra una foto o haz clic para seleccionar</p>
                    <input type="file" accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Publicar Libro
                  </Button>
                  <Button variant="outline" onClick={() => router.back()} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
