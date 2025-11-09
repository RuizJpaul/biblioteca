"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"
import { useAuth } from "@/hooks/use-auth"

interface User {
  idUsuario: number
  nombre: string
  apellido: string
  email: string
  tipoUsuario: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState({ users: 0, books: 0, exchanges: 0 })
  const [recentBooks, setRecentBooks] = useState<any[]>([])
  const [recentExchanges, setRecentExchanges] = useState<any[]>([])

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin(user.tipoUsuario)) {
        router.push("/")
        return
      }
      // Fetch admin stats once authenticated
      ;(async () => {
        try {
          const res = await fetch("/api/admin/stats")
          if (!res.ok) throw new Error("Failed to fetch stats")
          const data = await res.json()
          setStats({ users: data.users || 0, books: data.books || 0, exchanges: data.exchanges || 0 })
          setRecentBooks(data.recentBooks || [])
          setRecentExchanges(data.recentExchanges || [])
        } catch (err) {
          console.error("Error loading admin stats:", err)
        }
      })()
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar userName={user.nombre} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary mb-4">{stats.users}</p>
              <Link href="/admin/users">
                <Button className="w-full">Ver Usuarios</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Libros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent mb-4">{stats.books}</p>
              <Link href="/admin/books">
                <Button className="w-full">Ver Libros</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intercambios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary mb-4">{stats.exchanges}</p>
              <Button variant="outline" className="w-full bg-transparent">
                Ver Actividad
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Actividades</CardTitle>
            <CardDescription>Actividad reciente en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBooks.length === 0 && recentExchanges.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
              )}

              {recentBooks.map((b, i) => (
                <div key={`book-${b.idLibro}-${i}`} className="flex justify-between items-center pb-4 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{b.titulo}</p>
                    <p className="text-sm text-muted-foreground">Nuevo libro agregado por ID usuario {b.idusuario ?? b.idUsuario}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(b.fecha_creacion || b.fecha_creacion).toLocaleString()}</p>
                </div>
              ))}

              {recentExchanges.map((ex, i) => (
                <div key={`ex-${ex.idIntercambio}-${i}`} className="flex justify-between items-center pb-4 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">Intercambio #{ex.idintercambio ?? ex.idIntercambio}</p>
                    <p className="text-sm text-muted-foreground">Estado: {ex.estado}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(ex.fecha).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
