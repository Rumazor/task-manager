# Aplicación de gestor de tareas

Este proyecto consiste en un **backend** en [NestJS](https://nestjs.com) y un **frontend** en [Next.js](https://nextjs.org) para administrar tareas con autenticación JWT, manejo de sesiones vía cookies y una interfaz moderna usando [TailwindCSS](https://tailwindcss.com) y [shadcn/ui](https://ui.shadcn.com).

<div align="center">
  <img src="https://startinfinity.s3.us-east-2.amazonaws.com/production/blog/post/5/main/1SvzKctRCi8bwB0QPdOZkBP0pRhsOqZpl0wjs6y0.png" alt="Task Manager Preview" width="400"/>
</div>

## Características

- **Backend**:

  - [NestJS](https://nestjs.com) con [TypeORM](https://typeorm.io) y [PostgreSQL](https://www.postgresql.org).
  - Autenticación con **JWT** y [Passport](http://www.passportjs.org/).
  - Protección de endpoints con Guards.
  - Módulo de `Auth` y `Tasks` para la lógica de usuarios y tareas.
  - Estructura modular y escalable.
  - Documentación de la API con Swagger, disponible en la ruta /docs.

- **Frontend**:

  - [Next.js 15.2.4](https://nextjs.org/docs)
  - Interfaz con [TailwindCSS](https://tailwindcss.com) y componentes de [shadcn/ui](https://ui.shadcn.com).
  - Autenticación con **JWT** y cookies, protección de páginas a través de `middleware.ts`.
  - Diseño responsive y experiencia de usuario moderna.

- **Contenedores Docker** para un despliegue sencillo:

  - Backend (NestJS)
  - Frontend (Next.js)
  - Base de datos (Postgres)

- **CI/CD con GitHub Actions**
  - Integración continua con pruebas automatizadas
  - Pipeline de construcción y verificación de calidad
  - Ejecución de tests en entorno aislado

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

<div align="center" style="margin-top: 60px; margin-bottom: 60px;">
  <img src="https://geekflare.com/es/wp-content/uploads/2022/11/docker.webp" alt="Docker logs" width="400"/>
</div>

Clona este repositorio:

    git clone https://github.com/Rumazor/task-manager
    cd task-manager

Crea tu archivo `.env` en la raíz, con los valores adecuados (ver sección anterior).

Construye los contenedores:

    docker-compose build

Inicia los servicios:

    docker-compose up

- El **backend** arrancará en `localhost:3001`.
- El **frontend** se expondrá en `localhost:3000`.

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

Doc Swagger: La documentación generada con Swagger está disponible en la ruta /docs (asumiendo que el backend corre localmente en el puerto 3001).

- **Nota**: Este proyecto incluye un archivo `insomnia_task_manager.json` que puedes importar en Insomnia para probar los endpoints descritos arriba. El archivo configura las rutas con ejemplos de cuerpos de solicitud y autenticación con JWT.

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

## Scripts útiles

Si deseas ejecutar el **backend** sin Docker:

    cd backend
    yarn install
    yarn start:dev
    En el.env DB_HOST colocar **localhost**

Si quieres ejecutar el **frontend** sin Docker:

    cd frontend
    yarn install
    yarn dev
    En el .env BASE_API_URL colocar **"http://localhost:3000"**

En este caso, asegúrate de configurar tu `.env` en Next.js y NestJS para apuntar a la base de datos adecuada y que Next.js consuma la URL correcta del backend.

## Base de datos

<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/1200px-Postgresql_elephant.svg.png" alt="Shadcn UI Example" width="200"/>
</div>

### El backend requiere PostgreSQL.

Tienes dos opciones:

- Opción 1:

  Usar Docker solo para PostgreSQL:

      cd backend
      docker-compose up

  Asegúrate de descomentar la sección del servicio de PostgreSQL en el archivo docker-compose.yml del backend:

      services:
      db:
      image: postgres:14.3
      restart: always
      ports: - '${DB_PORT}:${DB_PORT}'
      environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
      volumes: - ./posgres:/var/lib/postgresql/data

  Esto iniciará solo el contenedor de PostgreSQL definido en el archivo docker-compose.yml que se encuentra en la carpeta /backend.

- Opción 2:

  Usar PostgreSQL instalado localmente o cualquier otra instalación de PostgreSQL a la que tengas acceso. Asegúrate de actualizar las credenciales en tu archivo .env según corresponda.

## CI/CD con GitHub Actions

<div align="center">
  <img src="https://i.ytimg.com/vi/IX1O4_MmUig/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAncKXdhJycm97x5MtBGCpJ9bl2_A" alt="Shadcn UI Example" width="400"/>
</div>

Este proyecto implementa un pipeline de integración continua mediante GitHub Actions que se ejecuta automáticamente en cada push a la rama principal

Para automatizar la ejecución de tests (CI) cada vez que hagas un push, puedes usar este flujo básico de GitHub Actions. Solo necesitas:

- Crear la carpeta .github/workflows/ en la raíz del proyecto.
- Dentro de ella, un archivo ci.yml (por ejemplo) con este contenido:

      name: CI Pipeline

      on:
      push:
      branches: [ "main" ]
      pull_request:

      jobs:
      build-and-test:
      runs-on: ubuntu-latest

      steps: - name: Check out the repository
      uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build containers
        run: docker compose -f docker-compose.yml build

      - name: Start only the database (Postgres) in background
        run: docker compose -f docker-compose.yml up -d postgres

      - name: Wait for Postgres to be ready
        run: |
          echo "Esperando a que Postgres inicie..."
          until nc -z localhost 5432; do
            echo "Postgres no está listo aún..."
            sleep 1
          done
          echo "¡Postgres está listo!"

      - name: Run NestJS tests
        run: docker compose -f docker-compose.yml run --rm nestjs yarn test

      - name: Cleanup
        if: always()
        run: docker compose -f docker-compose.yml down -v

El pipeline incluye:

- Construcción de contenedores Docker
- Inicialización de la base de datos PostgreSQL
- Ejecución de tests automatizados
- Limpieza de recursos al finalizar

## Personalización de UI (Tailwind & shadcn/ui)

<div align="center">
  <img src="https://devio2024-media.developers.io/image/upload/v1728916104/user-gen-eyecatch/kdto5ze9dbln9agt6wsh.webp" alt="Shadcn UI Example" width="400"/>
</div>

- Para modificar los estilos globales, revisa `frontend/tailwind.config.js` y `globals.css`.
- Los componentes de shadcn/ui se ubican generalmente en `frontend/components/ui/`.
- Si deseas más temas o ajustar la paleta de colores, revisa la [documentación oficial de shadcn/ui](https://ui.shadcn.com/).

## Licencia

Este proyecto está bajo la **MIT License**. Siéntete libre de usar, modificar y distribuir.

## Contacto

Si tienes dudas o sugerencias, puedes abrir un Issue o contactar a:

- **Autor/a**: Ruma
- **Email**: th3rum2@gmail.com
