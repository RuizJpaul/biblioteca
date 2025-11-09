"use client"

import { UserNavbar } from "@/components/user-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"

interface User {
  idUsuario: number
  nombre: string
  apellido: string
  email: string
  tipoUsuario: string
}

export default function UserPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [myBooksCount, setMyBooksCount] = useState<number | null>(null)
  const [myExchangesCount, setMyExchangesCount] = useState<number | null>(null)
  const [totalBooks, setTotalBooks] = useState<number | null>(null)

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
        setLoading(false)
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
      if (isAdmin(userData.tipoUsuario)) {
        router.push("/admin")
        return
      }
      setUser(userData)
    } catch (e) {
      router.push("/login")
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      if (!user) return
      try {
        const [booksRes, exchangesRes, publicStatsRes] = await Promise.all([
          fetch(`/api/users/${user.idUsuario}/books`),
          fetch(`/api/users/${user.idUsuario}/exchanges`),
          fetch(`/api/public/stats`),
        ])

        if (mounted) {
          if (booksRes.ok) {
            const books = await booksRes.json()
            setMyBooksCount(Array.isArray(books) ? books.length : 0)
          }
          if (exchangesRes.ok) {
            const ex = await exchangesRes.json()
            setMyExchangesCount(Array.isArray(ex) ? ex.length : 0)
          }
          if (publicStatsRes.ok) {
            const pub = await publicStatsRes.json()
            setTotalBooks(typeof pub.books === "number" ? pub.books : Number(pub.books || 0))
          }
        }
      } catch (err) {
        console.error("Error loading user stats:", err)
      }
    }
    fetchStats()
    return () => {
      mounted = false
    }
  }, [user])

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar userName={user.nombre} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-2">Bienvenido, {user.nombre}</h1>
          <p className="text-muted-foreground mb-8">Tu espacio personal para intercambiar libros</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Mis Libros</p>
                <p className="text-3xl font-bold text-primary mb-4">{myBooksCount ?? "—"}</p>
                <Link href="/user/my-books">
                  <Button className="w-full">Ver Mis Libros</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Intercambios</p>
                <p className="text-3xl font-bold text-accent mb-4">{myExchangesCount ?? "—"}</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Historial
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Libros Disponibles</p>
                <p className="text-3xl font-bold mb-4">{totalBooks ?? "—"}</p>
                <Link href="/user/books">
                  <Button variant="outline" className="w-full bg-transparent">
                    Explorar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Guía Rápida</h2>
                <div className="space-y-3">
                  {[
                    { title: "Agregar un Libro", desc: "Sube tus libros a la plataforma" },
                    { title: "Buscar Libros", desc: "Explora el catálogo completo" },
                    { title: "Proponer Intercambio", desc: "Conecta con otros lectores" },
                  ].map((item, i) => (
                    <div key={i} className="pb-3 border-b border-border last:border-0">
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Recomendaciones</h2>
                <div className="space-y-3">
                  {[
                    { book: "Dune", user: "María" },
                    { book: "El Nombre del Viento", user: "Carlos" },
                    { book: "Proyecto Hail Mary", user: "Ana" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between pb-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-sm">{item.book}</p>
                        <p className="text-xs text-muted-foreground">De: {item.user}</p>
                      </div>
                      <Button size="sm">Ver</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
