"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">

            <span className="font-bold text-lg hidden sm:inline text-foreground">BOOKING</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Inicio
            </Link>
            <Link href="/books" className="text-foreground hover:text-primary transition">
              Libros
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition">
              Nosotros
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Ingresar</Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white transition-colors"
              >
                Unirse
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-foreground hover:bg-muted rounded">
              Inicio
            </Link>
            <Link href="/books" className="block px-4 py-2 text-foreground hover:bg-muted rounded">
              Libros
            </Link>
            <Link href="/about" className="block px-4 py-2 text-foreground hover:bg-muted rounded">
              Nosotros
            </Link>
            <div className="flex gap-2 px-4 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="ghost" className="w-full">
                  Ingresar
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full">Unirse</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
