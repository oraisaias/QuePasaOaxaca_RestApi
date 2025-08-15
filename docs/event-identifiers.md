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

### Obtener todos los eventos (público)
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

### Obtener evento específico (público)
```
GET /eventos/:eventId
```

**Ejemplo:**
```
GET /eventos/a1b2c3d4e5f678901234567890123456
```

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
