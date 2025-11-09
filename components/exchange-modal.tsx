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
  const [selectedBook, setSelectedBook] = useState<number | null>(null)
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        // Obtener el ID del usuario logueado
        const auth = JSON.parse(localStorage.getItem("auth") || "{}")
        if (!auth.user?.idUsuario) {
          console.error("Usuario no autenticado")
          return
        }

        const response = await fetch(`/api/users/${auth.user.idUsuario}/books`)
        if (!response.ok) throw new Error("Error al obtener los libros")
        
        const data = await response.json()
        // Filtra el libro actual para que no se pueda seleccionar
        const availableBooks = data.filter((book: Book) => book.idLibro !== bookId)
        setMyBooks(availableBooks)
      } catch (error) {
        console.error("Error fetching books:", error)
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
                value={selectedBook || ""}
                onChange={(e) => setSelectedBook(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md mb-4"
              >
                <option value="">Selecciona un libro</option>
                {myBooks.map((book) => (
                  <option key={book.idLibro} value={book.idLibro}>
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
              onClick={() => selectedBook && onPropose(selectedBook)} 
              disabled={!selectedBook} 
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
