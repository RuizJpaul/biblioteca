"use client"

import { PublicNavbar } from "@/components/public-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ExchangeModal } from "@/components/exchange-modal"

interface Book {
  idLibro?: number
  titulo: string
  autor: string
  genero: string
  img_url?: string
  usuario_nombre?: string
  usuario_apellido?: string
  descripcion?: string
  anio?: number
  idUsuario?: number
  estado?: string
}
export default function BooksPage() {
  const auth = useAuth()
  const { toast } = useToast()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("Todos")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books", {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Fetched data:', data) // Para depuración
        
        if (!Array.isArray(data)) {
          console.error('Data is not an array:', data)
          setBooks([])
          return
        }
        
        // normalize rows
        const normalized = data.map((b: any) => ({
          idLibro: b.idlibro || b.idLibro,
          titulo: b.titulo || '',
          autor: b.autor || '',
          genero: b.genero || 'Sin género',
          img_url: b.img_url,
          estado: b.estado || 'disponible',
          idUsuario: b.idusuario || b.idUsuario,
          usuario_nombre: b.usuario_nombre || 'Usuario',
          usuario_apellido: b.usuario_apellido || '',
          descripcion: b.descripcion || ''
        } as Book))
        
        console.log('Normalized books:', normalized) // Para depuración
        setBooks(normalized)
      } catch (error) {
        console.error("Error fetching books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  useEffect(() => {
    if (!auth.user) {
      setSelectedBook(null)
    }
  }, [auth.user])

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
                    const currentUid = auth.user && typeof auth.user.idUsuario === "number" ? auth.user.idUsuario : null;
                    const isOwn = !!currentUid && book.idUsuario === currentUid;

                    return (
                      <Card
                        key={`book-${book.idLibro ?? index}`}
                        className={`transition overflow-hidden ${isOwn ? "bg-gray-200 opacity-60 border border-gray-400" : "hover:shadow-lg"}`}
                      >
                        <div className="h-40 bg-secondary/20 flex items-center justify-center relative">
                          {book.img_url ? (
                            <img
                              src={book.img_url || "/placeholder.svg"}
                              alt={book.titulo || "Libro sin título"}
                              className="w-full h-full object-cover"
                              style={isOwn ? { filter: 'grayscale(1)', opacity: 0.6 } : {}}
                            />
                          ) : (
                            <span className="text-5xl"></span>
                          )}
                          {isOwn && auth.user ? (
                            <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
                              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">Tu Libro</span>
                            </div>
                          ) : null}
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
                          {isOwn && auth.user ? (
                            <div className="w-full mt-4 text-center text-blue-600 font-semibold">Tu Libro</div>
                          ) : null}
                          {!isOwn && auth.user ? (
                            <button
                              className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4"
                              onClick={() => setSelectedBook(book)}
                            >
                              Proponer Intercambio
                            </button>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
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
                    userName={selectedBook.usuario_nombre || 'Usuario'}
                    userId={selectedBook.idUsuario || 0}
                    onClose={() => setSelectedBook(null)}
                    onPropose={async (myBookId) => {
                      const origenId = (auth.user as any)?.idUsuario ?? (auth.user as any)?.idusuario ?? null;
                      const destinoId = selectedBook.idUsuario ?? null;
                      const libroRecibidoId = selectedBook.idLibro ?? null;
                      // Log para depuración
                      console.log('[Intercambio] Propuesta:', {
                        libro_ofrecido_id: myBookId,
                        libro_recibido_id: libroRecibidoId,
                        usuario_origen_id: origenId,
                        usuario_destino_id: destinoId,
                        selectedBook,
                        authUser: auth.user
                      });
                      if (!origenId || !destinoId || !libroRecibidoId || !myBookId) {
                        toast({
                          title: "Error al proponer intercambio",
                          description: "Faltan datos requeridos para la propuesta.",
                          variant: "destructive"
                        });
                        return;
                      }
                      const datos = {
                        libro_ofrecido_id: myBookId,
                        libro_recibido_id: libroRecibidoId,
                        usuario_origen_id: origenId,
                        usuario_destino_id: destinoId
                      };
                      console.log("[Intercambio] Enviando datos:", datos);
                      try {
                        const response = await fetch("/api/intercambios", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(datos)
                        });
                        if (response.ok) {
                          toast({
                            title: "Intercambio propuesto",
                            description: "Tu propuesta fue enviada exitosamente.",
                          });
                          setSelectedBook(null);
                        } else {
                          const error = await response.json();
                          console.error("[Intercambio] Error respuesta:", error);
                          toast({
                            title: "Error al proponer intercambio",
                            description: error.error || "Intenta nuevamente.",
                            variant: "destructive"
                          });
                        }
                      } catch (error) {
                        console.error("Error:", error);
                        toast({
                          title: "Error al proponer intercambio",
                          description: "Intenta nuevamente.",
                          variant: "destructive"
                        });
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
  );
}
