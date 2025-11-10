"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, MapPin, Check } from "lucide-react"

interface DeliveryLocation {
  idPuntoEntrega: number
  nombre: string
  direccion: string
  ciudad: string
  provincia: string
  codigo_postal: string
  referencia: string
  es_predeterminado: boolean
}

interface DeliveryLocationsFormProps {
  userId: number
}

export function DeliveryLocationsForm({ userId }: DeliveryLocationsFormProps) {
  const [locations, setLocations] = useState<DeliveryLocation[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    referencia: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId && !isNaN(userId)) {
      fetchLocations()
    }
  }, [userId])

  const fetchLocations = async () => {
    try {
      if (!userId || isNaN(userId)) {
        console.warn('Invalid userId:', userId)
        setLocations([])
        return
      }

      const res = await fetch(`/api/puntos-entrega?userId=${userId}`)
      if (!res.ok) {
        const body = await res.text().catch(() => "<no body>")
        console.error("Error fetching locations, non-ok response:", res.status, body)
        setLocations([])
        return
      }

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        const text = await res.text().catch(() => "<no body>")
        console.error("Expected JSON from /api/puntos-entrega but got:", text)
        setLocations([])
        return
      }

      const data = await res.json()
      setLocations(data)
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/puntos-entrega", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: userId, ...formData }),
      })
      if (res.ok) {
        setFormData({
          nombre: "",
          direccion: "",
          ciudad: "",
          provincia: "",
          codigo_postal: "",
          referencia: "",
        })
        setIsAddingNew(false)
        fetchLocations()
      }
    } catch (error) {
      console.error("Error adding location:", error)
    }
    setLoading(false)
  }

  const handleSetDefault = async (id: number) => {
    try {
      const location = locations.find((l) => l.idPuntoEntrega === id)!
      await fetch(`/api/puntos-entrega/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...location, es_predeterminado: true }),
      })
      fetchLocations()
    } catch (error) {
      console.error("Error setting default:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/puntos-entrega/${id}`, { method: "DELETE" })
      fetchLocations()
    } catch (error) {
      console.error("Error deleting location:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Puntos de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {locations.map((location) => (
          <div key={location.idPuntoEntrega} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold">{location.nombre}</p>
                <p className="text-sm text-muted-foreground">{location.direccion}</p>
                <p className="text-sm text-muted-foreground">
                  {location.ciudad}, {location.provincia} {location.codigo_postal}
                </p>
                {location.referencia && <p className="text-xs text-primary mt-1">{location.referencia}</p>}
              </div>
              <div className="flex gap-1">
                {!location.es_predeterminado && (
                  <Button size="sm" variant="outline" onClick={() => handleSetDefault(location.idPuntoEntrega)}>
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                {location.es_predeterminado && (
                  <div className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded">
                    Predeterminado
                  </div>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDelete(location.idPuntoEntrega)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {isAddingNew && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
            <Input
              placeholder="Nombre del punto (ej: Casa, Trabajo)"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
            <Input placeholder="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
              <Input placeholder="Provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
            </div>
            <Input
              placeholder="Código postal"
              name="codigo_postal"
              value={formData.codigo_postal}
              onChange={handleChange}
            />
            <Input
              placeholder="Referencia (ej: puerta azul, piso 3)"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading} className="flex-1">
                Guardar
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNew(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!isAddingNew && (
          <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
            + Agregar Punto de Entrega
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
