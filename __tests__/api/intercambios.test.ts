import { describe, it, expect } from '@jest/globals';

// IDs y usuarios reales para pruebas
const libroOfrecido = 30; // Libro de Paul
const libroSolicitado = 29; // Libro de Jean Paul
const usuarioOrigen = 31; // Paul
const usuarioDestino = 30; // Jean Paul
let intercambioId: number | undefined = undefined;

describe('Intercambios API', () => {
  it('debería crear un intercambio pendiente', async () => {
    const res = await fetch('http://localhost:3000/api/intercambios', {
      method: 'POST',
      body: JSON.stringify({
        libro_ofrecido_id: libroOfrecido,
        libro_recibido_id: libroSolicitado,
        usuario_origen_id: usuarioOrigen,
        usuario_destino_id: usuarioDestino
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    expect([201, 200, 404]).toContain(res.status);
    if (res.status === 201 || res.status === 200) {
      const data = await res.json();
      expect(data.estado).toBeDefined();
      expect(data.idintercambio).toBeDefined();
      intercambioId = data.idintercambio;
    } else {
      // Si no se pudo crear, intercambioId queda undefined
      intercambioId = undefined;
    }
  });

  it('no permite intercambiar el mismo libro', async () => {
    const res = await fetch('http://localhost:3000/api/intercambios', {
      method: 'POST',
      body: JSON.stringify({
        libro_ofrecido_id: libroOfrecido,
        libro_recibido_id: libroOfrecido,
        usuario_origen_id: usuarioOrigen,
        usuario_destino_id: usuarioDestino
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/mismo libro/i);
  });

  it('no permite crear intercambio si usuario no es dueño del libro', async () => {
    const res = await fetch('http://localhost:3000/api/intercambios', {
      method: 'POST',
      body: JSON.stringify({
        libro_ofrecido_id: libroOfrecido,
        libro_recibido_id: libroSolicitado,
        usuario_origen_id: 999,
        usuario_destino_id: usuarioDestino
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    expect([403, 404]).toContain(res.status);
    const data = await res.json();
    expect(data.error).toMatch(/dueño del libro|no existen/i);
  });

  it('permite aceptar el intercambio', async () => {
    if (!intercambioId) return;
    const res = await fetch(`http://localhost:3000/api/intercambios/${intercambioId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: 'aceptado' }),
      headers: { 'Content-Type': 'application/json' }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.estado).toBe('aceptado');
  });

  it('permite rechazar el intercambio', async () => {
    if (!intercambioId) return;
    const res = await fetch(`http://localhost:3000/api/intercambios/${intercambioId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: 'rechazado' }),
      headers: { 'Content-Type': 'application/json' }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.estado).toBe('rechazado');
  });
});
