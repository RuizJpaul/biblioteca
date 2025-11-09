"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface UserNavbarProps {
  userName: string
}

export function UserNavbar({ userName }: UserNavbarProps) {
  const router = useRouter()

  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    try {
      router.replace("/login")
    } catch (e) {
      // ignore
    }
    try {
      window.location.replace("/login")
    } catch (e) {
      // ignore
    }
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/user" className="flex items-center gap-2">
            <span className="font-bold text-lg hidden sm:inline">BOOKING</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/user" className="text-foreground hover:text-primary transition">
              Inicio
            </Link>
            <Link href="/user/books" className="text-foreground hover:text-primary transition">
              Libros
            </Link>
            <Link href="/user/my-books" className="text-foreground hover:text-primary transition">
              Mis Libros
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/user/profile">
              <Button variant="ghost" size="sm">
                Perfil
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
