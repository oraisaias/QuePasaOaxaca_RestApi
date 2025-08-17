# Integración con OpenAI

## Descripción
Este módulo proporciona una integración simple con la API de OpenAI para obtener respuestas de GPT.

## Configuración

### Variables de Entorno
Agrega la siguiente variable a tu archivo `.env`:

```bash
OPENAI_API_KEY=tu-api-key-de-openai-aqui
```

### Obtener API Key
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú lateral
4. Crea una nueva API key
5. Copia la key y agrégala a tu archivo `.env`

## Endpoints

### Obtener Respuesta de GPT
```bash
POST /openai/gpt-response
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body:** (vacío - no requiere datos)

**Respuesta:**
```json
{
  "message": "¡Hola! ¿En qué puedo ayudarte hoy?",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Características

- **Protegido por JWT**: Requiere autenticación
- **Prompt fijo**: Siempre envía "Hola" como prompt
- **Modelo**: GPT-3.5-turbo
- **Configuración**:
  - `max_tokens`: 150
  - `temperature`: 0.7

## Manejo de Errores

- **API Key faltante**: Error al iniciar el servicio
- **Error de OpenAI**: Respuesta con detalles del error
- **Errores de red**: Manejo automático de timeouts

## Uso

```javascript
// Ejemplo de uso desde el frontend
const response = await fetch('/openai/gpt-response', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.message); // Respuesta de GPT
```

## Estructura del Módulo

```
src/openai/
├── openai.module.ts      # Módulo principal
├── openai.service.ts     # Servicio con lógica de OpenAI
├── openai.controller.ts  # Controlador con endpoints
└── dto/
    └── gpt-response.dto.ts # DTO para la respuesta
```
