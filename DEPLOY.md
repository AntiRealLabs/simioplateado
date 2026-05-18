# Deploy de Simio Plateado

## Estado actual

`simioplateado.com` vive en Cloudflare Pages bajo el proyecto:

- `simio-plateado`

El proyecto de Cloudflare Pages aparece en el dashboard como:

- `Git Provider: No`
- `No Git connection`

Eso es esperado en el flujo actual. El sitio no usa la integracion nativa
`Connect to Git` de Cloudflare Pages. En cambio, el deploy automatico se hace
desde GitHub Actions con Wrangler.

## Flujo de Pages

Repo:

- `https://github.com/AntiRealLabs/simioplateado`

Branch de produccion:

- `main`

Workflow:

- `.github/workflows/deploy-pages.yml`

Comando real de deploy:

```bash
wrangler pages deploy mockups --project-name=simio-plateado
```

Esto sube la carpeta `mockups/` a Cloudflare Pages. Por eso Cloudflare muestra
deployments asociados a commits de GitHub, aunque no muestre un proveedor Git
conectado en la UI.

## Secretos requeridos en GitHub

El workflow de Pages necesita estos secrets en GitHub:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

El worker de `api.simioplateado.com` usa otro workflow:

- `.github/workflows/deploy-sondeo-worker.yml`

Y necesita:

- `CLOUDFLARE_WORKERS_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Que no cambiar sin una migracion planificada

No conectar manualmente el proyecto existente `simio-plateado` a Git desde
Cloudflare sin revisar antes el flujo completo. Si se quiere usar la integracion
nativa de Cloudflare Pages, conviene hacerlo como migracion controlada:

1. Confirmar que Cloudflare puede acceder al repo `AntiRealLabs/simioplateado`.
2. Configurar proyecto con:
   - Production branch: `main`
   - Build command: ninguno
   - Output directory: `mockups`
3. Hacer un deploy de prueba.
4. Confirmar que `simioplateado.com` y `www.simioplateado.com` apuntan al
   proyecto correcto.
5. Solo entonces desactivar o eliminar el workflow de GitHub Actions para
   evitar deploys duplicados.

Mientras tanto, el flujo actual es valido:

```text
git push origin main
  -> GitHub Actions
  -> wrangler pages deploy mockups --project-name=simio-plateado
  -> Cloudflare Pages
  -> simioplateado.com
```
