"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useSession, signOut } from "next-auth/react"

interface UserNavbarProps {
  userName: string
}

export function UserNavbar({ userName }: UserNavbarProps) {
  const router = useRouter()
  const { data: session, status } = useSession()

  if ((session?.user as any)?.notRegistered) {
    return null
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  const user = session?.user || null

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/user" className="flex items-center gap-2">
            <span className="font-bold text-lg hidden sm:inline">BOOKING</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/user" className="text-foreground hover:text-primary transition">
              Mi Panel
            </Link>
            <Link href="/user/profile" className="text-foreground hover:text-primary transition">
              Perfil
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                {user.image && (
                  <img src={user.image} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                )}
                <span className="font-medium text-foreground mr-2">{user.name || user.email}</span>
              </>
            )}
            <Button variant="ghost" onClick={handleLogout}>Cerrar sesión</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
