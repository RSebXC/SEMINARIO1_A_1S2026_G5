# CloudCinema — Backend Python (FastAPI)

## Requisitos

- Python 3.10+
- MySQL corriendo localmente
- Base de datos `cloudCinema` creada (ver `../db/cloudCinema.sql`)

---

## Configuración inicial

### 1. Crear y activar el entorno virtual

```powershell
python -m venv venv
.\venv\Scripts\Activate
```

### 2. Instalar dependencias

```powershell
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz de `backend-python/` con el siguiente contenido:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=cloudCinema

SECRET_KEY=tu_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 (opcional — dejar vacío para desarrollo local)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=
S3_PUBLIC_BASE_URL=
```

### 4. Iniciar el servidor

```powershell
uvicorn app.main:app --reload
```

El servidor estará disponible en: `http://127.0.0.1:8000`  
Documentación Swagger UI: `http://127.0.0.1:8000/docs`

---

## Contratos de la API

### Autenticación

Los endpoints protegidos requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

---

### Colletion Postman

https://www.postman.com/dfad55/workspace/seminario-usac/collection/50671201-60679255-6d43-4bca-83ff-44bcb73ecec3?action=share&creator=50671201

### POST `http://127.0.0.1:8000/register`
**Content-Type:** `multipart/form-data`

**Nota:** Si se require probar en postman, se debe enviar en x-www-form-urlencoded los campos que se describen en la parte inferior

**Sugerencia:** Es mejor probar en Thunder client en la parte de form los campos que se describen en la parte inferior


| Campo | Tipo |
|---|---|
| `email` | string |
| `nombre_completo` | string |
| `password` | string |
| `confirm_password` | string |
| `foto_perfil` | file |

**Respuesta exitosa `201`:**
```json
{
  "message": "Usuario registrado",
  "id_usuario": 1,
  "foto_perfil": null
}
```

**Errores:**
- `400` — Contraseñas no coinciden
- `409` — El correo ya está registrado

---

### POST `http://127.0.0.1:8000/login`

Inicia sesión y retorna un token JWT.

**Autenticación:** No requerida  
**Content-Type:** `application/json`

### `Request` 
```json
{
  "email": "usuario@gmail.com",
  "password": "123456"
}
```

### `Response`
**Respuesta exitosa `200`:**
```json
{
  "message": "Login exitoso",
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errores:**
- `401` — Credenciales inválidas

---

### GET `http://127.0.0.1:8000/movies`

Retorna el listado de todas las películas.

**Autenticación:** No requerida

### `Response`
**Respuesta exitosa `200`:**
```json
{
  "items": [
    {
      "id_pelicula": 1,
      "titulo": "Película de Prueba",
      "director": "Director Famoso",
      "anio_estreno": 2026,
      "url_contenido": "https://...",
      "poster": "https://...",
      "estado": "Disponible"
    }
  ]
}
```

---

### GET `http://127.0.0.1:8000/playlist`

Retorna la playlist del usuario autenticado.

**Autenticación:**  Bearer Token requerido

### `Response`
**Respuesta exitosa `200`:**
```json
{
  "items": [
    {
      "id_pelicula": 1,
      "fecha_agregada": "2026-02-18T21:00:00",
      "titulo": "Película de Prueba",
      "director": "Director Famoso",
      "anio_estreno": 2026,
      "url_contenido": "https://...",
      "poster": "https://...",
      "estado": "Disponible"
    }
  ]
}
```

---

### POST `http://127.0.0.1:8000/playlist`

Agrega una película a la playlist del usuario.

**Autenticación:**  Bearer Token requerido  
**Content-Type:** `application/json`
### `Request`
```json
{
  "id_pelicula": 1
}
```

### `Response`
**Respuesta exitosa `201`:**
```json
{
  "message": "Película agregada a playlist"
}
```

**Errores:**
- `400` — Película no disponible
- `404` — Película no existe
- `409` — Ya está en tu playlist

---

### DELETE `http://127.0.0.1:8000/playlist/{id_pelicula}`

Elimina una película de la playlist del usuario.

**Autenticación:**  Bearer Token requerido  
**Parámetro de ruta:** `id_pelicula` (int)

### `Response`
**Respuesta exitosa `200`:**
```json
{
  "message": "Eliminada de playlist"
}
```

**Errores:**
- `404` — No estaba en playlist

---

### GET `http://127.0.0.1:8000/profile`

Retorna el perfil del usuario autenticado.

**Autenticación:**  Bearer Token requerido

### `Response`
**Respuesta exitosa `200`:**
```json
{
  "user": {
    "id_usuario": 1,
    "email": "usuario@gmail.com",
    "nombre_completo": "Usuario",
    "foto_perfil": null,
    "fecha_registro": "2026-02-18T21:00:00"
  }
}
```

---

### PUT `http://127.0.0.1:8000/profile`

Actualiza el perfil del usuario autenticado.

**Autenticación:**  Bearer Token requerido  
**Content-Type:** `multipart/form-data`

### `Request`
| Campo | Tipo |
|---|---|
| `current_password` | string |
| `nombre_completo` | string |
| `foto_perfil` | file |

### `Response`  
**Respuesta exitosa `200`:**
```json
{
  "message": "Perfil actualizado"
}
```

**Errores:**
- `401` — Contraseña actual incorrecta
