"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface DeliveryLocation {
  idPuntoEntrega: number;
  nombre: string;
  direccion: string;
  horario: string;
}

export default function DeliveryLocationsPage() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Obtener el userId desde localStorage
        let userId = null;
        try {
          const stored = localStorage.getItem("auth_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            userId = parsed.idUsuario || parsed.idusuario;
          }
        } catch {}

        if (!userId) {
          console.error("[Puntos de entrega] ERROR: userId no encontrado en localStorage");
          throw new Error("No se pudo obtener el userId");
        }

        const res = await fetch(`/api/puntos-entrega?userId=${userId}`, { credentials: "include" });
        if (!res.ok) {
          let errorBody = "";
          try {
            errorBody = await res.text();
          } catch {}
          console.error(`[Puntos de entrega] ERROR: status=${res.status}, body=${errorBody}`);
          throw new Error("Error al cargar puntos de entrega");
        }
        const data = await res.json();
        // Normaliza los datos para que todos tengan idPuntoEntrega
        const normalized = Array.isArray(data)
          ? data.map((loc) => ({
              ...loc,
              idPuntoEntrega: loc.idPuntoEntrega ?? loc.idpuntoentrega ?? loc.id
            }))
          : [];
        setLocations(normalized);
      } catch (err) {
        console.error("[Puntos de entrega] ERROR:", err);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Puntos de Entrega</CardTitle>
            <p className="text-muted-foreground mt-2">Consulta los lugares disponibles para entregar o recibir tus libros intercambiados.</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando puntos de entrega...</div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay puntos de entrega disponibles.</div>
            ) : (
              <div className="space-y-6">
                {locations.map((loc) => (
                  <Card key={loc.idPuntoEntrega} className="shadow-sm border border-border">
                    <CardContent className="py-4">
                      <h3 className="font-semibold text-lg mb-1">{loc.nombre}</h3>
                      <p className="text-sm text-muted-foreground mb-1">Dirección: {loc.direccion}</p>
                      <p className="text-sm text-muted-foreground mb-2">Horario: {loc.horario}</p>
                      <Button size="sm" variant="outline" className="mt-2">Ver en mapa</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
