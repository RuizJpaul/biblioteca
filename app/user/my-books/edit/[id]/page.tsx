"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { UserNavbar } from "@/components/user-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState, useEffect as useEffectReact } from "react"
import { isAdmin } from "@/lib/role"
import { useAuth } from "@/hooks/use-auth"

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [loadingBook, setLoadingBook] = useState(true)
  const [bookId, setBookId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    anio: new Date().getFullYear(),
    genero: "",
    editorial: "",
    descripcion: "",
    estado: "disponible",
  })

  // Unwrap params
  useEffect(() => {
    params.then(({ id }) => setBookId(id))
  }, [params])

  useEffect(() => {
    // Wait until we have the bookId
    if (!bookId) return
    
    // Wait until auth state is resolved
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    // If the logged user is admin, redirect to admin panel
    if (isAdmin(user.tipoUsuario)) {
      router.push("/admin")
      return
    }

    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${bookId}`)
        if (!response.ok) {
          console.error("Failed to fetch book")
          router.push("/user/my-books")
          return
        }
        const book = await response.json()
        
        // Verificar que el libro pertenece al usuario
        const uid = (user as any).idUsuario ?? (user as any).idusuario
        const bookOwnerId = book.idusuario ?? book.idUsuario
        
        if (bookOwnerId !== uid) {
          console.error("User does not own this book")
          router.push("/user/my-books")
          return
        }

        setFormData({
          titulo: book.titulo || "",
          autor: book.autor || "",
          anio: book.anio || new Date().getFullYear(),
          genero: book.genero || "",
          editorial: book.editorial || "",
          descripcion: book.descripcion || "",
          estado: book.estado || "disponible",
        })
      } catch (error) {
        console.error("Error fetching book:", error)
        router.push("/user/my-books")
      } finally {
        setLoadingBook(false)
      }
    }

    fetchBook()
  }, [user, loading, router, bookId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bookId) {
      console.error("Missing book id")
      return
    }
    
    try {
      const uid = (user as any).idUsuario ?? (user as any).idusuario
      if (!uid) {
        console.error("Missing user id, cannot update book", user)
        router.push("/login")
        return
      }

      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, idUsuario: uid }),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => "<no body>")
        console.error("Failed to update book", res.status, body)
        alert("Error al actualizar el libro")
        return
      }

      const updated = await res.json()
      console.log("Updated book:", updated)
      router.push("/user/my-books")
    } catch (err) {
      console.error("Error updating book:", err)
      alert("Error al actualizar el libro")
    }
  }

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

  if (loading || loadingBook) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar userName={user.nombre} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Editar Libro</CardTitle>
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
                  <label className="text-sm font-medium">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    required
                  >
                    <option value="disponible">Disponible</option>
                    <option value="intercambiado">Intercambiado</option>
                    <option value="prestado">Prestado</option>
                  </select>
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

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Guardar Cambios
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/user/my-books")} className="flex-1">
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
