"use client"

import { UserNavbar } from "@/components/user-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"

interface MyBook {
  idLibro: number
  titulo: string
  autor: string
  genero: string
  img_url?: string
  estado: string
  idUsuario: number
}

export default function MyBooksPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [books, setBooks] = useState<MyBook[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [selectedBook, setSelectedBook] = useState<MyBook | null>(null)

  useEffect(() => {
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

    const fetchBooks = async () => {
      try {
        const uid = (user as any).idUsuario ?? (user as any).idusuario
        if (!uid) {
          console.error('[v0] Missing idUsuario on user object', user)
          setLoadingBooks(false)
          return
        }

        const url = `/api/users/${uid}/books`
        console.debug('[v0] Fetching user books url=', url, 'uid=', uid)
        const response = await fetch(url)
        console.debug('[v0] Fetch response status=', response.status, 'ok=', response.ok, 'content-type=', response.headers.get('content-type'))
        if (!response.ok) {
          const body = await response.text().catch(() => "<no body>")
          // Log richer, single-line message so it appears clearly in Next/Browser console
          console.error(`[v0] Fetch ${url} failed status=${response.status} body=${body || '<empty>'}`)
          // If unauthorized, force login
          if (response.status === 401) {
            router.push("/login")
            return
          }
          // If the server says invalid id or not found, treat as "no books"
          if (response.status === 400 || response.status === 404) {
            setBooks([])
            return
          }
          throw new Error("Failed to fetch books")
        }
        const data = await response.json()
        console.debug('[v0] Parsed books data count=', Array.isArray(data) ? data.length : 'not-array', data)
        // Normalize rows to ensure idLibro/idUsuario exist for keys and actions
        const normalized = (Array.isArray(data) ? data : []).map((b: any, idx: number) => ({
          ...b,
          idLibro: b.idLibro ?? b.idlibro ?? b.id ?? idx,
          idUsuario: b.idUsuario ?? b.idusuario ?? b.userid ?? null,
        }))
        setBooks(normalized)
      } catch (error) {
        console.error("[v0] Error fetching user books:", error)
      } finally {
        setLoadingBooks(false)
      }
    }

    fetchBooks()
  }, [user, loading, router])

  const handleDelete = async (bookId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este libro? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const uid = (user as any).idUsuario ?? (user as any).idusuario
      if (!uid) {
        console.error("Missing user id, cannot delete book")
        return
      }

      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: uid }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        alert(`Error al eliminar el libro: ${errorData.error}`)
        throw new Error("Failed to delete book")
      }
      
      setBooks(books.filter((b) => b.idLibro !== bookId))
      setSelectedBook(null)
      alert("Libro eliminado exitosamente")
    } catch (error) {
      console.error("[v0] Error deleting book:", error)
    }
  }

  const handleEdit = (bookId: number) => {
    router.push(`/user/my-books/edit/${bookId}`)
  }

  if (!user) return <div className="flex items-center justify-center h-screen">Cargando...</div>
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando libros...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar userName={user.nombre} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Mis Libros</h1>
            <Link href="/user/my-books/add">
              <Button>Agregar Libro</Button>
            </Link>
          </div>

          {books.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <p className="text-muted-foreground mb-4">Aún no has subido libros</p>
                <Link href="/user/my-books/add">
                  <Button>Agregar mi Primer Libro</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, idx) => (
                <Card
                  key={book.idLibro ?? `book-${idx}`}
                  className="hover:shadow-lg transition overflow-hidden cursor-pointer"
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="h-40 bg-secondary/20 flex items-center justify-center text-5xl relative overflow-hidden">
                    {book.img_url ? (
                      <Image src={book.img_url || "/placeholder.svg"} alt={book.titulo} fill className="object-cover" />
                    ) : (
                      <span>📖</span>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-1">{book.titulo}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{book.autor}</p>
                    <p className="text-xs text-primary mb-3">{book.genero}</p>
                    <p
                      className={`text-xs font-medium mb-4 ${
                        book.estado === "disponible" ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      {book.estado}
                    </p>
                    <Button size="sm" className="w-full">
                      Ver
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
                  <p
                    className={`text-sm font-semibold mb-4 ${
                      selectedBook.estado === "disponible" ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    Estado: {selectedBook.estado}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(selectedBook.idLibro)} className="flex-1">
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(selectedBook.idLibro)} className="flex-1">
                      Eliminar
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedBook(null)} className="w-full mt-2">
                    Cerrar
                  </Button>
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
