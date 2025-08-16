# Sistema de Identificadores Únicos para Eventos

## Descripción

Para proteger la seguridad de la base de datos, hemos implementado un sistema de identificadores únicos que no expone los IDs reales de los eventos, pero permite identificar eventos específicos de manera segura.

## Cómo Funciona

### Generación del Identificador

El identificador único se genera usando una función hash SHA-256 que combina:
- El ID real del evento en la base de datos
- El título del evento
- La fecha de inicio del evento
- Una clave secreta configurada en las variables de entorno

```typescript
const dataToHash = `${realId}-${titulo}-${fechaInicio.toISOString()}-${SECRET_KEY}`;
const hash = createHash('sha256').update(dataToHash).digest('hex');
const eventId = hash.substring(0, 32); // Primeros 32 caracteres
```

### Características de Seguridad

1. **No reversible**: No es posible obtener el ID real de la base de datos desde el identificador público
2. **Único**: Cada evento tiene un identificador único basado en sus características
3. **Consistente**: El mismo evento siempre generará el mismo identificador
4. **Formato**: Identificador hexadecimal de 32 caracteres

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
    "eventId": "a1b2c3d4e5f678901234567890123456",
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
GET /eventos/:eventId
```

**Ejemplo:**
```
GET /eventos/a1b2c3d4e5f678901234567890123456
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

#### Para el CMS (usando IDs reales)

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
DELETE /eventos/cms/uuid-real-de-la-db
Authorization: Bearer <jwt-token>

# Actualizar
PATCH /eventos/cms/uuid-real-de-la-db
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
  "id": "uuid-real-de-la-db",
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
- `404 Not Found`: Evento no encontrado o identificador inválido

## Configuración

### Variable de Entorno

Agregar en tu archivo `.env`:

```env
EVENT_ID_SECRET=tu-clave-secreta-muy-segura-2024
```

**Importante:** Cambia la clave secreta por una única y segura en producción.

## Uso en la Aplicación

1. **Lista de eventos**: Los eventos se devuelven con `eventId` en lugar del ID real
2. **Detalle de evento**: Usa el `eventId` para obtener información específica del evento
3. **Favoritos**: Puedes usar el `eventId` para identificar eventos en favoritos
4. **Compartir**: Los `eventId` son seguros para compartir públicamente

## Ventajas

- ✅ Protege los IDs reales de la base de datos
- ✅ Permite identificar eventos únicamente
- ✅ No compromete la seguridad de la base de datos
- ✅ Fácil de implementar en el frontend
- ✅ Consistente y confiable
- ✅ Control de acceso basado en permisos de usuario
- ✅ Eliminación segura con verificación de propiedad
- ✅ Actualización parcial de eventos (solo campos modificados)
- ✅ Gestión automática de relaciones con categorías
