"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export function StatsSection() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ books: 0, users: 0 })

  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/public/stats")
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        if (!mounted) return
        setStats({ books: data.books || 0, users: data.users || 0 })
      } catch (err) {
        console.error("Error loading public stats:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchStats()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="bg-secondary/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Nuestro Impacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{loading ? "—" : stats.books}</p>
                <p className="text-muted-foreground mt-2">Libros Registrados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-accent">{loading ? "—" : stats.users}</p>
                <p className="text-muted-foreground mt-2">Usuarios Activos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{loading ? "—" : "—"}</p>
                <p className="text-muted-foreground mt-2">Intercambios Realizados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
