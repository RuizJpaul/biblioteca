"use client"

import { AdminNavbar } from "@/components/admin-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/role"
import { Input } from "@/components/ui/input"

interface User {
  idUsuario: number
  nombre: string
  apellido: string
  email: string
  username: string
  tipoUsuario: string
  telefono?: string
  direccion?: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user")
      if (stored) {
        const userData = JSON.parse(stored)
        if (!isAdmin(userData.tipoUsuario)) {
          router.push("/")
          return
        }
        setUser(userData)
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
      if (!isAdmin(userData.tipoUsuario)) {
        router.push("/")
        return
      }
      setUser(userData)
    } catch (e) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (!response.ok) throw new Error("Failed to fetch users")

        const data = await response.json()
        console.log("[v0] Usuarios recibidos desde API:", data)

        // 🔧 Normalización para asegurar el campo idUsuario
        const normalized = (Array.isArray(data) ? data : []).map((u: any) => ({
          idUsuario: u.idUsuario ?? u.id ?? null,
          nombre: u.nombre ?? "",
          apellido: u.apellido ?? "",
          email: u.email ?? "",
          username: u.username ?? "",
          tipoUsuario: u.tipoUsuario ?? "",
          telefono: u.telefono ?? "",
          direccion: u.direccion ?? "",
        }))

        console.log("[v0] Usuarios normalizados:", normalized)
        setUsers(normalized)
      } catch (error) {
        console.error("[v0] Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin(user?.tipoUsuario)) {
      fetchUsers()
    }
  }, [user])

  const filteredUsers = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete user")
      setUsers(users.filter((u) => u.idUsuario !== userId))
      setSelectedUser(null)
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
    }
  }

  const handleSaveEdit = async () => {
    if (editingUser) {
      try {
        const response = await fetch(`/api/users/${editingUser.idUsuario}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingUser),
        })

        // Try to parse response body (may contain error details)
        let responseBody: any = null
        try {
          responseBody = await response.json()
        } catch (e) {
          // ignore parse errors
        }

        if (!response.ok) {
          console.error("[v0] Failed to update user, server response:", response.status, responseBody)
          alert(responseBody?.error || responseBody?.message || "Error al actualizar usuario")
          return
        }

        // update local list with returned user (prefer server-canonical data if provided)
        const updatedUser = responseBody ?? editingUser
        setUsers(users.map((u) => (u.idUsuario === updatedUser.idUsuario ? updatedUser : u)))
        setEditingUser(null)
        setSelectedUser(updatedUser)
      } catch (error) {
        console.error("[v0] Error updating user:", error)
        alert("Error al actualizar usuario")
      }
    }
  }

  if (!user) return <div className="flex items-center justify-center h-screen">Cargando...</div>
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando usuarios...</div>

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar userName={user.nombre} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>

        <div className="mb-6">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-fit max-h-96 overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">Usuarios ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredUsers.map((u, idx) => (
                  <button
                    key={u.idUsuario ?? `user-${idx}`}
                    onClick={() => {
                      setSelectedUser(u)
                      setEditingUser(null)
                    }}
                    className={`w-full text-left p-3 rounded border-2 transition ${selectedUser?.idUsuario === u.idUsuario
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary"
                      }`}
                  >
                    <p className="font-medium">
                      {u.nombre} {u.apellido}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedUser && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingUser ? "Editar Usuario" : "Detalles del Usuario"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingUser ? (
                    <>
                      <div>
                        <label className="text-sm font-medium">Nombre</label>
                        <Input
                          value={editingUser.nombre}
                          onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Apellido</label>
                        <Input
                          value={editingUser.apellido}
                          onChange={(e) => setEditingUser({ ...editingUser, apellido: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Teléfono</label>
                        <Input
                          value={editingUser.telefono || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, telefono: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Dirección</label>
                        <Input
                          value={editingUser.direccion || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, direccion: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveEdit} className="flex-1">
                          Guardar
                        </Button>
                        <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Usuario</p>
                        <p className="font-medium">{selectedUser.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{selectedUser.telefono || "No especificado"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dirección</p>
                        <p className="font-medium">{selectedUser.direccion || "No especificada"}</p>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={() => setEditingUser(selectedUser)} className="flex-1">
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(selectedUser.idUsuario)}
                          className="flex-1"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
