"use client"

import { UserNavbar } from "@/components/user-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"
import Image from "next/image"

interface Book {
  idLibro?: number
  titulo: string
  autor: string
  genero: string
  img_url?: string
  estado: string
  idUsuario: number
  nombre?: string
  apellido?: string
}

export default function UserBooksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("Todos")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  // --- Validación de usuario y redirección
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
    } catch {}

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
    } catch {
      router.push("/login")
    }
  }, [router])

  // --- Cargar libros del servidor
  useEffect(() => {
    if (!user) return
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books")
        if (!response.ok) throw new Error("Failed to fetch books")
        const data = await response.json()
        setBooks(data)
      } catch (error) {
        console.error("Error fetching books:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [user])

  const genres = ["Todos", ...new Set(books.map((b) => b.genero))]
  const filteredBooks = books.filter((b) => {
    const matchSearch = b.titulo.toLowerCase().includes(search.toLowerCase())
    const matchGenre = selectedGenre === "Todos" || b.genero === selectedGenre
    return matchSearch && matchGenre
  })

  if (!user) return <div className="flex items-center justify-center h-screen">Cargando...</div>
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando libros...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar userName={user.nombre} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6">Catálogo de Libros</h1>

          {/* Buscador y Filtros */}
          <div className="mb-8 space-y-4">
            <Input
              placeholder="Buscar libros..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <div className="flex gap-2 flex-wrap">
              {genres.map((genre) => (
                <Button
                  key={`genre-${genre}`}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  onClick={() => setSelectedGenre(genre)}
                  size="sm"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {/* Listado de libros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => (
              <Card
                key={`book-${book.idLibro ?? `${book.titulo}-${index}`}`}
                className="hover:shadow-lg transition overflow-hidden cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                <div className="h-40 bg-secondary/20 flex items-center justify-center text-5xl relative overflow-hidden">
                  {book.img_url ? (
                    <Image
                      src={book.img_url || "/placeholder.svg"}
                      alt={book.titulo}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>📖</span>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-1 truncate">{book.titulo}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{book.autor}</p>
                  <p className="text-xs text-primary mb-2">{book.genero}</p>
                  <Button size="sm" className="w-full">
                    Ver
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Modal de detalle */}
          {selectedBook && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedBook(null)}
            >
              <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <CardContent className="pt-6">
                  <div className="h-48 bg-secondary/20 flex items-center justify-center text-6xl mb-4 rounded relative overflow-hidden">
                    {selectedBook.img_url ? (
                      <Image
                        src={selectedBook.img_url || "/placeholder.svg"}
                        alt={selectedBook.titulo}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>📖</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedBook.titulo}</h2>
                  <p className="text-muted-foreground mb-1">{selectedBook.autor}</p>
                  <p className="text-sm text-primary mb-4">{selectedBook.genero}</p>
                  <div className="flex gap-2">
                    <Button className="flex-1">Intercambiar</Button>
                    <Button variant="outline" onClick={() => setSelectedBook(null)} className="flex-1">
                      Cerrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
