# Que Pasa Oaxaca API - Documentación

## 📚 Descripción General

API REST para la gestión de eventos culturales y turísticos en Oaxaca. Permite crear, consultar, actualizar y eliminar eventos, así como gestionar categorías, usuarios y favoritos.

## 🚀 Acceso a la Documentación

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:3000/api/docs
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. La mayoría de endpoints requieren un token válido.

### Obtener Token

```bash
POST /auth/login
Content-Type: application/json

{
  "deviceId": "tu-device-id"
}
```

### Usar Token

Incluye el token en el header Authorization:
```
Authorization: Bearer <tu-token-jwt>
```

## 📋 Endpoints Principales

### 🔐 Autenticación
- `POST /auth/login` - Iniciar sesión con deviceId
- `POST /auth/register` - Registrar nuevo usuario

### 🎉 Eventos
- `POST /eventos` - Crear nuevo evento (Admin)
- `GET /eventos` - Listar todos los eventos
- `POST /eventos/nearby` - Buscar eventos cercanos
- `POST /eventos/filtered` - Filtrar eventos por fecha/distancia
- `POST /eventos/:id` - Obtener evento específico
- `PATCH /eventos/cms/:id` - Actualizar evento (Admin)
- `DELETE /eventos/cms/:id` - Eliminar evento (Admin)

### 📂 Categorías
- `GET /categorias` - Listar todas las categorías
- `POST /categorias` - Crear nueva categoría (Admin)

### 👥 Usuarios
- `GET /users` - Listar usuarios (Admin)
- `PATCH /users/:id` - Actualizar usuario

### ⭐ Favoritos
- `POST /favorites` - Agregar a favoritos
- `GET /favorites` - Listar favoritos
- `DELETE /favorites/:id` - Eliminar de favoritos

## 📊 Estructura de Datos

### Evento
```json
{
  "id": "uuid",
  "titulo": "Festival de Música",
  "descripcion": "Descripción corta (350 chars max)",
  "descripcionLarga": "Descripción detallada (1700 chars max)",
  "fechaInicio": "2024-02-15T18:00:00.000Z",
  "fechaFin": "2024-02-15T22:00:00.000Z",
  "lat": 17.0732,
  "lng": -96.7266,
  "direccionTexto": "Zócalo de Oaxaca",
  "precio": 0,
  "enlaceExterno": "https://...",
  "phoneNumbers": "+52 951 123 4567",
  "isRecurrent": false,
  "categorias": [
    {
      "nombre": "Música",
      "descripcion": "Eventos musicales"
    }
  ]
}
```

### Categoría
```json
{
  "id": "uuid",
  "nombre": "Música",
  "descripcion": "Eventos musicales y culturales"
}
```

## 🔍 Búsquedas Avanzadas

### Eventos Cercanos
```bash
POST /eventos/nearby
{
  "lat": 17.0732,
  "lng": -96.7266,
  "searchQuery": "música",
  "categories": ["uuid-categoria"],
  "time": "today",
  "proximity": 5000,
  "sortBy": "proximity",
  "page": 1,
  "limit": 20
}
```

### Eventos Filtrados
```bash
POST /eventos/filtered
{
  "date": "today",
  "distance": 5,
  "latitude": 17.0732,
  "longitude": -96.7266
}
```

## 🛠️ Configuración del Entorno

### Variables de Entorno
```env
DATABASE_URL=postgresql://user:password@localhost:5432/que_pasa_oaxaca
JWT_SECRET=tu-jwt-secret
OPENAI_API_KEY=tu-openai-key
```

### Instalación
```bash
npm install
npm run migration:run
npm run start:dev
```

## 📝 Códigos de Estado

- `200` - OK
- `201` - Creado
- `400` - Bad Request
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error interno del servidor

## 🔧 Endpoints de Desarrollo

### Setup Admin (Temporal)
```bash
POST /setup-admin
```
Crea un usuario administrador temporal para configuración inicial.

## 📞 Soporte

Para soporte técnico o preguntas sobre la API, contacta al equipo de desarrollo.
