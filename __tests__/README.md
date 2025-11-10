# Pruebas de la API de Libros - CRUD Operations

Este documento describe las pruebas unitarias implementadas para la funcionalidad CRUD de libros en el sistema de biblioteca.

## 📋 Resumen de Pruebas

Se implementaron **18 pruebas** que cubren las 4 operaciones CRUD principales:

- ✅ **createBook()** - Prueba de Inserción (4 pruebas)
- ✅ **getBooks()** - Prueba de Lectura (4 pruebas)  
- ✅ **updateBook()** - Prueba de Actualización (5 pruebas)
- ✅ **deleteBook()** - Prueba de Eliminación (5 pruebas)

## 🛠️ Tecnologías Utilizadas

- **Jest**: Framework de pruebas
- **@testing-library/jest-dom**: Matchers adicionales para Jest
- **TypeScript**: Tipado estático
- **Mock Functions**: Para simular la base de datos PostgreSQL

## 📝 Casos de Prueba Detallados

### 1. POST /api/books - createBook()

#### ✅ Prueba 1: Crear libro con todos los campos
- **Descripción**: Verifica que se puede crear un libro con todos los campos completos
- **Input**: Título, autor, género, año, editorial, descripción, idUsuario
- **Expected**: Status 201, libro creado con todos los campos

#### ✅ Prueba 2: Rechazar creación con campos faltantes
- **Descripción**: Valida que se rechacen libros sin campos requeridos
- **Input**: Solo título y género (falta autor e idUsuario)
- **Expected**: Status 400, mensaje de error "Campos requeridos incompletos"

#### ✅ Prueba 3: Crear libro sin campos opcionales
- **Descripción**: Verifica que se puede crear un libro solo con campos requeridos
- **Input**: Título, autor, género, idUsuario
- **Expected**: Status 201, campos opcionales como null

#### ✅ Prueba 4: Manejar errores de base de datos
- **Descripción**: Verifica el manejo de errores cuando la base de datos falla
- **Input**: Datos válidos, pero la BD lanza error
- **Expected**: Status 500, mensaje de error apropiado

### 2. GET /api/books - getBooks()

#### ✅ Prueba 5: Obtener libros sin autenticación
- **Descripción**: Verifica que usuarios no autenticados vean solo libros disponibles
- **Input**: Request sin cookie de autenticación
- **Expected**: Status 200, array con libros disponibles

#### ✅ Prueba 6: Obtener libros con usuario autenticado
- **Descripción**: Verifica que usuarios autenticados vean sus libros y los disponibles
- **Input**: Request con cookie de autenticación
- **Expected**: Status 200, array con libros (incluye los del usuario)

#### ✅ Prueba 7: Array vacío cuando no hay libros
- **Descripción**: Verifica el comportamiento cuando no hay libros en la BD
- **Input**: Request normal
- **Expected**: Status 200, array vacío []

#### ✅ Prueba 8: Manejar errores de base de datos
- **Descripción**: Verifica el manejo de errores de consulta
- **Input**: La BD lanza error
- **Expected**: Status 500, mensaje de error

### 3. PUT /api/books/[id] - updateBook()

#### ✅ Prueba 9: Actualizar libro exitosamente
- **Descripción**: Verifica que el dueño puede actualizar su libro
- **Input**: Datos actualizados, idUsuario coincide con dueño
- **Expected**: Status 200, libro actualizado con nuevos datos

#### ✅ Prueba 10: Rechazar actualización de libro inexistente
- **Descripción**: Valida que no se pueda actualizar un libro que no existe
- **Input**: ID de libro que no existe en la BD
- **Expected**: Status 404, mensaje "Libro no encontrado"

#### ✅ Prueba 11: Rechazar actualización por usuario no autorizado
- **Descripción**: Verifica que solo el dueño puede actualizar el libro
- **Input**: idUsuario diferente al dueño del libro
- **Expected**: Status 403, mensaje "No tienes permiso para editar este libro"

#### ✅ Prueba 12: Rechazar actualización sin autenticación
- **Descripción**: Valida que se requiere autenticación para actualizar
- **Input**: Request sin idUsuario
- **Expected**: Status 401, mensaje "No autorizado"

#### ✅ Prueba 13: Actualizar solo el estado del libro
- **Descripción**: Verifica que se puede actualizar parcialmente el libro
- **Input**: Solo cambio de estado (disponible → prestado)
- **Expected**: Status 200, solo el estado cambiado

### 4. DELETE /api/books/[id] - deleteBook()

#### ✅ Prueba 14: Eliminar libro exitosamente
- **Descripción**: Verifica que el dueño puede eliminar su libro
- **Input**: ID del libro, idUsuario coincide con dueño
- **Expected**: Status 200, mensaje "Libro eliminado"

#### ✅ Prueba 15: Rechazar eliminación de libro inexistente
- **Descripción**: Valida que no se pueda eliminar un libro que no existe
- **Input**: ID de libro que no existe
- **Expected**: Status 404, mensaje "Libro no encontrado"

#### ✅ Prueba 16: Rechazar eliminación por usuario no autorizado
- **Descripción**: Verifica que solo el dueño puede eliminar el libro
- **Input**: idUsuario diferente al dueño
- **Expected**: Status 403, mensaje "No tienes permiso para eliminar este libro"

#### ✅ Prueba 17: Rechazar eliminación sin autenticación
- **Descripción**: Valida que se requiere autenticación para eliminar
- **Input**: Request sin idUsuario
- **Expected**: Status 401, mensaje "No autorizado"

#### ✅ Prueba 18: Manejar errores de base de datos
- **Descripción**: Verifica el manejo de errores durante la eliminación
- **Input**: La BD lanza error durante DELETE
- **Expected**: Status 500, mensaje "Error al eliminar libro"

## 🚀 Ejecutar las Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo watch
```bash
npm run test:watch
```

### Generar reporte de cobertura
```bash
npm run test:coverage
```

## 📊 Resultados

```
Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        ~0.8s
```

### Cobertura por Funcionalidad

| Funcionalidad | Pruebas | Estado |
|--------------|---------|--------|
| createBook() | 4/4 | ✅ PASS |
| getBooks() | 4/4 | ✅ PASS |
| updateBook() | 5/5 | ✅ PASS |
| deleteBook() | 5/5 | ✅ PASS |
| **TOTAL** | **18/18** | **✅ 100%** |

## 🔍 Aspectos Probados

### Seguridad
- ✅ Autenticación requerida para operaciones sensibles
- ✅ Autorización: solo el dueño puede editar/eliminar
- ✅ Validación de permisos en cada operación

### Validación de Datos
- ✅ Campos requeridos vs opcionales
- ✅ Validación de tipos de datos
- ✅ Manejo de datos incompletos

### Manejo de Errores
- ✅ Errores de base de datos
- ✅ Recursos no encontrados (404)
- ✅ Accesos no autorizados (401, 403)
- ✅ Errores de servidor (500)

### Estados del Sistema
- ✅ Con y sin autenticación
- ✅ Base de datos vacía
- ✅ Datos válidos e inválidos
- ✅ Múltiples usuarios

## 📁 Estructura de Archivos

```
biblioteca/
├── __tests__/
│   └── api/
│       └── books.test.ts          # Pruebas CRUD
├── app/
│   └── api/
│       └── books/
│           ├── route.ts            # GET, POST
│           └── [id]/
│               └── route.ts        # GET, PUT, DELETE
├── jest.config.js                  # Configuración de Jest
├── jest.setup.js                   # Setup global de Jest
└── package.json                    # Scripts y dependencias
```

## 🎯 Buenas Prácticas Implementadas

1. **Aislamiento**: Cada prueba es independiente
2. **Mocking**: Base de datos mockeada para evitar dependencias externas
3. **Claridad**: Nombres descriptivos para cada caso de prueba
4. **Cobertura**: Casos happy path y edge cases
5. **Organización**: Agrupación lógica por funcionalidad (describe blocks)
6. **Assertions**: Verificaciones múltiples y específicas

## 📚 Referencias

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)

---

**Desarrollado para el curso**: Calidad y Pruebas de Software  
**Framework**: Next.js 16 + TypeScript  
**Base de Datos**: PostgreSQL (Neon)
