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
import { ExchangeModal } from "@/components/exchange-modal"
import { useSession } from "next-auth/react"

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
  anio?: number
  usuario_nombre?: string
}

export default function UserBooksPage() {
  const { data: session } = useSession()
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

  // --- Cargar libros del servidor (catálogo + mis libros cuando estoy autenticado)
  useEffect(() => {
    if (!user) return
    const fetchBooks = async () => {
      try {
        // Pedir el catálogo; el endpoint /api/books devuelve disponibles + mis libros si hay cookie
        const response = await fetch(`/api/books`, {
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        })
        if (!response.ok) throw new Error("Failed to fetch books")
        const data = await response.json()

        const normalized = (Array.isArray(data) ? data : []).map((b: any) => ({
          idLibro: b.idLibro ?? b.idlibro ?? b.id,
          titulo: b.titulo ?? "",
          autor: b.autor ?? "",
          genero: b.genero ?? "",
          img_url: b.img_url,
          estado: b.estado ?? "disponible",
          idUsuario: b.idUsuario ?? b.idusuario ?? null,
          nombre: b.usuario_nombre ?? b.nombre ?? "",
          apellido: b.usuario_apellido ?? b.apellido ?? "",
          descripcion: b.descripcion ?? "",
        }))

        setBooks(normalized)
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
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book, index) => {
                const currentUid = user?.idUsuario ?? null
                const isOwn = !!currentUid && book.idUsuario === currentUid

                return (
                  <Card
                    key={`book-${book.idLibro ?? `${book.titulo}-${index}`}`}
                    className={`transition overflow-hidden ${isOwn ? "bg-muted/50 border-primary" : "hover:shadow-lg"}`}
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="h-40 bg-secondary/20 flex items-center justify-center relative overflow-hidden">
                      {book.img_url ? (
                        <Image src={book.img_url || "/placeholder.svg"} alt={book.titulo} fill className="object-cover" />
                      ) : (
                        <span className="text-5xl"></span>
                      )}

                      {book.estado === 'intercambiado' ? (
                        <div className="absolute inset-0 bg-muted/70 flex flex-col items-center justify-center">
                          <span className="bg-muted text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary mb-2">
                            Intercambiado
                          </span>
                          {isOwn && (
                            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mt-2">
                              Mi libro
                            </span>
                          )}
                        </div>
                      ) : (
                        isOwn && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                              Mi libro
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-lg mb-1">{book.titulo || "Título desconocido"}</h3>
                      <p className="text-sm text-muted-foreground">{book.autor}</p>
                      <p className="text-xs text-primary mt-2">{book.genero || "Sin género"}</p>
                      <p className="text-xs text-muted-foreground mt-2">Por: {book.nombre || book.usuario_nombre || "Usuario desconocido"}</p>
                      {book.anio && <p className="text-xs text-muted-foreground">Año: {book.anio}</p>}
                      {!isOwn && (
                        <Button className="w-full mt-4" onClick={() => setSelectedBook(book)} disabled={book.estado === 'intercambiado'}>
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
          </div>

          {/* Modal de detalle / Proponer intercambio */}
          {selectedBook && user && (
            <ExchangeModal
              bookId={selectedBook.idLibro!}
              bookTitle={selectedBook.titulo}
              bookAuthor={selectedBook.autor}
              userName={selectedBook.nombre || 'Usuario'}
              userId={selectedBook.idUsuario || 0}
              onClose={() => setSelectedBook(null)}
              onPropose={async (myBookId) => {
                try {
                  const response = await fetch('/api/intercambios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      libro_ofrecido_id: myBookId,
                      libro_recibido_id: selectedBook.idLibro,
                      usuario_origen_id: user.idUsuario,
                      usuario_destino_id: selectedBook.idUsuario || 0,
                    }),
                  })

                  if (response.ok) {
                    alert('¡Intercambio propuesto exitosamente!')
                    setSelectedBook(null)
                  } else {
                    const error = await response.json().catch(() => ({ error: 'Error' }))
                    alert(error.error || 'Error al proponer el intercambio')
                  }
                } catch (err) {
                  console.error('Error:', err)
                  alert('Error al proponer el intercambio')
                }
              }}
            />
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
