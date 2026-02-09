# Aplicación de gestor de tareas

Este proyecto consiste en un **backend** en [NestJS](https://nestjs.com) y un **frontend** en [Next.js](https://nextjs.org) para administrar tareas con autenticación JWT, manejo de sesiones vía cookies y una interfaz moderna usando [TailwindCSS](https://tailwindcss.com) y [shadcn/ui](https://ui.shadcn.com).

<div align="center">
  <img src="https://startinfinity.s3.us-east-2.amazonaws.com/production/blog/post/5/main/1SvzKctRCi8bwB0QPdOZkBP0pRhsOqZpl0wjs6y0.png" alt="Task Manager Preview" width="400"/>
</div>

## Características

- **Backend**:

  - [NestJS](https://nestjs.com) con [TypeORM](https://typeorm.io) y [PostgreSQL](https://www.postgresql.org).
  - Cache con [Redis](https://redis.io) para mejor rendimiento.
  - Autenticación con **JWT** y [Passport](http://www.passportjs.org/).
  - WebSockets para actualizaciones en tiempo real.
  - Protección de endpoints con Guards y Rate Limiting.
  - Documentación de la API con Swagger en `/docs`.
  - Health check endpoint en `/health`.

- **Frontend**:

  - [Next.js 15](https://nextjs.org/docs) con App Router.
  - Interfaz con [TailwindCSS](https://tailwindcss.com) y componentes de [shadcn/ui](https://ui.shadcn.com).
  - Autenticación con **JWT** y cookies, protección de páginas a través de `middleware.ts`.
  - Conexión WebSocket para notificaciones en tiempo real.
  - Diseño responsive y experiencia de usuario moderna.

- **Contenedores Docker** para un despliegue sencillo:

  - Backend (NestJS)
  - Frontend (Next.js)
  - Base de datos (PostgreSQL)
  - Cache (Redis)
  - Monitoreo (Portainer)

- **CI/CD con GitHub Actions**
  - Tests automatizados en cada PR.
  - Build y push a DockerHub en merge a `main`.
  - Multi-stage builds optimizados.

---

## Requisitos previos

- [Docker](https://www.docker.com/get-started) instalado.
- [Docker Compose](https://docs.docker.com/compose/) (la mayoría de instalaciones de Docker Desktop ya lo incluyen).
- (Opcional) Node.js 20+ si deseas ejecutar el proyecto fuera de Docker.

---

## Configuración de variables de entorno

Crea un archivo **`.env`** en la raíz del proyecto copiando el ejemplo:

```bash
cp .env.example .env
```

Contenido del `.env`:

```bash
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_NAME=db_task_manager
DB_USER=postgres
DB_PASSWORD=tu_password_segura

# JWT
JWT_SECRET=tu_secreto_jwt_seguro

# Redis
REDIS_HOST=redis
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

---

## Instrucciones de instalación y arranque (con Docker)

<div align="center" style="margin-top: 60px; margin-bottom: 60px;">
  <img src="https://geekflare.com/es/wp-content/uploads/2022/11/docker.webp" alt="Docker logs" width="400"/>
</div>

Clona este repositorio:

    git clone https://github.com/Rumazor/task-manager
    cd task-manager

Crea tu archivo `.env` en la raíz:

    cp .env.example .env

Construye e inicia los contenedores:

    docker compose up -d

### URLs disponibles

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/docs |
| Portainer | http://localhost:9000 |

---

## Poblar la base de datos con datos de prueba

Para iniciar con datos de prueba, ejecuta el script de seed:

    ./seed.sh

O manualmente:

    docker compose exec nestjs npm run seed

**Cuentas de prueba creadas:**

| Rol     | Email              | Contraseña  |
|---------|-------------------|-------------|
| Admin   | admin@test.com    | password123 |
| Manager | manager@test.com  | password123 |
| Usuario | john@test.com     | password123 |
| Usuario | jane@test.com     | password123 |
| Usuario | bob@test.com      | password123 |

**Datos generados por el seed:**
- 5 usuarios (1 admin, 1 manager, 3 usuarios regulares)
- 3 proyectos
- 5 etiquetas
- 17 tareas (incluyendo subtareas y asignaciones)

---

## Rutas principales (Backend)

- `POST /auth/login` - Inicia sesión y devuelve un JWT.
- `POST /auth/register` - Crea un usuario nuevo.
- `GET /tasks` - Lista las tareas (requiere autenticación).
- `POST /tasks` - Crea una tarea (requiere autenticación).
- `PATCH /tasks/:id` - Actualiza una tarea específica.
- `DELETE /tasks/:id` - Elimina la tarea.
- `GET /health` - Health check del servidor.

**Swagger:** La documentación completa está disponible en `/docs`.

---

## Monitoreo con Portainer

<div align="center">
  <img src="https://www.portainer.io/hubfs/portainer-logo-black.svg" alt="Portainer" width="200"/>
</div>

Portainer está incluido para monitorear los contenedores:

1. Abre http://localhost:9000
2. Crea un usuario admin (primera vez)
3. Selecciona "local" environment
4. Ve a "Containers" para ver logs y stats

---

## Flujo de autenticación en el Frontend

<div align="center">
  <img src="https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fw484ctabks2g2nz15rtp.png" alt="Flujo de autenticación" width="400"/>
</div>

**Login:**

1. Se envían las credenciales al backend (`/auth/login`).
2. Si es correcto, el backend responde con un JWT y/o setea una cookie.

**Middleware en Next.js (`middleware.ts`):**

- Antes de acceder a la ruta protegida (`/dashboard`) se verifica la cookie y JWT.
- Si no estás autenticado, redirige a `/`.

---

## Scripts útiles

```bash
# Ver logs en tiempo real
docker compose logs -f nestjs

# Reiniciar un servicio
docker compose restart nestjs

# Reconstruir un servicio
docker compose build nestjs && docker compose up -d nestjs

# Ejecutar tests
docker compose run --rm nestjs-test npm test

# Detener todo
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

Si deseas ejecutar el **backend** sin Docker:

    cd backend
    npm install
    npm run start:dev
    # En el .env usar DB_HOST=localhost

Si quieres ejecutar el **frontend** sin Docker:

    cd frontend
    npm install
    npm run dev
    # En el .env usar BASE_API_URL="http://localhost:3001"

---

## CI/CD con GitHub Actions

<div align="center">
  <img src="https://i.ytimg.com/vi/IX1O4_MmUig/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAncKXdhJycm97x5MtBGCpJ9bl2_A" alt="GitHub Actions" width="400"/>
</div>

El pipeline se ejecuta automáticamente:

- **En Pull Requests:** Ejecuta tests
- **En merge a main:** Tests + Build + Push a DockerHub

El Dockerfile usa multi-stage builds optimizados:
- Imagen base `node:20-alpine` (ligera)
- Stage `test` para CI con devDependencies
- Stage `production` solo con dependencias de producción

---

## Personalización de UI (Tailwind & shadcn/ui)

<div align="center">
  <img src="https://devio2024-media.developers.io/image/upload/v1728916104/user-gen-eyecatch/kdto5ze9dbln9agt6wsh.webp" alt="Shadcn UI Example" width="400"/>
</div>

- Para modificar los estilos globales, revisa `frontend/tailwind.config.js` y `globals.css`.
- Los componentes de shadcn/ui se ubican en `frontend/components/ui/`.
- Si deseas más temas o ajustar la paleta de colores, revisa la [documentación oficial de shadcn/ui](https://ui.shadcn.com/).

---

## Licencia

Este proyecto está bajo la **MIT License**. Siéntete libre de usar, modificar y distribuir.

## Contacto

Si tienes dudas o sugerencias, puedes abrir un Issue o contactar a:

- **Autor**: Ruma
- **Email**: th3rum2@gmail.com
