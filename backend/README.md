# Backend - Task Manager API

API REST con NestJS para gestión de tareas.

## Stack

- NestJS + TypeORM
- PostgreSQL + Redis
- JWT + Passport
- Swagger

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev

# Tests
npm run test

# Build
npm run build
```

## Variables de entorno

Crear `.env` basado en `.env.example`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_task_manager
DB_USER=postgres
DB_PASSWORD=tu_password

# App
PORT=3000
JWT_SECRET=tu_secreto

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=300

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Mail (opcional)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@example.com
```

## Endpoints principales

| Método | Ruta | Descripcion |
|--------|------|-------------|
| POST | /auth/login | Login |
| POST | /auth/register | Registro |
| GET | /tasks | Listar tareas |
| POST | /tasks | Crear tarea |
| PATCH | /tasks/:id | Actualizar tarea |
| DELETE | /tasks/:id | Eliminar tarea |
| GET | /health | Health check |

## Swagger

Documentacion disponible en `/docs`
