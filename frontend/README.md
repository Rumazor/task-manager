# Frontend - Task Manager

Interfaz web con Next.js para gestión de tareas.

## Stack

- Next.js 15
- TailwindCSS + shadcn/ui
- Socket.io (real-time)

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Produccion
npm start
```

## Variables de entorno

Crear `.env` basado en `.env.example`:

```bash
# URL del backend (interno para SSR)
BASE_API_URL=http://localhost:3001

# URL del backend (publico para cliente)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Estructura

```
frontend/
├── app/              # Rutas (App Router)
├── components/       # Componentes React
│   └── ui/          # shadcn/ui components
├── contexts/        # React contexts
├── hooks/           # Custom hooks
└── lib/             # Utilidades
```
