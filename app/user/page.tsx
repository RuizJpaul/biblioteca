"use client"

import { UserNavbar } from "@/components/user-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"
import { useSession } from "next-auth/react"

interface User {
  idUsuario: number
  nombre: string
  apellido: string
  email: string
  tipoUsuario: string
}
export default function UserPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [myBooksCount, setMyBooksCount] = useState<number | null>(null)
  const [myExchangesCount, setMyExchangesCount] = useState<number | null>(null)
  const [totalBooks, setTotalBooks] = useState<number | null>(null)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if ((session?.user as any)?.notRegistered) {
      // Si el usuario viene de Google, redirige a /register-google
      if ((session?.user as any)?.email && !(session?.user as any)?.password) {
        router.push("/register-google")
        return
      }
      alert("Usted no ha sido registrado. Por favor contacte al administrador.")
      setBlocked(true)
      router.push("/login")
    }
  }, [session, router])

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
            // Notificación si hay intercambios pendientes donde el usuario es destino
            const pendientes = Array.isArray(ex)
              ? ex.filter((e) => e.estado === "pendiente" && e.usuario_destino_id === user.idUsuario)
              : [];
            if (pendientes.length > 0) {
              toast({
                title: "Tienes propuestas de intercambio",
                description: `Tienes ${pendientes.length} intercambio(s) pendiente(s) por revisar.`,
              })
            }
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
  }, [user, toast])

  if (blocked) {
    return <div />
  }

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
                <Link href="/user/my-books" className="w-full" passHref>
                  <Button className="w-full" asChild>
                    <span>Ver Mis Libros</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Intercambios</p>
                <p className="text-3xl font-bold text-accent mb-4">{myExchangesCount ?? "—"}</p>
                <Link href="/user/exchanges" className="w-full" passHref>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <span>Ver Historial</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Libros Disponibles</p>
                <p className="text-3xl font-bold mb-4">{totalBooks ?? "—"}</p>
                <Link href="/user/books" className="w-full" passHref>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <span>Explorar</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Consultar Puntos de Entrega</h2>
                <p className="text-muted-foreground mb-4">Visualiza los puntos de entrega disponibles para tus intercambios y libros.</p>
                <Link href="/user/delivery-locations" className="w-full" passHref>
                  <Button className="w-full" asChild>
                    <span>Ver Puntos de Entrega</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
