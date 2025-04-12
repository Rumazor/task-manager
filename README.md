# Task Manager App

¡Bienvenido/a a **Task Manager**!  
Este proyecto consiste en un **backend** en [NestJS](https://nestjs.com) y un **frontend** en [Next.js](https://nextjs.org) para administrar tareas con autenticación JWT, manejo de sesiones vía cookies y una interfaz moderna usando [TailwindCSS](https://tailwindcss.com) y [shadcn/ui](https://ui.shadcn.com).

- Desarrollado como parte de una **prueba técnica** para demostrar habilidades en el desarrollo de aplicaciones full-stack utilizando tecnologías modernas como NestJS, Next.js, Docker, TypeORM, y Tailwind con shadcn/ui.

<div align="center">
  <img src="https://startinfinity.s3.us-east-2.amazonaws.com/production/blog/post/5/main/1SvzKctRCi8bwB0QPdOZkBP0pRhsOqZpl0wjs6y0.png" alt="Task Manager Preview" width="400"/>
</div>

## Características

- **Backend**:

  - [NestJS](https://nestjs.com) con [TypeORM](https://typeorm.io) y [PostgreSQL](https://www.postgresql.org).
  - Autenticación con **JWT** y [Passport](http://www.passportjs.org/).
  - Protección de endpoints con Guards.
  - Módulo de `Users` y `Tasks` para la lógica de usuarios y tareas.
  - Estructura modular y escalable.

- **Frontend**:

  - [Next.js 15.2.4](https://nextjs.org/docs)
  - Interfaz con [TailwindCSS](https://tailwindcss.com) y componentes de [shadcn/ui](https://ui.shadcn.com).
  - Autenticación con **JWT** y cookies, protección de páginas a través de `middleware.ts`.
  - Diseño responsive y experiencia de usuario moderna.

- **Contenedores Docker** para un despliegue sencillo:
  - Backend (NestJS)
  - Frontend (Next.js)
  - Base de datos (Postgres)

---

## Requisitos previos

- [Docker](https://www.docker.com/get-started) instalado.
- [Docker Compose](https://docs.docker.com/compose/) (la mayoría de instalaciones de Docker Desktop ya lo incluyen).
- (Opcional) Node.js 18+ si deseas ejecutar el proyecto fuera de Docker.

---

## Configuración de variables de entorno

Crea un archivo **`.env`** (en la **raíz** del proyecto) con el siguiente contenido (ejemplo):

```bash
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_NAME=db_task_manager
DB_USER=postgres
DB_PASSWORD=db_password
JWT_SECRET=supersecreto
BASE_API_URL="http://nestjs:3000"

```

Nota: Ajusta las credenciales según tus necesidades.

# Instrucciones de instalación y arranque (con Docker)

Clona este repositorio:

    git clone https://github.com/usuario/task-manager.git
    cd task-manager

Crea tu archivo `.env` en la raíz, con los valores adecuados (ver sección anterior).

Construye los contenedores:

    docker-compose build

Inicia los servicios:

    docker-compose up

- El **backend** arrancará en `localhost:3001`.
- El **frontend** se expondrá en `localhost:3000`.
- La base de datos **Postgres** estará en `localhost:5432`.

<div align="center" style="margin-top: 60px; margin-bottom: 60px;">
  <img src="https://geekflare.com/es/wp-content/uploads/2022/11/docker.webp" alt="Docker logs" width="600"/>
</div>

Abre tu navegador en `http://localhost:3000` para ver la interfaz de Next.js.

El backend (NestJS) responderá en `http://localhost:3001`.

## Rutas principales (Backend)

- `POST /auth/login`  
  Inicia sesión y devuelve un JWT (además de configurar la cookie).

- `POST /auth/register`  
  Crea un usuario nuevo.

- `GET /tasks`  
  Lista las tareas (requiere estar autenticado).

- `POST /tasks`  
  Crea una tarea (requiere estar autenticado).

- `PATCH /tasks/:id`  
  Actualiza una tarea específica.

- `DELETE /tasks/:id`  
  Elimina la tarea.

Asegúrate de pasar el JWT (o la cookie) con cada request si la ruta está protegida.

- **Nota**: Este proyecto incluye un archivo `insomnia_task_manager.json` que puedes importar en Insomnia para probar los endpoints descritos arriba. El archivo configura las rutas con ejemplos de cuerpos de solicitud y autenticación con JWT.

## Flujo de autenticación en el Frontend

**Login:**

1. Se envían las credenciales al backend (`/auth/login`).
2. Si es correcto, el backend responde con un JWT y/o setea una cookie.

**Middleware en Next.js (`middleware.ts`):**

- Antes de acceder a la ruts protegida (`/dashboard`) se verifica la cookie y JWT.
- Si no estás autenticado, redirige a `/`.

<div align="center">
  <img src="https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fw484ctabks2g2nz15rtp.png" alt="Flujo de autenticación" width="700"/>
</div>

## Scripts útiles

Si deseas ejecutar el **backend** sin Docker:

    cd backend
    yarn install
    yarn start:dev

Si quieres ejecutar el **frontend** sin Docker:

    cd frontend
    yarn install
    yarn dev

En este caso, asegúrate de configurar tu `.env` en Next.js y NestJS para apuntar a la base de datos adecuada y que Next.js consuma la URL correcta del backend.

## Personalización de UI (Tailwind & shadcn/ui)

- Para modificar los estilos globales, revisa `frontend/tailwind.config.js` y `globals.css`.
- Los componentes de shadcn/ui se ubican generalmente en `frontend/components/ui/`.
- Si deseas más temas o ajustar la paleta de colores, revisa la [documentación oficial de shadcn/ui](https://ui.shadcn.com/).

<div align="center">
  <img src="https://devio2024-media.developers.io/image/upload/v1728916104/user-gen-eyecatch/kdto5ze9dbln9agt6wsh.webp" alt="Shadcn UI Example" width="600"/>
</div>

## Migraciones (TypeORM)

Si implementas migraciones en NestJS con TypeORM, podrías necesitar ejecutarlas antes de arrancar la app en producción. Por ejemplo:

    docker-compose exec nestjs yarn typeorm migration:run

O configura un script para que corra automáticamente antes de `start:prod`.

## Licencia

Este proyecto está bajo la **MIT License**. Siéntete libre de usar, modificar y distribuir.

## Contacto

Si tienes dudas o sugerencias, puedes abrir un Issue o contactar a:

- **Autor/a**: Ruma
- **Email**: th3rum2@gmail.com
# task-manager
# task-manager
# task-manager
