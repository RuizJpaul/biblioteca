# Biblioteca - Sistema de Intercambio de Libros

Sistema web para intercambio de libros entre usuarios, desarrollado con Next.js 13+, TypeScript, Tailwind CSS y PostgreSQL.

## 🚀 Características

- Autenticación de usuarios (registro, inicio de sesión)
- Panel de usuario con gestión de libros personales
- Sistema de intercambio de libros entre usuarios
- Panel de administración para gestionar usuarios y libros
- Estadísticas en tiempo real
- Interfaz responsive y moderna con Tailwind CSS
- Base de datos PostgreSQL para almacenamiento persistente

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL
- npm o pnpm

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/RuizJpaul/biblioteca.git
cd biblioteca
```

2. Instala las dependencias:
```bash
npm install
# o con pnpm
pnpm install
```

3. Configura la base de datos:
- Crea una base de datos PostgreSQL
- Ejecuta los scripts SQL en el orden correcto:
```bash
psql -U tu_usuario -d tu_base_de_datos -f scripts/01-init-database.sql
psql -U tu_usuario -d tu_base_de_datos -f scripts/02-add-delivery-locations.sql
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
pnpm dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Estructura del Proyecto

```
biblioteca/
├── app/                    # Rutas y páginas de Next.js
│   ├── admin/             # Panel de administración
│   ├── api/               # Endpoints de la API
│   ├── user/              # Panel de usuario
│   └── ...
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y configuraciones
├── scripts/              # Scripts SQL
└── docs/                 # Documentación adicional
```

## 📚 Documentación

- [Guía de API](docs/api.md)
- [Manual de Usuario](docs/user-guide.md)
- [Manual de Administrador](docs/admin-guide.md)

## 🔒 Autenticación y Seguridad

- Autenticación basada en cookies HTTP-only
- Validación de roles (usuario/admin)
- Protección CSRF
- Validación de datos en cliente y servidor

## 🛣️ Rutas Principales

- `/` - Página principal pública
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios
- `/user` - Panel de usuario
- `/admin` - Panel de administración
- `/books` - Catálogo de libros

## 👥 Roles de Usuario

### Usuario Regular
- Gestionar sus libros
- Proponer intercambios
- Ver catálogo de libros
- Actualizar perfil

### Administrador
- Gestionar usuarios
- Gestionar libros
- Ver estadísticas
- Administrar sistema

## 🤝 Contribuir

1. Haz un Fork del proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.