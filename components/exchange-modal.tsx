"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"

interface Book {
  idLibro: number
  titulo: string
  autor: string
  descripcion?: string
  anio?: number
}

interface ExchangeModalProps {
  bookId: number
  bookTitle: string
  bookAuthor: string
  userName: string
  userId: number
  userDeliveryLocation?: string
  onClose: () => void
  onPropose: (bookId: number) => void
}

export function ExchangeModal({
  bookId,
  bookTitle,
  bookAuthor,
  userName,
  userId,
  userDeliveryLocation,
  onClose,
  onPropose,
}: ExchangeModalProps) {
  const [selectedBook, setSelectedBook] = useState<string>("")
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        let stored = null
        try {
          stored = localStorage.getItem("auth_user")
        } catch (e) {}

        let uid: number | null = null
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            uid = parsed?.idUsuario || parsed?.id || null
          } catch (e) {}
        }
        if (!uid) {
          try {
            const cookie = document.cookie.split('; ').find(c => c.startsWith('auth='))
            if (cookie) {
              const decoded = JSON.parse(Buffer.from(cookie.split('=')[1], 'base64').toString())
              uid = decoded?.idUsuario || decoded?.id || null
            }
          } catch (e) {}
        }
        if (!uid) {
          console.warn('ExchangeModal: usuario no autenticado, no se cargarán libros propios')
          setMyBooks([])
          setLoading(false)
          return
        }
        const response = await fetch(`/api/users/${uid}/books`, { credentials: 'include' })
        if (!response.ok) throw new Error("Error al obtener los libros")
        const data = await response.json()
        console.log('[ExchangeModal] Libros recibidos del backend:', data)
        // Normalizar idLibro
        const normalizedBooks = data.map((book: any) => ({
          ...book,
          idLibro: book.idLibro ?? book.idlibro
        }))
        const availableBooks = normalizedBooks.filter((book: Book) => book.idLibro !== bookId && typeof book.idLibro === 'number' && book.idLibro > 0)
        console.log('[ExchangeModal] Libros propios filtrados para ofrecer:', availableBooks)
        setMyBooks(availableBooks)
      } catch (error) {
        console.error("Error fetching books for exchange modal:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMyBooks()
  }, [bookId])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Proponer Intercambio</h2>
            <div className="bg-muted p-3 rounded mb-4">
              <p className="text-xs text-muted-foreground">Libro que deseas</p>
              <p className="font-semibold">{bookTitle}</p>
              <p className="text-sm text-muted-foreground">{bookAuthor}</p>
              <p className="text-xs text-primary mt-1">De: {userName}</p>
              {userDeliveryLocation && (
                <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                  <p>{userDeliveryLocation}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Selecciona un libro tuyo para ofrecer</p>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando tus libros...</p>
            ) : myBooks.length > 0 ? (
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md mb-4"
              >
                <option key="empty" value="">Selecciona un libro</option>
                {myBooks.map((book, idx) => (
                  <option key={`mybook-${book.idLibro ?? idx}`} value={String(book.idLibro)}>
                    {book.titulo} - {book.autor}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">No tienes libros disponibles para intercambiar</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                const id = Number(selectedBook);
                if (!isNaN(id) && id > 0) {
                  onPropose(id);
                } else {
                  // Si el valor no es válido, no llamar a onPropose
                  alert("Selecciona un libro válido para ofrecer.");
                }
              }} 
              disabled={selectedBook === ""} 
              className="flex-1"
            >
              Proponer Intercambio
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
