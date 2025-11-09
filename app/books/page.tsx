"use client"

import { PublicNavbar } from "@/components/public-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ExchangeModal } from "@/components/exchange-modal"

interface Book {
  idLibro?: number // opcional, por si viene undefined
  titulo: string
  autor: string
  genero: string
  img_url: string
  usuario_nombre: string
  descripcion: string
  anio?: number
  idUsuario?: number
  // posible idusuario en minúscula si viene así
  idusuario?: number
}

export default function BooksPage() {
  const auth = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("Todos")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books")
        const data = await response.json()
        // normalize rows: ensure idLibro and idUsuario exist
        const normalized = (Array.isArray(data) ? data : []).map((b: any, idx: number) => ({
          ...b,
          idLibro: b.idLibro ?? b.idlibro ?? b.id ?? idx,
          idUsuario: b.idUsuario ?? b.idusuario ?? b.userid ?? null,
        }))
        setBooks(normalized)
      } catch (error) {
        console.error("Error fetching books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  // Filtro de libros según búsqueda y género
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.titulo?.toLowerCase().includes(search.toLowerCase())
    const matchesGenre = selectedGenre === "Todos" || book.genero === selectedGenre
    return matchesSearch && matchesGenre
  })

  // Lista única de géneros
  const genres = [
    "Todos",
    ...Array.from(
      new Set(books.map((b) => (b.genero ? b.genero.trim() : "Sin género")))
    ),
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold mb-8">Catálogo de Libros</h1>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando libros...</p>
            </div>
          ) : (
            <>
              {/* 🔍 Buscador y géneros */}
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
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 📚 Lista de libros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book, index) => {
                    const currentUid = (auth.user as any)?.idUsuario ?? (auth.user as any)?.idusuario ?? null
                    const isOwn = !!currentUid && (book.idUsuario === currentUid || book.idusuario === currentUid)

                    return (
                      <Card
                        key={`book-${book.idLibro ?? index}`}
                        className={`transition overflow-hidden ${isOwn ? "bg-muted/50 border-primary" : "hover:shadow-lg"}`}
                      >
                        <div className="h-40 bg-secondary/20 flex items-center justify-center relative">
                          {book.img_url ? (
                            <img
                              src={book.img_url || "/placeholder.svg"}
                              alt={book.titulo || "Libro sin título"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl">📖</span>
                          )}

                          {isOwn && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                                Mi libro
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="pt-4">
                          <h3 className="font-semibold text-lg mb-1">
                            {book.titulo || "Título desconocido"}
                          </h3>
                          <p className="text-sm text-muted-foreground">{book.autor}</p>
                          <p className="text-xs text-primary mt-2">{book.genero || "Sin género"}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Por: {book.usuario_nombre || "Usuario desconocido"}
                          </p>
                          {book.anio && (
                            <p className="text-xs text-muted-foreground">Año: {book.anio}</p>
                          )}
                          {!isOwn && (
                            <Button
                              className="w-full mt-4"
                              onClick={() => setSelectedBook(book)}
                            >
                              Proponer Intercambio
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No se encontraron libros</p>
                  </div>
                )}

                {selectedBook && auth.user && (
                  <ExchangeModal
                    bookId={selectedBook.idLibro!}
                    bookTitle={selectedBook.titulo}
                    bookAuthor={selectedBook.autor}
                    userName={selectedBook.usuario_nombre}
                    userId={selectedBook.idUsuario || selectedBook.idusuario || 0}
                    onClose={() => setSelectedBook(null)}
                    onPropose={async (myBookId) => {
                      try {
                        const response = await fetch("/api/intercambios", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            libro_ofrecido_id: myBookId,
                            libro_recibido_id: selectedBook.idLibro,
                            usuario_origen_id: (auth.user as any)?.idUsuario,
                            usuario_destino_id: selectedBook.idUsuario || selectedBook.idusuario || 0
                          })
                        })

                        if (response.ok) {
                          alert("¡Intercambio propuesto exitosamente!")
                          setSelectedBook(null)
                        } else {
                          const error = await response.json()
                          alert(error.error || "Error al proponer el intercambio")
                        }
                      } catch (error) {
                        console.error("Error:", error)
                        alert("Error al proponer el intercambio")
                      }
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
