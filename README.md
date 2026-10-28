# Mining Engine Repair Platform

Plataforma full-stack moderna y robusta diseñada para la gestión integral de órdenes de servicio, clientes y motores en talleres de reparación para la industria minera.

---

## Arquitectura del Sistema

El sistema está compuesto por tres servicios desacoplados:

1. **Auth Service (Backend Node.js / Express + Prisma):**
   - Autenticación y autorización basada en JSON Web Tokens (JWT).
   - Gestión de usuarios y roles (`administrador`, `operativo`).
   - Esquema de base de datos dedicado (`auth`).

2. **Business Service (Backend Python / FastAPI + SQLAlchemy):**
   - Gestión de clientes, motores y órdenes de reparación con seguimiento de historial de estados.
   - Verificación de tokens JWT emitidos por el servicio de autenticación.
   - Esquema de base de datos dedicado (`business`).

3. **Frontend (React + Vite + TypeScript + Tailwind CSS + React Router):**
   - Interfaz de usuario intuitiva, moderna y responsive.
   - Panel de control (Dashboard), directorios de clientes y motores, gestión de usuarios (admin) y detalle de órdenes interactivo.

---

## Requisitos Previos

Asegúrate de tener instalado en tu entorno de desarrollo:

- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (versión 20 o superior)
- [Python](https://www.python.org/) (versión 3.12 o superior)

---

## Instrucciones de Instalación y Configuración

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/JorgeCb12/mining-engine-repair-platform.git
   cd mining-engine-repair-platform
   ```

2. **Configurar las variables de entorno:**
   Copia el archivo de ejemplo [.env.example](.env.example) a `.env` en la raíz del proyecto y configura tus credenciales de base de datos (PostgreSQL / Supabase) y claves secretas:
   ```bash
   cp .env.example .env
   ```

---

## Ejecución del Proyecto

### Opción A: Con Docker Compose (Recomendado)

Para levantar todos los servicios en contenedores optimizados:

```bash
docker compose up --build
```

### Opción B: Ejecución local (Desarrollo)

Si prefieres ejecutar cada servicio de manera independiente:

- **Auth Service:**
  ```bash
  cd auth-service
  npm ci
  npx prisma generate
  npm run dev
  ```
- **Business Service:**
  ```bash
  cd business-service
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000
  ```
- **Frontend:**
  ```bash
  cd frontend
  npm ci
  npm run dev
  ```

---

## URLs de Acceso

- **Frontend (SPA):** [http://localhost:5173](http://localhost:5173)
- **Auth Service (Express API):** [http://localhost:3001](http://localhost:3001)
- **Business Service (FastAPI):** [http://localhost:8000](http://localhost:8000)
- **Documentación Interactiva Swagger (FastAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Mecanismo de Seguridad

- **JWT Compartido:** Los tokens generados en el `Auth Service` son validados criptográficamente en el `Business Service` mediante un secreto compartido (`JWT_SECRET`).
- **Control de Acceso Basado en Roles (RBAC):** Restricción de rutas y endpoints administrativos (como la gestión de usuarios) exclusiva para el rol `administrador`.

---

## Créditos y Autor

Desarrollado para la prueba técnica de la plataforma de reparación de motores mineros.
