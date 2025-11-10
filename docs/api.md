# Documentación de API

Esta documentación detalla los endpoints disponibles en la API del sistema de biblioteca.

## 🔑 Autenticación

### Registro de Usuario
```http
POST /api/auth/register
```

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string"
}
```

### Inicio de Sesión
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuesta exitosa:**
```json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

## 📚 Libros

### Listar Libros
```http
GET /api/books
```

**Query Parameters:**
- `page`: número de página (opcional)
- `limit`: límite de resultados por página (opcional)

**Respuesta exitosa:**
```json
{
  "books": [
    {
      "id": "uuid",
      "title": "string",
      "author": "string",
      "year": "number",
      "owner": {
        "id": "uuid",
        "name": "string"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

### Obtener Libro por ID
```http
GET /api/books/{id}
```

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "title": "string",
  "author": "string",
  "year": "number",
  "description": "string",
  "owner": {
    "id": "uuid",
    "name": "string"
  }
}
```

### Crear Libro
```http
POST /api/books
```

**Body:**
```json
{
  "title": "string",
  "author": "string",
  "year": "number",
  "description": "string"
}
```

## 👥 Usuarios

### Listar Usuarios
```http
GET /api/users
```

**Query Parameters:**
- `page`: número de página (opcional)
- `limit`: límite de resultados por página (opcional)

**Respuesta exitosa:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

### Obtener Usuario por ID
```http
GET /api/users/{id}
```

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "string",
  "books": [
    {
      "id": "uuid",
      "title": "string",
      "author": "string"
    }
  ]
}
```

## 🔄 Intercambios

### Crear Intercambio
```http
POST /api/intercambios
```

**Body:**
```json
{
  "bookOfferedId": "uuid",
  "bookRequestedId": "uuid",
  "message": "string"
}
```

### Listar Intercambios
```http
GET /api/intercambios
```

**Query Parameters:**
- `status`: estado del intercambio (opcional)

**Respuesta exitosa:**
```json
{
  "exchanges": [
    {
      "id": "uuid",
      "bookOffered": {
        "id": "uuid",
        "title": "string"
      },
      "bookRequested": {
        "id": "uuid",
        "title": "string"
      },
      "status": "string",
      "createdAt": "date"
    }
  ]
}
```

## 📍 Puntos de Entrega

### Listar Puntos de Entrega
```http
GET /api/puntos-entrega
```

**Respuesta exitosa:**
```json
{
  "locations": [
    {
      "id": "uuid",
      "name": "string",
      "address": "string",
      "city": "string"
    }
  ]
}
```

## ⚠️ Manejo de Errores

La API utiliza los siguientes códigos de estado HTTP:

- `200 OK`: Petición exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en la petición
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

Los errores devuelven un objeto JSON con el siguiente formato:

```json
{
  "error": {
    "message": "string",
    "code": "string"
  }
}
```