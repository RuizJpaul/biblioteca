"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AdminNavbarProps {
  userName: string
}

export function AdminNavbar({ userName }: AdminNavbarProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    // Use replace + location.replace to avoid leaving a cached admin page in history
    logout()
    try {
      router.replace("/login")
    } catch (e) {
      // ignore
    }
    // Force a full navigation to clear any cached page
    try {
      window.location.replace("/login")
    } catch (e) {
      // ignore (SSR/test environments)
    }
  }

  return (
    <nav className="bg-primary border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold">⚙️</span>
            </div>
            <span className="font-bold text-lg text-primary-foreground">Admin</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/admin" className="text-primary-foreground hover:opacity-80 transition">
              Inicio
            </Link>
            <Link href="/admin/users" className="text-primary-foreground hover:opacity-80 transition">
              Usuarios
            </Link>
            <Link href="/admin/books" className="text-primary-foreground hover:opacity-80 transition">
              Libros
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-primary-foreground text-sm">{userName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
