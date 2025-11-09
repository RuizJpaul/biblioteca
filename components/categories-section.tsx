"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface Cat {
  genero: string
  count: number
}

export function CategoriesSection() {
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/public/stats")
        if (!res.ok) throw new Error("Failed to fetch categories")
        const data = await res.json()
        if (!mounted) return
        setCats((data.booksByCategory || []).map((c: any) => ({ genero: c.genero || "Sin género", count: Number(c.count || 0) })))
      } catch (err) {
        console.error("Error loading categories:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchCats()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Categorías Más Buscadas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground">Cargando categorías...</p>
          ) : cats.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">No hay categorías disponibles</p>
          ) : (
            cats.map((category) => (
              <Card key={category.genero} className="hover:shadow-lg transition cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl mb-2"></p>
                  <p className="font-semibold text-sm">{category.genero}</p>
                  <p className="text-xs text-muted-foreground mt-1">{category.count} libros</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
