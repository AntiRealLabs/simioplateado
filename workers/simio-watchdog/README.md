# simio-watchdog

Worker programado para verificar `https://api.simioplateado.com/api/health` cada 15 minutos.

- Guarda estado en KV con claves `watchdog:*`.
- Alerta después de 2 fallos consecutivos.
- Aplica cooldown de 4 horas entre alertas repetidas.
- Envía correo de recuperación cuando el health vuelve a `ok`.
- Expone `/status` para revisar último estado e historial.

Despliegue:

```bash
wrangler deploy --config workers/simio-watchdog/wrangler.toml
```

El KV configurado es el namespace existente de `simio-sondeo`; puede reemplazarse por un namespace dedicado más adelante.
