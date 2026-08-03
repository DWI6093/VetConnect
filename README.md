## Inicio rapido (Onboarding)

### Requisitos

- Node.js 22
- npm 11.6.2

### Configuracion inicial

1. Instalar dependencias del frontend:

```powershell
cd frontend
npm install
```

2. Instalar dependencias del backend:

```powershell
cd ..\backend
npm install
```

3. Variables de entorno (backend):

En la raiz del repo existe `.env.example` con las variables base. Para desarrollo local, copia su contenido a `backend/.env` y ajusta lo necesario (por ejemplo `API_URL` a `http://localhost:3000` si aplica):

```powershell
Copy-Item ..\.env.example .\.env
```

### Arrancar el proyecto (modo desarrollo)

En dos terminales separadas:

Frontend (Angular 21) en `http://localhost:4200`:

```powershell
cd frontend
npm start
```

Backend (NestJS 11.0.1) en `http://localhost:3000`:

```powershell
cd backend
npm run start:dev
```

### Comandos utiles

Frontend:

```powershell
cd frontend
npm test
npm run build
```

Backend:

```powershell
cd backend
npm test
npm run lint
npm run build
```

## Estructura de carpetas del Frontend

```
src/app/
│
├── core/                          # Solo singletons globales
│   ├── services/                  # Services globales
│   ├── interceptors/              # HTTP interceptors globales
│   ├── guards/                    # Guards globales
│   └── config/                    # Environment, constantes
│
├── features/                      # Features del frontend (cada feature es un módulo)
│   ├── autenticacion/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   └── registro/
│   │   ├── components/            # Componentes internos del feature
│   │   ├── services/              # autenticacion.service.ts
│   │   └── models/                # interfaces/DTOs del feature
│   │
│   ├── gestion-negocios/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── models/
│   │
│   ├── perfil-negocio/
│   ├── calificaciones/
│   ├── suscripciones/
│   ├── pagos/
│   └── administracion/
│
├── layouts/
│   ├── main-layout/
│   ├── auth-layout/
│   └── admin-layout/
│
└── shared/                        # Reutilizable entre features
    ├── components/                # Botones, cards, modales genéricos
    ├── directives/
    ├── pipes/
    └── models/                    # Interfaces compartidas (Usuario, Plan, etc.)

```

## Despliegue gratuito y CI/CD

La configuración del repositorio separa el despliegue en dos servicios:

- `render.yaml` crea en Render un Web Service gratuito para el backend NestJS y solicita las variables de conexión a Neon.
- `frontend/vercel.json` configura Vercel para compilar y servir la SPA de Angular desde `frontend`.
- `.github/workflows/ci.yml` ejecuta lint, validación de Prisma y builds en cada pull request y en `main`/`develop`.

### Render

1. En Neon crea el proyecto y copia sus cadenas de conexión: la **pooled** para `DATABASE_URL` y la directa para `DIRECT_DATABASE_URL`.
2. En Render selecciona **New > Blueprint**, conecta el repositorio y usa el archivo `render.yaml`.
3. Cuando lo solicite, define `DATABASE_URL`, `DIRECT_DATABASE_URL` y `FRONTEND_URL`; Render generará `JWT_SECRET` y `REFRESH_SECRET`.
4. Las migraciones se ejecutan durante cada build mediante `npm run db:migrate`, usando la conexión directa de Neon.
5. Si el nombre `vetconnect-api` ya está ocupado y Render asigna otra URL, usa la URL real del servicio al configurar `API_URL` en Vercel.

### Vercel

1. Crea un proyecto nuevo conectado al repositorio y establece `frontend` como **Root Directory**.
2. Mantén el comando de build `npm run build` y añade la variable `API_URL` en Preview y Production con la URL pública del backend de Render, sin `/` final.
3. Cada pull request tendrá un preview y cada push a la rama de producción desplegará automáticamente la aplicación.

### Consideraciones del plan gratuito

El Web Service gratuito de Render puede suspenderse después de 15 minutos sin tráfico y tardar aproximadamente un minuto en reactivarse. Neon administra la base de datos por separado y aplicará los límites de su propio plan; conserva las cadenas de conexión como secretos.

## Estructura de carpetas del Backend

```
src/
│
├── modules/                        
│   ├── auth/                      
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── strategies/            # JWT, Passport
│   ├── usuarios/
│   ├── negocios/
│   ├── productos/
│   ├── imagenes/                  
│   ├── calificaciones/
│   ├── suscripciones/
│   ├── planes/
│   ├── pagos/                    
│   ├── servicios/
│   ├── administracion/
│   └── notificaciones/
│
├── common/                        # Guards, interceptors, decorators globales
│   ├── guards/
│   ├── interceptors/
│   ├── decorators/
│   └── filters/
│
├── config/                        # Variables de entorno, config de DB
│
├── database/                      
│   ├── entities/                  
│   │   ├── usuario.entity.ts
│   │   ├── rol.entity.ts
│   │   ├── categoria.entity.ts
│   │   ├── negocio.entity.ts
│   │   ├── producto.entity.ts
│   │   ├── servicio.entity.ts
│   │   ├── calificacion.entity.ts
│   │   ├── suscripcion.entity.ts
│   │   ├── plan.entity.ts
│   │   ├── pago.entity.ts
│   │   └── imagen.entity.ts
│   └── migrations/
│
└── main.ts
```

