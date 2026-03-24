# CRM SaaS — Backend

API REST para una plataforma de gestión de cartera de clientes orientada a ejecutivos de ventas. Permite registrar clientes, historial de interacciones, seguimientos y ver estadísticas desde un dashboard centralizado.

---

## Features

- Autenticación JWT (register/login)
- CRUD completo de clientes
- Historial de interacciones por cliente
- Seguimientos con estado (pendiente/completado)
- Dashboard con métricas agregadas
- Importación masiva desde CSV/XLSX
- Arquitectura multi-tenant por usuario

---

## Tecnologías

- **NestJS** — framework backend con arquitectura modular
- **Prisma ORM v5** — acceso a base de datos con tipado completo
- **PostgreSQL** — base de datos relacional
- **JWT + Passport** — autenticación stateless
- **bcrypt** — hasheo seguro de contraseñas
- **Multer + xlsx** — importación masiva desde archivos CSV y Excel
- **Swagger** — documentación interactiva de la API

---

## Requisitos previos

- Node.js v18 o superior
- PostgreSQL corriendo localmente o una instancia en la nube
- npm

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/crm-saas-backend.git
cd crm-saas-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

---

## Base de datos

```bash
# Crear las tablas en la base de datos
npx prisma migrate dev

```

---

## Correr el proyecto

```bash
npm run start:dev

```

La API queda disponible en `http://localhost:3001/api`

La documentación Swagger queda en `http://localhost:3001/docs`

---

## Variables de entorno

Creá un archivo `.env` en la raíz del proyecto con los siguientes valores:

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/crm_saas"
JWT_SECRET="una_clave_muy_larga_y_secreta"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
```

| Variable         | Descripción                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| `DATABASE_URL`   | Cadena de conexión a PostgreSQL                                                     |
| `JWT_SECRET`     | Clave secreta para firmar los tokens JWT — debe ser larga y aleatoria en producción |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token (ej: `7d`, `24h`)                                    |
| `FRONTEND_URL`   | URL del frontend permitida por CORS                                                 |

---

## Estructura del proyecto

```
src/
├── auth/               # Registro, login y JWT
│   ├── dto/            # Validación de datos de entrada
│   ├── interfaces/     # Tipos para JWT payload
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── clients/            # CRUD de clientes e importación
│   └── dto/
├── interactions/       # Historial de interacciones por cliente
│   └── dto/
├── follow-ups/         # Recordatorios y seguimientos
│   └── dto/
├── dashboard/          # Estadísticas agregadas del ejecutivo
├── common/
│   ├── decorators/     # @CurrentUser() para acceder al usuario autenticado
│   └── interfaces/     # AuthenticatedUser
└── prisma/             # Módulo global de conexión a la DB
```

---

## Endpoints principales

Todos los endpoints excepto `/auth` requieren el header:

```
Authorization: Bearer <token>
```

### Autenticación

| Método | Ruta                 | Descripción                        |
| ------ | -------------------- | ---------------------------------- |
| `POST` | `/api/auth/register` | Registrar nuevo ejecutivo          |
| `POST` | `/api/auth/login`    | Iniciar sesión y obtener token JWT |

### Clientes

| Método   | Ruta                  | Descripción                                          |
| -------- | --------------------- | ---------------------------------------------------- |
| `GET`    | `/api/clients`        | Listar clientes (soporta `?search=`)                 |
| `POST`   | `/api/clients`        | Crear cliente                                        |
| `GET`    | `/api/clients/:id`    | Detalle del cliente con interacciones y seguimientos |
| `PATCH`  | `/api/clients/:id`    | Actualizar cliente                                   |
| `DELETE` | `/api/clients/:id`    | Eliminar cliente                                     |
| `POST`   | `/api/clients/import` | Importar clientes desde CSV o Excel                  |

### Interacciones

| Método   | Ruta                                | Descripción                                    |
| -------- | ----------------------------------- | ---------------------------------------------- |
| `GET`    | `/api/clients/:id/interactions`     | Listar interacciones de un cliente             |
| `POST`   | `/api/clients/:id/interactions`     | Registrar interacción (call, meeting, message) |
| `DELETE` | `/api/clients/:id/interactions/:id` | Eliminar interacción                           |

### Seguimientos

| Método   | Ruta                              | Descripción                                       |
| -------- | --------------------------------- | ------------------------------------------------- |
| `GET`    | `/api/clients/:id/follow-ups`     | Listar seguimientos (soporta `?onlyPending=true`) |
| `POST`   | `/api/clients/:id/follow-ups`     | Crear seguimiento                                 |
| `PATCH`  | `/api/clients/:id/follow-ups/:id` | Actualizar o marcar como completado               |
| `DELETE` | `/api/clients/:id/follow-ups/:id` | Eliminar seguimiento                              |

### Dashboard

| Método | Ruta                   | Descripción                                              |
| ------ | ---------------------- | -------------------------------------------------------- |
| `GET`  | `/api/dashboard/stats` | Estadísticas, clientes recientes y seguimientos urgentes |

---

## Importación de clientes

El endpoint `POST /api/clients/import` acepta archivos `.csv` o `.xlsx` con las siguientes columnas:

| Columna   | Requerido | Descripción                 |
| --------- | --------- | --------------------------- |
| `name`    | ✅        | Nombre completo del cliente |
| `email`   | No        | Email de contacto           |
| `phone`   | No        | Teléfono                    |
| `company` | No        | Empresa u organización      |
| `notes`   | No        | Notas comerciales           |

Límites: máximo 500 filas por importación, archivos de hasta 5MB.

La respuesta incluye cuántos registros se importaron correctamente y el detalle de cada fila con error.

---

## Modelo de datos

```
User
 └── Client
       ├── Interaction   (llamadas, reuniones, mensajes)
       ├── FollowUp      (recordatorios con fecha límite)
       └── Vehicle       (vehículos o intereses del cliente)
```

Cada cliente pertenece a un usuario — esto garantiza que cada ejecutivo solo puede ver y gestionar su propia cartera (arquitectura multi-tenant por usuario).

---

## Decisiones técnicas destacadas

**Prisma v5 en lugar de v7** — Prisma 7 introdujo un nuevo engine tipo "client" que requiere un adapter de base de datos externo. Para este stack (NestJS + PostgreSQL directo) Prisma 5 es la versión estable y compatible sin configuración adicional.

**Multi-tenant por userId** — en lugar de una arquitectura con organizaciones y roles, cada usuario es un ejecutivo independiente con su propia cartera. Todas las queries filtran por `userId` del token JWT, lo que hace imposible que un usuario acceda a datos de otro.

**Interacciones inmutables** — el historial de interacciones no tiene endpoint de edición. En un CRM las interacciones son registros históricos que no deberían modificarse — si hay un error se borra y se registra de nuevo.

**Promise.all en el dashboard** — las 7 queries del dashboard se ejecutan en paralelo para minimizar el tiempo de respuesta en lugar de ejecutarse en serie.

---

## Roadmap v2

- Arquitectura multi-tenant con organizaciones y roles (admin, gerente, vendedor)
- Módulo de vehículos e intereses por cliente
- Notificaciones por email para seguimientos vencidos
- Exportación de clientes a Excel
- Autenticación con Google OAuth

---

## Frontend

El frontend de este proyecto está en un repositorio separado:
[crm-saas-frontend](https://github.com/SBSofiaBartoli/crm-saas-frontend)
