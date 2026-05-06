# Meta Conversions API - Configuración

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local` (desarrollo) o `.env.production` (producción):

```bash
# Meta Pixel ID (visible en el cliente)
NEXT_PUBLIC_META_PIXEL_ID="tu_pixel_id_aqui"

# Meta Conversions API Access Token (SERVIDOR SOLO - NO EXPONER AL CLIENTE)
META_CONVERSIONS_API_TOKEN="tu_access_token_aqui"

# Opcional: Test Event Code para pruebas
META_TEST_EVENT_CODE="TEST12345"
```

## Cómo Obtener las Credenciales

### 1. Meta Pixel ID

1. Ve a [Meta Events Manager](https://business.facebook.com/events_manager)
2. Selecciona tu cuenta publicitaria
3. En "Fuentes de datos", elige tu píxel
4. El **Pixel ID** aparece en la parte superior de la página

### 2. Access Token para Conversions API

1. En **Events Manager**, selecciona tu píxel
2. Ve a la pestaña **Configuración**
3. Desplázate hasta la sección **Conversions API**
4. Haz clic en **"Generar token de acceso"**
5. Copia y guarda el token (solo lo verás una vez)

**Importante**: Este token debe mantenerse secreto y nunca exponerse al cliente.

### 3. Test Event Code (Opcional)

Para probar eventos sin afectar tus datos de producción:

1. En **Events Manager** > Tu píxel > **Configuración**
2. En la sección **Configuración de prueba**
3. Haz clic en **"Probar eventos"**
4. Copia el código de prueba proporcionado

## Eventos Implementados

### Eventos Automáticos (Servidor)

- ✅ **Purchase**: Cuando se completa una suscripción (Stripe webhook)
- ✅ **Lead**: Cuando alguien envía el formulario de contacto
- ✅ **CompleteRegistration**: Cuando un usuario se registra
- ✅ **InitiateCheckout**: Cuando inician el proceso de pago

### Eventos del Píxel (Cliente)

- ✅ **PageView**: Automático en todas las páginas
- ✅ **ViewContent**: Páginas de producto/contenido
- ✅ **InitiateCheckout**: Cuando hacen clic en comprar

## Deduplicación de Eventos

Para evitar contar eventos duplicados cuando se usan tanto el Pixel como Conversions API:

1. Cada evento tiene un `event_id` único
2. El mismo `event_id` se envía desde el cliente (Pixel) y el servidor (CAPI)
3. Meta automáticamente deduplica eventos con el mismo `event_id`

## Testing

### Modo Desarrollo

En desarrollo, los eventos se loguean en la consola pero no se envían a Meta:

```
Meta Conversions API [DEV MODE]: {
  event_name: "Purchase",
  event_id: "1234567890-abc123",
  ...
}
```

### Modo Producción con Test Event Code

Si configuras `META_TEST_EVENT_CODE`, los eventos aparecerán en la sección de **Eventos de prueba** de Meta Events Manager, permitiéndote validar la implementación sin afectar tus datos de producción.

### Validar Eventos en Meta

1. Ve a **Events Manager** > Tu píxel
2. Haz clic en **"Probar eventos"** o **"Visión general"**
3. Verifica que los eventos estén llegando correctamente
4. Revisa la **calidad de coincidencia de eventos** (Event Match Quality)

## Mejores Prácticas

### 1. Privacidad y Seguridad

- ✅ Todos los datos personales se hashean con SHA-256 antes de enviarlos
- ✅ El Access Token nunca se expone al cliente
- ✅ Se respetan las preferencias de cookies del usuario

### 2. Calidad de Datos

Para mejorar la coincidencia de eventos, envía tantos parámetros de usuario como sea posible:

- Email (recomendado)
- Teléfono
- Nombre y apellido
- Dirección IP
- User Agent
- Facebook cookies (fbc, fbp)

### 3. Monitoreo

Revisa regularmente en Meta Events Manager:

- **Event Match Quality Score**: Debe ser >6.0 (idealmente >8.0)
- **Events Received**: Verifica que todos los eventos lleguen
- **Errors**: Monitorea errores en el dashboard

## Troubleshooting

### "Finish setting up Meta Pixel" no se marca / "No events recorded yet"

Si la extensión Meta Pixel Helper detecta el pixel pero Meta no marca el paso o no registra eventos:

1. **Dominio en Events Manager**  
   En Events Manager → tu pixel → **Configuración** → **Dominios**, agrega tu dominio (ej. `iptradecopier.com`) y verifica que coincida con la URL donde pruebas.

2. **Eventos de prueba**  
   En Events Manager → pestaña **Test events** → "Open website" o ingresa la URL de tu sitio. Navega un poco (home, login, etc.) y comprueba que aparezcan eventos en Test events. Cuando Meta ve eventos, el checklist suele actualizarse.

3. **Adblockers**  
   Prueba con las extensiones de anuncios desactivadas; a veces bloquean `connect.facebook.net` y el pixel no carga.

4. **Qué significa el aviso en Pixel Helper**  
   En la extensión, expande "A Warning found on this page" para ver el mensaje exacto (p. ej. "Pixel did not load", "Duplicate pixel") y actúa según eso.

### Los eventos no aparecen en Meta

1. Verifica que `NEXT_PUBLIC_META_PIXEL_ID` y `META_CONVERSIONS_API_TOKEN` estén configurados
2. Revisa los logs del servidor para errores
3. Verifica que estés en modo producción (no development)
4. Usa el Test Event Code para debugging

### Error "Invalid Access Token"

1. Regenera el token en Meta Events Manager
2. Actualiza `META_CONVERSIONS_API_TOKEN` en tu `.env`
3. Reinicia tu servidor

### Eventos duplicados

1. Verifica que `event_id` se esté generando y pasando correctamente
2. El mismo `event_id` debe usarse en Pixel y CAPI
3. Revisa los logs para confirmar deduplicación

## Soporte

- [Documentación oficial de Meta Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [Conversions API Best Practices](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices)

