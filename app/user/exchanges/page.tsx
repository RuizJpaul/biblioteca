"use client"
import { Tabs } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Exchange {
  idintercambio: number
  libro_ofrecido_id: number
  libro_recibido_id: number
  usuario_origen_id: number
  usuario_destino_id: number
  estado: string
  fecha: string
  libro_ofrecido_titulo?: string
  libro_recibido_titulo?: string
}

export default function UserExchangesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'enviados' | 'recibidos'>('recibidos')
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos')

  useEffect(() => {
    if (!user) return
    const fetchExchanges = async () => {
      try {
        const res = await fetch(`/api/users/${user.idUsuario}/exchanges`)
        if (!res.ok) throw new Error("Error al cargar intercambios")
        const data = await res.json()
        setExchanges(Array.isArray(data) ? data : [])
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los intercambios",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchExchanges()
  }, [user, toast])

  const handleUpdateEstado = async (id: number, estado: string) => {
    try {
      const res = await fetch(`/api/intercambios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado })
      })
      if (!res.ok) throw new Error("Error al actualizar estado")
      setExchanges(exchanges => exchanges.map(e => e.idintercambio === id ? { ...e, estado } : e))
      toast({
        title: "Intercambio actualizado",
        description: `Estado cambiado a ${estado}`
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      })
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Mis Intercambios</h1>
      <div className="mb-6 flex gap-4">
        <Button variant={tab === 'recibidos' ? 'default' : 'outline'} onClick={() => setTab('recibidos')}>Recibidos</Button>
        <Button variant={tab === 'enviados' ? 'default' : 'outline'} onClick={() => setTab('enviados')}>Enviados</Button>
        <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} className="ml-4 px-2 py-1 border rounded">
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptado">Aceptado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>
      {exchanges.length === 0 ? (
        <p className="text-muted-foreground">No tienes intercambios.</p>
      ) : (
        <div className="space-y-6">
          {exchanges
            .filter(ex => {
              const soyPropietario = user && user.idUsuario === ex.usuario_destino_id
              const soyProponente = user && user.idUsuario === ex.usuario_origen_id
              if (tab === 'recibidos' && !soyPropietario) return false
              if (tab === 'enviados' && !soyProponente) return false
              if (estadoFiltro !== 'todos' && ex.estado !== estadoFiltro) return false
              return true
            })
            .map((ex) => {
              const soyPropietario = user && user.idUsuario === ex.usuario_destino_id
              const soyProponente = user && user.idUsuario === ex.usuario_origen_id
              return (
                <Card key={ex.idintercambio}>
                  <CardContent className="pt-6">
                    <div className="mb-2">
                      <span className="font-semibold">Libro solicitado:</span> {ex.libro_recibido_titulo || ex.libro_recibido_id}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Libro ofrecido:</span> {ex.libro_ofrecido_titulo || ex.libro_ofrecido_id}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Estado:</span> {ex.estado}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Fecha:</span> {new Date(ex.fecha).toLocaleString()}
                    </div>
                    <div className="flex gap-2 mt-4">
                      {soyPropietario && ex.estado === "pendiente" && (
                        <>
                          <Button onClick={() => handleUpdateEstado(ex.idintercambio, "aceptado")}>Aceptar</Button>
                          <Button variant="outline" onClick={() => handleUpdateEstado(ex.idintercambio, "rechazado")}>Rechazar</Button>
                        </>
                      )}
                      {soyProponente && ex.estado === "pendiente" && (
                        <Button variant="outline" onClick={() => handleUpdateEstado(ex.idintercambio, "rechazado")}>Cancelar</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}