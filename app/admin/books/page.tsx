"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"
import { Input } from "@/components/ui/input"

interface Book {
  idLibro: number
  titulo: string
  autor: string
  genero: string
  editorial?: string
  estado: string
  idUsuario: number
}

export default function AdminBooksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user")
      if (stored) {
        const userData = JSON.parse(stored)
        if (!isAdmin(userData.tipoUsuario)) {
          router.push("/")
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
      if (!isAdmin(userData.tipoUsuario)) {
        router.push("/")
        return
      }
      setUser(userData)
    } catch (e) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books")
        if (!response.ok) throw new Error("Failed to fetch books")
        const data = await response.json()
        setBooks(data)
      } catch (error) {
        console.error("[v0] Error fetching books:", error)
      } finally {
        setLoading(false)
      }
    }
    if (isAdmin(user?.tipoUsuario)) {
      fetchBooks()
    }
  }, [user])

  const filteredBooks = books.filter(
    (b) =>
      b.titulo.toLowerCase().includes(search.toLowerCase()) || b.autor.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async (bookId: number) => {
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete book")
      setBooks(books.filter((b) => b.idLibro !== bookId))
      setSelectedBook(null)
    } catch (error) {
      console.error("[v0] Error deleting book:", error)
    }
  }

  const handleSaveEdit = async () => {
    if (editingBook) {
      try {
        const response = await fetch(`/api/books/${editingBook.idLibro}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBook),
        })
        if (!response.ok) throw new Error("Failed to update book")
        setBooks(books.map((b) => (b.idLibro === editingBook.idLibro ? editingBook : b)))
        setEditingBook(null)
        setSelectedBook(editingBook)
      } catch (error) {
        console.error("[v0] Error updating book:", error)
      }
    }
  }

  if (!user) return <div className="flex items-center justify-center h-screen">Cargando...</div>
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando libros...</div>

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar userName={user.nombre} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de Libros</h1>

        <div className="mb-6">
          <Input
            placeholder="Buscar por título o autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-fit max-h-96 overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">Libros ({filteredBooks.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredBooks.map((b, idx) => (
                  <button
                    key={b.idLibro ?? `book-${idx}`}
                    onClick={() => {
                      setSelectedBook(b)
                      setEditingBook(null)
                    }}
                    className={`w-full text-left p-3 rounded border-2 transition ${
                      selectedBook?.idLibro === b.idLibro
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <p className="font-medium text-sm">{b.titulo}</p>
                    <p className="text-xs text-muted-foreground">{b.autor}</p>
                    <p className="text-xs text-accent mt-1">{b.estado}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedBook && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingBook ? "Editar Libro" : "Detalles del Libro"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingBook ? (
                    <>
                      <div>
                        <label className="text-sm font-medium">Título</label>
                        <Input
                          value={editingBook.titulo}
                          onChange={(e) => setEditingBook({ ...editingBook, titulo: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Autor</label>
                        <Input
                          value={editingBook.autor}
                          onChange={(e) => setEditingBook({ ...editingBook, autor: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Estado</label>
                        <select
                          value={editingBook.estado}
                          onChange={(e) => setEditingBook({ ...editingBook, estado: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-md"
                        >
                          <option>disponible</option>
                          <option>intercambiado</option>
                          <option>prestado</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveEdit} className="flex-1">
                          Guardar
                        </Button>
                        <Button variant="outline" onClick={() => setEditingBook(null)} className="flex-1">
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Autor</p>
                        <p className="font-medium">{selectedBook.autor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Género</p>
                        <p className="font-medium">{selectedBook.genero}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Editorial</p>
                        <p className="font-medium">{selectedBook.editorial || "No especificada"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <p
                          className={`font-medium ${
                            selectedBook.estado === "disponible"
                              ? "text-green-600"
                              : selectedBook.estado === "intercambiado"
                                ? "text-orange-600"
                                : "text-blue-600"
                          }`}
                        >
                          {selectedBook.estado}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={() => setEditingBook(selectedBook)} className="flex-1">
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(selectedBook.idLibro)}
                          className="flex-1"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
