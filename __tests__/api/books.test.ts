/**
 * Pruebas para la API de Books - CRUD Operations
 * 
 * Incluye:
 * - createBook() - Prueba de inserción
 * - getBooks() - Prueba de lectura
 * - updateBook() - Prueba de actualización
 * - deleteBook() - Prueba de eliminación
 */

// Mock de Next.js server ANTES de importar las rutas
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({
      status: options?.status || 200,
      json: async () => data,
    }),
  },
}))

import { GET, POST } from '@/app/api/books/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/books/[id]/route'
import { getDb } from '@/lib/db'

// Mock de la base de datos
jest.mock('@/lib/db', () => ({
  getDb: jest.fn(),
}))

// Helper para crear un mock de NextRequest
function createMockRequest(url: string, options: any = {}) {
  const { method = 'GET', body = null, headers = {}, cookies = {} } = options
  
  return {
    url,
    method,
    headers: new Map(Object.entries(headers)),
    cookies: {
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
    },
    json: async () => (body ? JSON.parse(body) : {}),
    text: async () => body || '',
  } as any
}

describe('Books API - CRUD Operations', () => {
  let mockSql: jest.Mock

  beforeEach(() => {
    // Reset mocks antes de cada prueba
    jest.clearAllMocks()
    mockSql = jest.fn()
    ;(getDb as jest.Mock).mockReturnValue(mockSql)
  })

  // ========================================
  // Prueba de Inserción - createBook()
  // ========================================
  describe('POST /api/books - createBook()', () => {
    it('debería crear un libro exitosamente con todos los campos', async () => {
      const newBook = {
        titulo: 'Cien años de soledad',
        autor: 'Gabriel García Márquez',
        genero: 'Ficción',
        anio: 1967,
        editorial: 'Editorial Sudamericana',
        descripcion: 'Una obra maestra del realismo mágico',
        idUsuario: 1,
      }

      const mockCreatedBook = {
        idlibro: 1,
        ...newBook,
        estado: 'disponible',
        fecha_creacion: new Date().toISOString(),
      }

      // Mock de la respuesta de la base de datos
      mockSql.mockResolvedValue([mockCreatedBook])

      const request = createMockRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify(newBook),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('idlibro')
      expect(data.titulo).toBe(newBook.titulo)
      expect(data.autor).toBe(newBook.autor)
      expect(data.genero).toBe(newBook.genero)
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('debería rechazar la creación si faltan campos requeridos', async () => {
      const incompleteBook = {
        titulo: 'Libro sin autor',
        genero: 'Ficción',
      }

      const request = createMockRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify(incompleteBook),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Campos requeridos incompletos')
      expect(mockSql).not.toHaveBeenCalled()
    })

    it('debería crear un libro sin campos opcionales', async () => {
      const minimalBook = {
        titulo: 'Libro Minimalista',
        autor: 'Autor Desconocido',
        genero: 'Misterio',
        idUsuario: 2,
      }

      const mockCreatedBook = {
        idlibro: 2,
        ...minimalBook,
        anio: null,
        editorial: null,
        descripcion: null,
        estado: 'disponible',
        fecha_creacion: new Date().toISOString(),
      }

      mockSql.mockResolvedValue([mockCreatedBook])

      const request = createMockRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify(minimalBook),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.titulo).toBe(minimalBook.titulo)
      expect(data.anio).toBeNull()
      expect(data.editorial).toBeNull()
      expect(data.descripcion).toBeNull()
    })

    it('debería manejar errores de la base de datos', async () => {
      const newBook = {
        titulo: 'Libro con error',
        autor: 'Autor Test',
        genero: 'Ficción',
        idUsuario: 1,
      }

      mockSql.mockRejectedValue(new Error('Database connection error'))

      const request = createMockRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify(newBook),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Error al crear libro')
    })
  })

  // ========================================
  // Prueba de Lectura - getBooks()
  // ========================================
  describe('GET /api/books - getBooks()', () => {
    it('debería obtener todos los libros disponibles sin autenticación', async () => {
      const mockBooks = [
        {
          idlibro: 1,
          titulo: 'El Quijote',
          autor: 'Miguel de Cervantes',
          genero: 'Ficción',
          estado: 'disponible',
          idusuario: 1,
          usuario_nombre: 'Juan',
          usuario_apellido: 'Pérez',
        },
        {
          idlibro: 2,
          titulo: '1984',
          autor: 'George Orwell',
          genero: 'Ciencia Ficción',
          estado: 'disponible',
          idusuario: 2,
          usuario_nombre: 'María',
          usuario_apellido: 'González',
        },
      ]

      mockSql.mockResolvedValue(mockBooks)

      const request = createMockRequest('http://localhost:3000/api/books', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0]).toHaveProperty('titulo')
      expect(data[0]).toHaveProperty('autor')
      expect(data[0]).toHaveProperty('usuario_nombre')
    })

    it('debería obtener libros incluyendo los del usuario autenticado', async () => {
      const mockBooks = [
        {
          idlibro: 1,
          titulo: 'Libro Disponible',
          estado: 'disponible',
          idusuario: 2,
        },
        {
          idlibro: 2,
          titulo: 'Mi Libro Prestado',
          estado: 'prestado',
          idusuario: 1,
        },
      ]

      mockSql.mockResolvedValue(mockBooks)

      // Mock de cookie de autenticación
      const authData = { idUsuario: 1, nombre: 'Test User' }
      const authCookie = Buffer.from(JSON.stringify(authData)).toString('base64')

      const request = createMockRequest('http://localhost:3000/api/books', {
        method: 'GET',
        cookies: { auth: authCookie },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
    })

    it('debería retornar array vacío cuando no hay libros', async () => {
      mockSql.mockResolvedValue([])

      const request = createMockRequest('http://localhost:3000/api/books', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })

    it('debería manejar errores de la base de datos', async () => {
      mockSql.mockRejectedValue(new Error('Database query failed'))

      const request = createMockRequest('http://localhost:3000/api/books', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  // ========================================
  // Prueba de Actualización - updateBook()
  // ========================================
  describe('PUT /api/books/[id] - updateBook()', () => {
    it('debería actualizar un libro exitosamente', async () => {
      const bookId = 1
      const updateData = {
        titulo: 'Título Actualizado',
        autor: 'Autor Actualizado',
        genero: 'Historia',
        editorial: 'Nueva Editorial',
        descripcion: 'Descripción actualizada',
        estado: 'disponible',
        anio: 2024,
        idUsuario: 1,
      }

      const mockExistingBook = {
        idlibro: bookId,
        idusuario: 1,
      }

      const mockUpdatedBook = {
        idlibro: bookId,
        ...updateData,
      }

      // Mock: primera llamada para verificar el libro, segunda para actualizar
      mockSql
        .mockResolvedValueOnce([mockExistingBook])
        .mockResolvedValueOnce([mockUpdatedBook])

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.titulo).toBe(updateData.titulo)
      expect(data.autor).toBe(updateData.autor)
      expect(data.genero).toBe(updateData.genero)
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('debería rechazar la actualización si el libro no existe', async () => {
      const bookId = 999
      const updateData = {
        titulo: 'Libro Inexistente',
        autor: 'Autor',
        genero: 'Ficción',
        estado: 'disponible',
        idUsuario: 1,
      }

      mockSql.mockResolvedValue([])

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('no encontrado')
    })

    it('debería rechazar la actualización si el usuario no es el dueño', async () => {
      const bookId = 1
      const updateData = {
        titulo: 'Intento de actualización no autorizada',
        autor: 'Autor',
        genero: 'Ficción',
        estado: 'disponible',
        idUsuario: 2, // Usuario diferente al dueño
      }

      const mockExistingBook = {
        idlibro: bookId,
        idusuario: 1, // Dueño original
      }

      mockSql.mockResolvedValue([mockExistingBook])

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('permiso')
    })

    it('debería rechazar la actualización sin autenticación', async () => {
      const bookId = 1
      const updateData = {
        titulo: 'Sin autenticación',
        autor: 'Autor',
        genero: 'Ficción',
        estado: 'disponible',
        // Sin idUsuario
      }

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('autorizado')
    })

    it('debería actualizar solo el estado del libro', async () => {
      const bookId = 1
      const updateData = {
        titulo: 'Libro Original',
        autor: 'Autor Original',
        genero: 'Ficción',
        estado: 'prestado', // Solo cambia el estado
        idUsuario: 1,
      }

      const mockExistingBook = { idlibro: bookId, idusuario: 1 }
      const mockUpdatedBook = { ...mockExistingBook, ...updateData }

      mockSql
        .mockResolvedValueOnce([mockExistingBook])
        .mockResolvedValueOnce([mockUpdatedBook])

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.estado).toBe('prestado')
    })
  })

  // ========================================
  // Prueba de Eliminación - deleteBook()
  // ========================================
  describe('DELETE /api/books/[id] - deleteBook()', () => {
    it('debería eliminar un libro exitosamente', async () => {
      const bookId = 1
      const userId = 1

      const mockExistingBook = {
        idlibro: bookId,
        idusuario: userId,
      }

      const mockDeletedBook = {
        idlibro: bookId,
      }

      // Mock: primera llamada para verificar, segunda para eliminar
      mockSql
        .mockResolvedValueOnce([mockExistingBook])
        .mockResolvedValueOnce([mockDeletedBook])

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'DELETE',
        body: JSON.stringify({ idUsuario: userId }),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('eliminado')
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('debería rechazar la eliminación si el libro no existe', async () => {
      const bookId = 999
      const userId = 1

      mockSql.mockResolvedValue([])

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'DELETE',
        body: JSON.stringify({ idUsuario: userId }),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('no encontrado')
    })

    it('debería rechazar la eliminación si el usuario no es el dueño', async () => {
      const bookId = 1
      const userId = 2

      const mockExistingBook = {
        idlibro: bookId,
        idusuario: 1, // Dueño diferente
      }

      mockSql.mockResolvedValue([mockExistingBook])

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'DELETE',
        body: JSON.stringify({ idUsuario: userId }),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('permiso')
    })

    it('debería rechazar la eliminación sin autenticación', async () => {
      const bookId = 1

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'DELETE',
        body: JSON.stringify({}), // Sin idUsuario
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('autorizado')
    })

    it('debería manejar errores de la base de datos durante la eliminación', async () => {
      const bookId = 1
      const userId = 1

      mockSql.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest(`http://localhost:3000/api/books/${bookId}`, {
        method: 'DELETE',
        body: JSON.stringify({ idUsuario: userId }),
        headers: { 'Content-Type': 'application/json' },
      })

      const params = Promise.resolve({ id: bookId.toString() })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Error al eliminar libro')
    })
  })
})
