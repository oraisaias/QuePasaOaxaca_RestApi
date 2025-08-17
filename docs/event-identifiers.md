# Sistema de Eventos - IDs Directos

## Descripción

El sistema de eventos utiliza IDs directos de la base de datos para todos los endpoints, simplificando la arquitectura y mejorando el rendimiento.

## Características

1. **IDs Directos**: Todos los endpoints usan los UUIDs reales de la base de datos
2. **Simplicidad**: No hay conversión o hasheado de identificadores
3. **Rendimiento**: Consultas directas sin búsquedas adicionales
4. **Consistencia**: Mismo formato de ID en todos los endpoints

## Endpoints Disponibles

### Endpoints Públicos (App)

#### Obtener todos los eventos
```
GET /eventos
```

**Respuesta:**
```json
[
  {
    "id": "uuid-del-evento",
    "titulo": "Fiesta en Oaxaca",
    "descripcion": "Gran fiesta...",
    "fechaInicio": "2024-01-15T20:00:00.000Z",
    "categorias": [
      {
        "nombre": "Música",
        "descripcion": "Eventos musicales"
      }
    ]
  }
]
```

#### Obtener evento específico
```
GET /eventos/:id
```

**Ejemplo:**
```
GET /eventos/uuid-del-evento
```

### Endpoints CMS (Protegidos)

#### Obtener eventos para CMS
```
GET /eventos/cms
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid-real-de-la-db",
      "titulo": "Fiesta en Oaxaca",
      "fechaInicio": "2024-01-15T20:00:00.000Z",
      "direccionTexto": "Centro de Oaxaca",
      "precio": 150.00,
      "categoriaIds": ["cat-1", "cat-2"]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Eliminar evento desde CMS
```
DELETE /eventos/cms/:id
```

**Ejemplo:**
```bash
DELETE /eventos/cms/uuid-real-de-la-db
Authorization: Bearer <jwt-token>
```

#### Actualizar evento desde CMS
```
PATCH /eventos/cms/:id
```

**Ejemplo:**
```bash
PATCH /eventos/cms/uuid-real-de-la-db
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "titulo": "Nuevo título",
  "precio": 200.00
}
```

### Endpoints de Eliminación y Actualización

#### Para el CMS

**Eliminar evento:**
```bash
DELETE /eventos/cms/:id
Authorization: Bearer <jwt-token>
```

**Actualizar evento:**
```bash
PATCH /eventos/cms/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Ejemplo:**
```bash
# Eliminar
DELETE /eventos/cms/uuid-del-evento
Authorization: Bearer <jwt-token>

# Actualizar
PATCH /eventos/cms/uuid-del-evento
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "titulo": "Fiesta actualizada",
  "precio": 200.00
}
```

**Respuesta exitosa (eliminación):**
```json
{
  "message": "Evento eliminado exitosamente"
}
```

**Respuesta exitosa (actualización CMS):**
```json
{
  "id": "uuid-del-evento",
  "titulo": "Fiesta actualizada",
  "fechaInicio": "2024-01-15T20:00:00.000Z",
  "direccionTexto": "Centro de Oaxaca",
  "precio": 200.00,
  "categoriaIds": ["cat-1", "cat-2"]
}
```

**Errores posibles:**
- `401 Unauthorized`: Token JWT inválido o faltante
- `403 Forbidden`: El usuario no es el creador del evento
- `404 Not Found`: Evento no encontrado

## Uso en la Aplicación

1. **Lista de eventos**: Los eventos se devuelven con `id` directo de la base de datos
2. **Detalle de evento**: Usa el `id` para obtener información específica del evento
3. **Favoritos**: Puedes usar el `id` para identificar eventos en favoritos
4. **CMS**: Usa los mismos `id` para todas las operaciones

## Ventajas

- ✅ IDs directos y simples
- ✅ Mejor rendimiento (sin conversiones)
- ✅ Fácil de implementar en el frontend
- ✅ Consistente en todos los endpoints
- ✅ Control de acceso basado en permisos de usuario
- ✅ Eliminación segura con verificación de propiedad
- ✅ Actualización parcial de eventos (solo campos modificados)
- ✅ Gestión automática de relaciones con categorías
