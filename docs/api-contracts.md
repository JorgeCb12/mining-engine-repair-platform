# Contrato de API - Plataforma de Reparación de Motores Minería Pesada

## Arquitectura de Microservicios

---

## 1. Flujo de Autenticación y JWT

### 1.1 Ciclo de Autenticación

El flujo de autenticación sigue un modelo de **single sign-on centralizado** en el Auth Service:

1. El **Frontend** recopila credenciales de usuario (email y contraseña).
2. El Frontend realiza una petición `POST` a **Auth Service (Express)** en el endpoint `/auth/login`.
3. **Auth Service** valida las credenciales contra la tabla `users` del esquema `auth`, verifica el hash de la contraseña y genera un **JWT firmado**.
4. El Frontend almacena el JWT (típicamente en `localStorage` o `sessionStorage`).
5. En cada petición posterior al **Business Service (FastAPI)**, el Frontend incluye el JWT en el header `Authorization: Bearer <token>`.
6. **Business Service** valida **criptográficamente** la firma del JWT usando la misma clave secreta que Express, **sin contactar a Express**. Si la firma es válida y el token no ha expirado, la petición se procesa.

### 1.2 Payload del JWT

El JWT generado por Express contiene el siguiente payload:

```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@empresa.com",
  "role": "administrador|operativo",
  "iat": 1698765432,
  "exp": 1698852432
}
```

| Campo   | Tipo    | Descripción                                                                    | Ejemplo                                |
| ------- | ------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| `sub`   | UUID    | Identificador único del usuario (Subject)                                      | `550e8400-e29b-41d4-a716-446655440000` |
| `email` | string  | Email del usuario autenticado                                                  | `supervisor@mineria.com`               |
| `role`  | enum    | Rol del usuario: `administrador` u `operativo`                                 | `administrador`                        |
| `iat`   | integer | Timestamp de emisión (Unix time)                                               | `1698765432`                           |
| `exp`   | integer | Timestamp de expiración (Unix time, típicamente iat + 86400 segundos para 24h) | `1698852432`                           |

### 1.3 Transmisión y Validación del Token

**Formato del Header de Autorización:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InN1cGVydmlzb3JAbWluZXJpYS5jb20iLCJyb2xlIjoiYWRtaW5pc3RyYWRvciIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoxNjk4ODUyNDMyfQ.signature
```

**Validación en FastAPI:**

1. FastAPI extrae el token del header `Authorization`.
2. FastAPI valida **criptográficamente** la firma usando la clave secreta compartida (`JWT_SECRET`) definida en variables de entorno.
3. FastAPI verifica que el timestamp `exp` sea mayor al timestamp actual (token no expirado).
4. FastAPI rechaza peticiones con:
   - Header `Authorization` ausente.
   - Formato incorrecto (no comienza con `Bearer `).
   - Firma inválida (indica tampering o clave secreta incorrecta).
   - Token expirado.
5. Si la validación es exitosa, FastAPI extrae el payload y lo inyecta en el contexto de la petición para que los endpoints accedan a `user_id`, `email` y `role`.

**Clave Secreta Compartida:**

```
JWT_SECRET = <valor-aleatorio-generado-durante-deployment>
```

Esta variable de entorno se define de forma idéntica en ambos servicios durante el despliegue con Docker Compose. Es la única forma en que Express y FastAPI pueden validar tokens mutuamente sin comunicación directa.

---

## 2. Modelo de Datos (Esquemas y Tablas)

### 2.1 Esquema `auth` (Auth Service - Express)

#### Tabla: `users`

Almacena la identidad y credenciales de los usuarios del sistema.

| Campo           | Tipo de Dato                       | Restricciones                       | Descripción                                                                   |
| --------------- | ---------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| `id`            | UUID                               | PRIMARY KEY, NOT NULL               | Identificador único del usuario                                               |
| `email`         | VARCHAR(255)                       | UNIQUE, NOT NULL                    | Email del usuario (identificador de login)                                    |
| `password_hash` | VARCHAR(255)                       | NOT NULL                            | Hash bcrypt de la contraseña (nunca se almacena la contraseña en texto plano) |
| `role`          | ENUM('administrador', 'operativo') | NOT NULL, DEFAULT 'operativo'       | Rol asignado al usuario                                                       |
| `is_active`     | BOOLEAN                            | NOT NULL, DEFAULT true              | Indica si el usuario puede autenticarse                                       |
| `created_at`    | TIMESTAMP                          | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación del usuario                                                 |
| `updated_at`    | TIMESTAMP                          | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de última modificación                                                  |

**Índices:**

- `UNIQUE INDEX` en `email` para búsqueda rápida durante login.

**Restricciones de Negocio:**

- Un usuario solo puede ser desactivado, no eliminado (soft delete mediante `is_active = false`).
- Los roles son solo `administrador` u `operativo`. Solo administradores pueden crear y modificar usuarios.

---

### 2.2 Esquema `business` (Business Service - FastAPI)

#### Tabla: `clientes`

Almacena información de las empresas o personas que solicitan reparaciones.

| Campo                   | Tipo de Dato | Restricciones                       | Descripción                                        |
| ----------------------- | ------------ | ----------------------------------- | -------------------------------------------------- |
| `id`                    | UUID         | PRIMARY KEY, NOT NULL               | Identificador único del cliente                    |
| `razon_social`          | VARCHAR(255) | NOT NULL                            | Nombre legal de la empresa o persona               |
| `tipo_identificacion`   | VARCHAR(50)  | NOT NULL                            | Tipo de identificación (RUT, NIT, Pasaporte, etc.) |
| `numero_identificacion` | VARCHAR(50)  | UNIQUE, NOT NULL                    | Número único de identificación                     |
| `contacto_nombre`       | VARCHAR(255) | NOT NULL                            | Nombre de la persona de contacto                   |
| `contacto_email`        | VARCHAR(255) | NOT NULL                            | Email de contacto                                  |
| `contacto_telefono`     | VARCHAR(20)  | NOT NULL                            | Teléfono de contacto                               |
| `ubicacion`             | VARCHAR(500) | NOT NULL                            | Dirección física del cliente                       |
| `estado_activo`         | BOOLEAN      | NOT NULL, DEFAULT true              | Indica si el cliente está activo                   |
| `created_at`            | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro                                  |
| `updated_at`            | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de última modificación                       |

**Índices:**

- `UNIQUE INDEX` en `numero_identificacion` para validar duplicados.
- `INDEX` en `razon_social` para búsquedas rápidas.

---

#### Tabla: `motores`

Almacena el inventario de motores disponibles para reparación, cada uno es un activo único.

| Campo                    | Tipo de Dato | Restricciones                         | Descripción                                        |
| ------------------------ | ------------ | ------------------------------------- | -------------------------------------------------- |
| `id`                     | UUID         | PRIMARY KEY, NOT NULL                 | Identificador único del motor                      |
| `codigo_interno`         | VARCHAR(100) | NOT NULL                              | Código asignado internamente por el taller         |
| `numero_serie`           | VARCHAR(100) | UNIQUE, NOT NULL                      | Número de serie único del motor (marca de fábrica) |
| `fabricante`             | VARCHAR(100) | NOT NULL                              | Fabricante del motor (ej. CAT, Cummins, MAN)       |
| `modelo`                 | VARCHAR(100) | NOT NULL                              | Modelo del motor (ej. 3516, QSK60)                 |
| `tipo_motor`             | VARCHAR(100) | NOT NULL                              | Tipo de motor (ej. Motor diésel, Turboalimentado)  |
| `potencia_hp`            | INTEGER      | NOT NULL                              | Potencia nominal en caballos de fuerza             |
| `horas_de_uso`           | INTEGER      | NOT NULL, DEFAULT 0                   | Horas acumuladas de funcionamiento                 |
| `ubicacion_actual`       | VARCHAR(255) | NOT NULL                              | Donde se encuentra físicamente el motor            |
| `cliente_propietario_id` | UUID         | FOREIGN KEY REFERENCES `clientes(id)` | Relación con el cliente propietario                |
| `estado_activo`          | BOOLEAN      | NOT NULL, DEFAULT true                | Indica si el motor está activo en inventario       |
| `created_at`             | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP   | Fecha de registro en sistema                       |
| `updated_at`             | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP   | Fecha de última modificación                       |

**Índices:**

- `UNIQUE INDEX` en `numero_serie` para búsqueda por serie.
- `INDEX` en `cliente_propietario_id` para búsquedas de motores por cliente.

---

#### Tabla: `ordenes_reparacion`

Almacena cada orden de reparación (ticket de trabajo) levantada para un motor.

| Campo                     | Tipo de Dato                                                                                                         | Restricciones                                   | Descripción                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| `id`                      | UUID                                                                                                                 | PRIMARY KEY, NOT NULL                           | Identificador único de la orden                                |
| `numero_orden`            | VARCHAR(50)                                                                                                          | UNIQUE, NOT NULL                                | Número secuencial legible por usuario (ej. ORD-2024-001)       |
| `motor_id`                | UUID                                                                                                                 | FOREIGN KEY REFERENCES `motores(id)`, NOT NULL  | Motor que requiere reparación                                  |
| `cliente_id`              | UUID                                                                                                                 | FOREIGN KEY REFERENCES `clientes(id)`, NOT NULL | Cliente que solicita la reparación                             |
| `estado_actual`           | ENUM('recibido', 'en_diagnostico', 'esperando_aprobacion', 'en_reparacion', 'en_pruebas', 'finalizado', 'entregado') | NOT NULL, DEFAULT 'recibido'                    | Estado actual de la orden                                      |
| `descripcion_falla`       | TEXT                                                                                                                 | NOT NULL                                        | Descripción del problema reportado por el cliente              |
| `diagnostico`             | TEXT                                                                                                                 | NULL                                            | Análisis técnico de la falla (se completa durante diagnóstico) |
| `trabajos_realizados`     | TEXT                                                                                                                 | NULL                                            | Detalle de los trabajos ejecutados                             |
| `repuestos_utilizados`    | TEXT                                                                                                                 | NULL                                            | Lista de repuestos instalados                                  |
| `costo_estimado`          | DECIMAL(12, 2)                                                                                                       | NULL                                            | Presupuesto inicial                                            |
| `costo_final`             | DECIMAL(12, 2)                                                                                                       | NULL                                            | Costo real de la reparación                                    |
| `fecha_recepcion`         | TIMESTAMP                                                                                                            | NOT NULL, DEFAULT CURRENT_TIMESTAMP             | Fecha de recepción de la orden                                 |
| `fecha_estimada_entrega`  | TIMESTAMP                                                                                                            | NULL                                            | Fecha estimada para la entrega del motor                       |
| `fecha_real_entrega`      | TIMESTAMP                                                                                                            | NULL                                            | Fecha real en que se entregó el motor                          |
| `fecha_inicio_reparacion` | TIMESTAMP                                                                                                            | NULL                                            | Fecha en que comenzó la reparación                             |
| `fecha_completacion`      | TIMESTAMP                                                                                                            | NULL                                            | Fecha en que terminó la reparación                             |
| `usuario_asignado_id`     | UUID                                                                                                                 | NOT NULL                                        | Referencia lógica al usuario técnico asignado (sin FK física)  |
| `observaciones`           | TEXT                                                                                                                 | NULL                                            | Observaciones adicionales sobre la reparación                  |
| `created_at`              | TIMESTAMP                                                                                                            | NOT NULL, DEFAULT CURRENT_TIMESTAMP             | Timestamp de creación en BD                                    |
| `updated_at`              | TIMESTAMP                                                                                                            | NOT NULL, DEFAULT CURRENT_TIMESTAMP             | Timestamp de última modificación                               |

**Índices:**

- `UNIQUE INDEX` en `numero_orden` para búsqueda rápida por referencia visual.
- `INDEX` en `motor_id` para obtener órdenes de un motor.
- `INDEX` en `cliente_id` para obtener órdenes de un cliente.
- `INDEX` en `estado_actual` para filtrado por estado.
- `INDEX` en `usuario_asignado_id` para obtener órdenes asignadas a un técnico.

**Restricciones de Negocio:**

- No se pueden crear dos órdenes simultáneamente para el mismo motor en estado activo (en_diagnostico, en_reparacion, en_pruebas).
- El campo `usuario_asignado_id` es una referencia lógica al esquema `auth`, pero no contiene una restricción de Foreign Key para mantener la independencia entre servicios.

---

#### Tabla: `historial_estados_orden`

Auditoría inmutable de todos los cambios de estado de cada orden, permite rastrear el ciclo de vida completo.

| Campo             | Tipo de Dato                                                                                                         | Restricciones                                             | Descripción                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| `id`              | UUID                                                                                                                 | PRIMARY KEY, NOT NULL                                     | Identificador único del registro de historial                      |
| `orden_id`        | UUID                                                                                                                 | FOREIGN KEY REFERENCES `ordenes_reparacion(id)`, NOT NULL | Orden a la que pertenece este cambio                               |
| `estado_anterior` | ENUM('recibido', 'en_diagnostico', 'esperando_aprobacion', 'en_reparacion', 'en_pruebas', 'finalizado', 'entregado') | NOT NULL                                                  | Estado previo de la orden                                          |
| `estado_nuevo`    | ENUM('recibido', 'en_diagnostico', 'esperando_aprobacion', 'en_reparacion', 'en_pruebas', 'finalizado', 'entregado') | NOT NULL                                                  | Nuevo estado asignado                                              |
| `usuario_id`      | UUID                                                                                                                 | NOT NULL                                                  | Referencia lógica al usuario que realizó el cambio (sin FK física) |
| `comentario`      | TEXT                                                                                                                 | NULL                                                      | Nota o razón del cambio de estado                                  |
| `timestamp`       | TIMESTAMP                                                                                                            | NOT NULL, DEFAULT CURRENT_TIMESTAMP                       | Momento exacto del cambio                                          |

**Índices:**

- `INDEX` en `orden_id` para obtener historial completo de una orden.
- `INDEX` en `timestamp` para auditoría temporal.

**Restricciones de Negocio:**

- Este registro es de solo lectura en operación. Se inserta un nuevo registro cada vez que el estado de `ordenes_reparacion.estado_actual` cambia.
- El campo `usuario_id` es una referencia lógica al esquema `auth`, pero no contiene una restricción de Foreign Key para mantener la independencia entre servicios.

---

## 3. Contrato de Endpoints (Auth Service - Express)

El Auth Service es el **único responsable de la emisión de tokens JWT** y de la gestión de identidad. Todos los endpoints de autenticación y usuarios están en este servicio.

| Método  | Ruta                    | Descripción                                         | Requiere Auth | Rol Requerido            |
| ------- | ----------------------- | --------------------------------------------------- | ------------- | ------------------------ |
| `POST`  | `/auth/register`        | Registra un nuevo usuario en el sistema             | No            | N/A                      |
| `POST`  | `/auth/login`           | Autentica un usuario y retorna JWT                  | No            | N/A                      |
| `POST`  | `/auth/refresh`         | Refresca un token JWT expirado (si se implementa)   | Sí            | administrador, operativo |
| `POST`  | `/auth/logout`          | Revoca el token (implementación opcional)           | Sí            | administrador, operativo |
| `GET`   | `/users/me`             | Obtiene datos del usuario autenticado               | Sí            | administrador, operativo |
| `GET`   | `/users`                | Lista todos los usuarios del sistema                | Sí            | administrador            |
| `GET`   | `/users/:id`            | Obtiene detalles de un usuario específico           | Sí            | administrador            |
| `PUT`   | `/users/:id`            | Actualiza datos de un usuario (email, nombre, etc.) | Sí            | administrador            |
| `PATCH` | `/users/:id/role`       | Cambia el rol de un usuario                         | Sí            | administrador            |
| `PATCH` | `/users/:id/deactivate` | Desactiva un usuario (soft delete)                  | Sí            | administrador            |
| `PATCH` | `/users/:id/activate`   | Reactiva un usuario desactivado                     | Sí            | administrador            |

### 3.1 Descripción de Endpoints Clave

#### `POST /auth/register`

**Descripción:** Registra un nuevo usuario.
**Payload:**

```json
{
  "email": "usuario@empresa.com",
  "password": "password-segura-123",
  "role": "operativo"
}
```

**Respuesta (201):**

```json
{
  "id": "uuid",
  "email": "usuario@empresa.com",
  "role": "operativo",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `POST /auth/login`

**Descripción:** Autentica un usuario contra la tabla `users` y emite un JWT.
**Payload:**

```json
{
  "email": "usuario@empresa.com",
  "password": "password-segura-123"
}
```

**Respuesta (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "role": "administrador"
  }
}
```

#### `GET /users/me`

**Descripción:** Retorna los datos del usuario autenticado (extrae identidad del JWT).
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta (200):**

```json
{
  "id": "uuid",
  "email": "usuario@empresa.com",
  "role": "administrador",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## 4. Contrato de Endpoints (Business Service - FastAPI)

El Business Service maneja **toda la lógica de negocio** (clientes, motores, órdenes) pero **no tiene login propio**. Todos sus endpoints requieren un JWT válido emitido por Express. FastAPI valida la firma del JWT criptográficamente usando la misma clave secreta compartida, **sin contactar a Express**.

### 4.1 Validación de Token en FastAPI

**Todas las peticiones a este servicio deben incluir el header:**

```
Authorization: Bearer <token-emitido-por-express>
```

FastAPI rechazará con respuesta `401 Unauthorized` cualquier petición que:

- No incluya el header `Authorization`.
- No tenga formato `Bearer <token>`.
- Incluya un token con firma inválida.
- Incluya un token expirado (timestamp actual > `exp`).

---

### 4.2 Endpoints de Clientes

| Método   | Ruta            | Descripción                                           |
| -------- | --------------- | ----------------------------------------------------- |
| `POST`   | `/clientes`     | Crea un nuevo cliente                                 |
| `GET`    | `/clientes`     | Lista todos los clientes (con paginación y filtros)   |
| `GET`    | `/clientes/:id` | Obtiene detalles de un cliente                        |
| `PUT`    | `/clientes/:id` | Actualiza datos de un cliente                         |
| `DELETE` | `/clientes/:id` | Elimina un cliente (solo si no tiene órdenes activas) |

#### `POST /clientes`

**Descripción:** Crea un nuevo cliente en el sistema.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Payload:**

```json
{
  "razon_social": "Minería del Norte SpA",
  "tipo_identificacion": "RUT",
  "numero_identificacion": "76.123.456-K",
  "contacto_nombre": "Juan Pérez",
  "contacto_email": "juan@minadelnorte.com",
  "contacto_telefono": "+56 9 1234 5678",
  "ubicacion": "Ruta 5 Norte, km 120, Antofagasta"
}
```

**Respuesta (201):**

```json
{
  "id": "uuid",
  "razon_social": "Minería del Norte SpA",
  "tipo_identificacion": "RUT",
  "numero_identificacion": "76.123.456-K",
  "contacto_nombre": "Juan Pérez",
  "contacto_email": "juan@minadelnorte.com",
  "contacto_telefono": "+56 9 1234 5678",
  "ubicacion": "Ruta 5 Norte, km 120, Antofagasta",
  "estado_activo": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /clientes`

**Descripción:** Lista todos los clientes con paginación y filtros opcionales.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros Query:**

- `page` (integer, default 1): Número de página.
- `limit` (integer, default 10): Registros por página.
- `search` (string, optional): Busca en `razon_social` o `contacto_nombre`.

**Respuesta (200):**

```json
{
  "total": 42,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": "uuid",
      "razon_social": "Minería del Norte SpA",
      "tipo_identificacion": "RUT",
      "numero_identificacion": "76.123.456-K",
      "contacto_nombre": "Juan Pérez",
      "contacto_email": "juan@minadelnorte.com",
      "contacto_telefono": "+56 9 1234 5678",
      "ubicacion": "Ruta 5 Norte, km 120, Antofagasta",
      "estado_activo": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `GET /clientes/:id`

**Descripción:** Obtiene detalles completos de un cliente y su historial de órdenes.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta (200):**

```json
{
  "id": "uuid",
  "razon_social": "Minería del Norte SpA",
  "tipo_identificacion": "RUT",
  "numero_identificacion": "76.123.456-K",
  "contacto_nombre": "Juan Pérez",
  "contacto_email": "juan@minadelnorte.com",
  "contacto_telefono": "+56 9 1234 5678",
  "ubicacion": "Ruta 5 Norte, km 120, Antofagasta",
  "estado_activo": true,
  "created_at": "2024-01-15T10:30:00Z",
  "motores": [
    {
      "id": "uuid",
      "numero_serie": "CAT-SN-2024-001",
      "modelo": "3516",
      "potencia_hp": 1500
    }
  ],
  "total_ordenes": 5,
  "ordenes_activas": 1
}
```

---

### 4.3 Endpoints de Motores

| Método  | Ruta                  | Descripción                           |
| ------- | --------------------- | ------------------------------------- |
| `POST`  | `/motores`            | Registra un nuevo motor en inventario |
| `GET`   | `/motores`            | Lista todos los motores (con filtros) |
| `GET`   | `/motores/:id`        | Obtiene detalles de un motor          |
| `PUT`   | `/motores/:id`        | Actualiza datos de un motor           |
| `PATCH` | `/motores/:id/estado` | Cambia el estado del motor            |

#### `POST /motores`

**Descripción:** Registra un nuevo motor en el inventario.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Payload:**

```json
{
  "codigo_interno": "MOT-2024-001",
  "numero_serie": "CAT-SN-2024-001",
  "fabricante": "CAT",
  "modelo": "3516",
  "tipo_motor": "Motor diésel turboalimentado",
  "potencia_hp": 1500,
  "horas_de_uso": 8500,
  "ubicacion_actual": "Taller Central, Nave A",
  "cliente_propietario_id": "uuid"
}
```

**Respuesta (201):**

```json
{
  "id": "uuid",
  "codigo_interno": "MOT-2024-001",
  "numero_serie": "CAT-SN-2024-001",
  "fabricante": "CAT",
  "modelo": "3516",
  "tipo_motor": "Motor diésel turboalimentado",
  "potencia_hp": 1500,
  "horas_de_uso": 8500,
  "ubicacion_actual": "Taller Central, Nave A",
  "cliente_propietario_id": "uuid",
  "estado_activo": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /motores`

**Descripción:** Lista todos los motores con filtros opcionales.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros Query:**

- `page` (integer, default 1): Número de página.
- `limit` (integer, default 10): Registros por página.
- `cliente_id` (uuid, optional): Mostrar solo motores de un cliente.
- `search` (string, optional): Buscar por número de serie, código interno o modelo.

**Respuesta (200):**

```json
{
  "total": 87,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": "uuid",
      "codigo_interno": "MOT-2024-001",
      "numero_serie": "CAT-SN-2024-001",
      "fabricante": "CAT",
      "modelo": "3516",
      "tipo_motor": "Motor diésel turboalimentado",
      "potencia_hp": 1500,
      "horas_de_uso": 8500,
      "ubicacion_actual": "Taller Central, Nave A",
      "cliente_propietario_id": "uuid",
      "estado_activo": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `GET /motores/:id`

**Descripción:** Obtiene detalles completos de un motor y sus órdenes de reparación.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta (200):**

```json
{
  "id": "uuid",
  "codigo_interno": "MOT-2024-001",
  "numero_serie": "CAT-SN-2024-001",
  "fabricante": "CAT",
  "modelo": "3516",
  "tipo_motor": "Motor diésel turboalimentado",
  "potencia_hp": 1500,
  "horas_de_uso": 8500,
  "ubicacion_actual": "Taller Central, Nave A",
  "cliente_propietario_id": "uuid",
  "cliente": {
    "id": "uuid",
    "razon_social": "Minería del Norte SpA"
  },
  "ordenes_reparacion": [
    {
      "id": "uuid",
      "numero_orden": "ORD-2024-001",
      "estado_actual": "entregado",
      "fecha_recepcion": "2024-01-10T08:00:00Z"
    }
  ],
  "estado_activo": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 4.4 Endpoints de Órdenes de Reparación

| Método  | Ruta                     | Descripción                                         |
| ------- | ------------------------ | --------------------------------------------------- |
| `POST`  | `/ordenes`               | Crea una nueva orden de reparación                  |
| `GET`   | `/ordenes`               | Lista órdenes (con filtros y agrupación por estado) |
| `GET`   | `/ordenes/:id`           | Obtiene detalles completos de una orden             |
| `PATCH` | `/ordenes/:id/estado`    | Cambia el estado de la orden                        |
| `GET`   | `/ordenes/:id/historial` | Obtiene el historial de cambios de estado           |

#### `POST /ordenes`

**Descripción:** Crea una nueva orden de reparación para un motor.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Payload:**

```json
{
  "motor_id": "uuid",
  "cliente_id": "uuid",
  "descripcion_falla": "Ruidos anormales en la sección de cigüeñal, pérdida de presión de aceite",
  "fecha_estimada_entrega": "2024-01-25T17:00:00Z",
  "costo_estimado": 15000.0,
  "usuario_asignado_id": "uuid"
}
```

**Respuesta (201):**

```json
{
  "id": "uuid",
  "numero_orden": "ORD-2024-042",
  "motor_id": "uuid",
  "cliente_id": "uuid",
  "estado_actual": "recibido",
  "descripcion_falla": "Ruidos anormales en la sección de cigüeñal, pérdida de presión de aceite",
  "diagnostico": null,
  "trabajos_realizados": null,
  "repuestos_utilizados": null,
  "costo_estimado": 15000.0,
  "costo_final": null,
  "fecha_recepcion": "2024-01-15T10:30:00Z",
  "fecha_estimada_entrega": "2024-01-25T17:00:00Z",
  "fecha_real_entrega": null,
  "fecha_inicio_reparacion": null,
  "fecha_completacion": null,
  "usuario_asignado_id": "uuid",
  "observaciones": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /ordenes`

**Descripción:** Lista órdenes de reparación con paginación, filtros y agrupación por estado.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Parámetros Query:**

- `page` (integer, default 1): Número de página.
- `limit` (integer, default 10): Registros por página.
- `estado` (enum, optional): Filtrar por un estado específico.
- `cliente_id` (uuid, optional): Mostrar solo órdenes de un cliente.
- `motor_id` (uuid, optional): Mostrar solo órdenes de un motor.
- `usuario_asignado_id` (uuid, optional): Mostrar órdenes asignadas a un técnico.
- `group_by_estado` (boolean, default false): Si es true, agrupa las órdenes por estado en lugar de usar paginación.

**Respuesta (200) - sin agrupación:**

```json
{
  "total": 156,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": "uuid",
      "numero_orden": "ORD-2024-042",
      "motor_id": "uuid",
      "cliente_id": "uuid",
      "estado_actual": "en_reparacion",
      "descripcion_falla": "Ruidos anormales en la sección de cigüeñal",
      "costo_estimado": 15000.0,
      "costo_final": null,
      "fecha_recepcion": "2024-01-15T10:30:00Z",
      "fecha_estimada_entrega": "2024-01-25T17:00:00Z",
      "fecha_real_entrega": null,
      "fecha_inicio_reparacion": "2024-01-16T08:00:00Z",
      "usuario_asignado_id": "uuid"
    }
  ]
}
```

**Respuesta (200) - con agrupación por estado:**

```json
{
  "recibido": {
    "total": 12,
    "ordenes": [
      {
        "id": "uuid",
        "numero_orden": "ORD-2024-040",
        "cliente_id": "uuid",
        "estado_actual": "recibido",
        "fecha_recepcion": "2024-01-14T14:20:00Z"
      }
    ]
  },
  "en_diagnostico": {
    "total": 8,
    "ordenes": []
  },
  "esperando_aprobacion": {
    "total": 3,
    "ordenes": []
  },
  "en_reparacion": {
    "total": 5,
    "ordenes": []
  },
  "en_pruebas": {
    "total": 4,
    "ordenes": []
  },
  "finalizado": {
    "total": 118,
    "ordenes": []
  },
  "entregado": {
    "total": 6,
    "ordenes": []
  }
}
```

#### `GET /ordenes/:id`

**Descripción:** Obtiene detalles completos de una orden, incluyendo cliente, motor, diagnóstico e historial de estados.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta (200):**

```json
{
  "id": "uuid",
  "numero_orden": "ORD-2024-042",
  "motor": {
    "id": "uuid",
    "numero_serie": "CAT-SN-2024-001",
    "modelo": "3516",
    "potencia_hp": 1500,
    "horas_de_uso": 8500
  },
  "cliente": {
    "id": "uuid",
    "razon_social": "Minería del Norte SpA",
    "contacto_nombre": "Juan Pérez",
    "contacto_email": "juan@minadelnorte.com"
  },
  "estado_actual": "en_reparacion",
  "descripcion_falla": "Ruidos anormales en la sección de cigüeñal, pérdida de presión de aceite",
  "diagnostico": "Desgaste de cojinetes de bancada, cambio de anillos de pistón y filtro de aceite recomendado",
  "trabajos_realizados": "Desarmado de motor, reemplazo de cojinetes, cambio de anillos, limpieza interna, pruebas de presión",
  "repuestos_utilizados": "Cojinetes de bancada grade +0.50, juego anillos pistón, filtro aceite sintético",
  "costo_estimado": 15000.0,
  "costo_final": null,
  "fecha_recepcion": "2024-01-15T10:30:00Z",
  "fecha_estimada_entrega": "2024-01-25T17:00:00Z",
  "fecha_real_entrega": null,
  "fecha_inicio_reparacion": "2024-01-16T08:00:00Z",
  "fecha_completacion": null,
  "usuario_asignado_id": "uuid",
  "observaciones": "Motor en proceso de ensamblaje. Se espera iniciar pruebas mañana.",
  "historial": [
    {
      "estado_anterior": "recibido",
      "estado_nuevo": "en_diagnostico",
      "usuario_id": "uuid",
      "comentario": "Orden asignada a diagnóstico inicial",
      "timestamp": "2024-01-16T08:00:00Z"
    },
    {
      "estado_anterior": "en_diagnostico",
      "estado_nuevo": "esperando_aprobacion",
      "usuario_id": "uuid",
      "comentario": "Diagnóstico completado, aguardando aprobación del cliente",
      "timestamp": "2024-01-16T14:30:00Z"
    },
    {
      "estado_anterior": "esperando_aprobacion",
      "estado_nuevo": "en_reparacion",
      "usuario_id": "uuid",
      "comentario": "Cliente aprobó presupuesto, inicia reparación",
      "timestamp": "2024-01-17T09:00:00Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `PATCH /ordenes/:id/estado`

**Descripción:** Cambia el estado de una orden de reparación y crea un registro en el historial.
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Payload:**

```json
{
  "estado_nuevo": "en_pruebas",
  "comentario": "Motor ensamblado, inicia protocolo de pruebas de 48 horas"
}
```

**Respuesta (200):**

```json
{
  "id": "uuid",
  "numero_orden": "ORD-2024-042",
  "estado_anterior": "en_reparacion",
  "estado_nuevo": "en_pruebas",
  "timestamp": "2024-01-20T14:00:00Z",
  "usuario_id": "uuid",
  "comentario": "Motor ensamblado, inicia protocolo de pruebas de 48 horas"
}
```

#### `GET /ordenes/:id/historial`

**Descripción:** Retorna el historial completo de cambios de estado de una orden (auditoría).
**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta (200):**

```json
{
  "orden_id": "uuid",
  "numero_orden": "ORD-2024-042",
  "total_cambios": 5,
  "historial": [
    {
      "id": "uuid",
      "estado_anterior": "recibido",
      "estado_nuevo": "en_diagnostico",
      "usuario_id": "uuid",
      "comentario": "Orden asignada a diagnóstico inicial",
      "timestamp": "2024-01-16T08:00:00Z"
    },
    {
      "id": "uuid",
      "estado_anterior": "en_diagnostico",
      "estado_nuevo": "esperando_aprobacion",
      "usuario_id": "uuid",
      "comentario": "Diagnóstico completado, aguardando aprobación del cliente",
      "timestamp": "2024-01-16T14:30:00Z"
    },
    {
      "id": "uuid",
      "estado_anterior": "esperando_aprobacion",
      "estado_nuevo": "en_reparacion",
      "usuario_id": "uuid",
      "comentario": "Cliente aprobó presupuesto, inicia reparación",
      "timestamp": "2024-01-17T09:00:00Z"
    },
    {
      "id": "uuid",
      "estado_anterior": "en_reparacion",
      "estado_nuevo": "en_pruebas",
      "usuario_id": "uuid",
      "comentario": "Motor ensamblado, inicia protocolo de pruebas de 48 horas",
      "timestamp": "2024-01-20T14:00:00Z"
    },
    {
      "id": "uuid",
      "estado_anterior": "en_pruebas",
      "estado_nuevo": "finalizado",
      "usuario_id": "uuid",
      "comentario": "Motor aprobado en todas las pruebas, costo final: $16.500",
      "timestamp": "2024-01-22T16:45:00Z"
    }
  ]
}
```

---

## Resumen de Restricciones y Seguridad

1. **Auth Service (Express)** es el único emisor de tokens JWT.
2. **Business Service (FastAPI)** valida tokens **criptográficamente sin contactar Express**, usando la clave secreta compartida.
3. Todo acceso a endpoints de negocio requiere un JWT válido en el header `Authorization: Bearer <token>`.
4. Los esquemas `auth` y `business` están lógicamente separados. Express solo toca `auth`, FastAPI solo toca `business`.
5. FastAPI rechaza peticiones sin token, con token expirado o con firma inválida con `401 Unauthorized`.
6. El historial de estados es inmutable: se inserta un nuevo registro cada cambio, nunca se actualiza.
7. Los usuarios solo pueden ser desactivados, no eliminados (soft delete).
8. Los campos `usuario_asignado_id` y `usuario_id` en el esquema `business` son referencias lógicas al esquema `auth` sin restricciones de Foreign Key, preservando la independencia entre servicios.
