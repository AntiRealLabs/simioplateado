# Brief de migracion - Simio Plateado

Fecha: 2026-05-28  
Proyecto: `simioplateado.com`  
Repo local: `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado`

Este documento existe para migrar el trabajo a un chat nuevo sin perder el hilo tecnico, estetico ni conceptual de Simio Plateado.

## 1. Identidad del proyecto

Simio Plateado es una galeria web, portal y tienda de Anti Real Labs S.A.S. No debe sentirse como una tienda generica: debe sentirse como una obra navegable que tambien permite comprar objetos reales.

Manifiesto/cierre actual:

> Simio Plateado es una linea de fuga estetico-material hacia la proliferacion de nuevas fugas y multiplicidades. Es un chiste. Es una galeria web. Son ceros y unos. Existe esporadicamente pero con intensidad y pasion en todo tiempo espacio posible. Es un meme con palabras raras. Para los que necesitan respirar. Un aire nuevo.

Contacto:

`hablanos: el@simioplateado.com`

Principio general: las imagenes y los objetos hablan primero. El texto digital debe ser minimo, preciso y con personalidad. La pagina debe sentirse humana, rara, cuidada, directa y ligeramente absurda sin parecer improvisada.

## 2. Filosofia de diseno

- Base visual: blanco, negro, lineas finas, mucho aire, grilla de galeria, bordes rectos.
- Evitar estetica ecommerce generica, tarjetas comerciales innecesarias, gradientes decorativos, sombras blandas de plantilla y copys de marketing.
- Los productos deben aparecer como piezas de una galeria, no como objetos de marketplace masivo.
- Los textos dibujados deben ser verdaderamente escritos a mano. No usar tipografias "handwritten" falsas para titulos de piezas. Si falta el asset escrito a mano, usar texto digital neutro temporal y marcarlo como pendiente.
- Los productos 3D que representen fabricacion FDM deben mostrarse preferiblemente en blanco/raw/monocromatico, no en color hiperrealista, salvo como material secundario dentro del perfil.
- Mantener `object-fit: contain` en imagenes de producto. No cortar sombras, plantas, cajas, figuras, sellos ni bordes.
- Los productos disponibles deben verse con escala coherente entre si. Superhombresito, Marxito y Traumin no deben verse diminutos dentro de cajas gigantes.
- La experiencia debe tener doble lectura: galeria de piezas digitales y tienda de objetos posibles/reales.
- Menos explicacion, mas presencia: evitar frases permanentes que exijan humor forzado para cada producto.

## 3. Estados doctrinales del producto

Estos estados no son solo inventario, tambien son parte de la filosofia de la pagina:

- `DISPONIBLE`: pieza real comprable ahora.
- `GESTANDOSE`: pieza en desarrollo, produccion o preventa futura. Puede mostrar precio proyectado y aviso.
- `IRREAL`: existencia digital o pieza conceptual que puede volverse fisica despues, pero no esta disponible ahora.
- `IMPOSIBLE`: pieza exclusivamente digital/de exhibicion. No cambiar esta categoria sin decision explicita de Juan.

Terminos a evitar:

- No usar `sondeo silencioso`.
- No usar `intencion de compra` para el flujo comercial.
- No usar `edicion pequena`.

Terminos preferidos:

- `existencia digital`
- `compra abierta`
- `compra directa`
- `pre-order` solo cuando aplique a productos no listos para compra directa
- `tirada inicial`
- `intervenido a mano`
- `terminado a mano`

## 4. Arquitectura actual

Frontend principal:

- `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/mockups/index.html`
- Es una pagina estatica grande, con JS/CSS embebido y datos de productos dentro del archivo.
- Esta desplegada en Cloudflare Pages bajo `simioplateado.com`.

Worker/API:

- `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/workers/simio-sondeo/worker.js`
- Config:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/workers/simio-sondeo/wrangler.toml`
- Worker desplegado como `simio-sondeo`.
- Dominio API:
  `https://api.simioplateado.com`

Assets:

- Fuentes maestras y nuevos materiales:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/assets`
- Copia usada por el mockup/frontend:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/mockups/assets`
- Modelos:
  `assets/models` y `mockups/assets/models`
- Textos procesados:
  `assets/processed/textos` y `mockups/assets/processed/textos`

No asumir que todo asset nuevo ya esta incorporado. Revisar ambas carpetas.

## 5. Pagos y checkout

Metodo actual:

- Mercado Pago Checkout Pro.
- La app de Mercado Pago ya fue creada.
- El secret de produccion esta en Cloudflare como:
  `MERCADOPAGO_ACCESS_TOKEN`
- No exponer ni pedir que se pegue el token en el chat.

Endpoint principal:

- `POST https://api.simioplateado.com/api/checkout`

Webhook configurado en Mercado Pago:

- `https://api.simioplateado.com/api/mercadopago/webhook`

Prueba real ya validada:

- Fecha: 2026-05-28, 13:54 Bogota.
- Producto oculto temporal: `SIMIO_TEST_CHECKOUT`.
- Monto: COP 15.000.
- Pago via Bancolombia.
- Resultado: pago exitoso.
- Despues de la prueba, el producto oculto fue retirado y el Worker redeployado.

Conclusion: el flujo de pago real funciona.

Pendiente critico:

- Confirmar que el webhook esta registrando correctamente el pago en la central/almacenamiento.
- Confirmar que la central privada muestra pedidos reales con estado, datos de envio y producto.
- Confirmar que los botones de compra de wearables tambien estan activos.

## 6. Datos de envio

La web debe recolectar los datos de envio antes de enviar al usuario a Mercado Pago. Mercado Pago procesa el pago; no asumir que Mercado Pago por si solo trae todos los datos logisticos necesarios.

Politica actual recomendada:

- Envio nacional incluido en Colombia.
- Envio internacional: se cotiza/contacta antes del despacho. No prometer envio internacional gratis todavia.

Copy seguro:

> Envio nacional incluido en Colombia. Para envios internacionales, te contactamos antes del despacho con la cotizacion exacta.

Razon: aun no hay calculo confiable de costos internacionales para 1, 2 o 3 figuras.

Futuro:

- Implementar carrito antes de ofrecer combos o envio gratis por compras superiores a cierto monto.
- Un carrito tiene sentido porque ya hay varios productos disponibles.

## 7. Productos disponibles actuales

Precios actuales deseados despues del ajuste a pesos colombianos:

### Superhombresito / NIETZSCHESITO.v01

- Estado: disponible / compra abierta.
- Precio: COP 280.000.
- Referencia USD aproximada: USD 77.
- Tirada inicial: 10.
- Medidas: 17.5 cm alto, 10.5 cm ancho, 9 cm profundo.
- Galeria: usar foto real dorada como imagen principal.
- Perfil: incluir foto real, caja, modelo/3D, ilustracion vertical 8 x 16 cm.
- Frase para ilustracion: "El humano es algo que debe ser superado."

### MARXITO.v01

- Estado: disponible / compra abierta.
- Precio: COP 300.000.
- Referencia USD aproximada: USD 83.
- Tirada inicial: 10.
- Medidas: 18 cm alto, 12 cm ancho, 11 cm profundo.
- Galeria: usar foto real pintada, no la version animada.
- Perfil: incluir foto real, foto animada/color, modelo 3D, empaque si existe, ilustracion vertical 8 x 16 cm.
- Frase preferida: "Todo lo solido se desvanece en el aire."
- Nota: antes se propuso USD 95, pero luego Juan pidio pasar a COP 300.000.

### TRAUMIN.v01

- Estado: disponible / compra abierta.
- Precio: COP 270.000.
- Referencia USD aproximada: USD 74.
- Tirada inicial: 10.
- Medidas: 18 cm alto, 11 cm ancho, 11 cm profundo.
- Galeria: usar foto real dorada como imagen principal.
- Perfil: incluir foto real, version animada, foto en empaque, modelo 3D si esta disponible.

### KRAKEN_FLORERO.v01

- Nombre correcto: Kraken Florero.
- Estado: disponible / compra abierta.
- Precio: USD 55 / equivalente usado en Worker: COP 220.000.
- Tirada inicial: 5.
- Medidas desde Bambu: 15.2 cm alto, 9.9 cm ancho, 10.3 cm profundo.
- No llamarlo "jarron pulpo" en UI final, salvo nombre interno de archivo.
- Usar foto real negra brillante.
- Integrar GLB blanco/raw.
- Falta o estaba pendiente integrar el asset de texto `kraken florero`.

### Wearables

Precios rebajados 40% respecto a la primera version:

- Camiseta blanca: COP 81.600 / USD 20.4 aprox.
- Camiseta negra: COP 91.200 / USD 22.8 aprox.
- Gorra: COP 105.600 / USD 26.4 aprox.

Tallas camisetas:

- S
- M
- L
- XL

Gorra:

- Unitalla.

Pendiente:

- Verificar que los botones de compra directa esten activos para camisetas y gorra.
- Verificar que el formulario de checkout incluya talla para camisetas.

## 8. Productos gestandose o no disponibles

Productos que antes estaban en gestacion/pre-order soon:

- `PARCHAO.v01` - USD 70
- `MELISIMO.v01` - USD 70
- `PLANTI_PUNK.v01` - USD 74
- `PLANTI_PUNK_XL.v01` - USD 85
- `PLANTI_K.v01` - USD 72
- `PLANTI_K_XL.v01` - USD 84

Estos no deben aparecer como compra directa si aun no estan listos.

Productos IRREAL/IMPOSIBLE:

- Mantener su estado doctrinal.
- No convertir en compra directa sin confirmacion explicita.

## 9. Familias y filtros

Familias actuales/deseadas:

- `TUNI`
- `PLANTI`
- `GRANDES/MENTES`
- `COLOMBIA`
- `WEARABLES`
- `AUDIO`
- `OBJETOS`
- `OTROS`

Problema reportado:

- El filtro `GRANDES/MENTES` no esta trayendo todos los autores.

Debe mostrar, como minimo:

- Superhombresito / Nietzsche
- Marxito / Marx
- Traumin / Freud
- Arturito Emo
- Gramscito / Lucha Libre de Clases
- Sintomin / Lacancito
- Capitan Nausea
- Otros autores/personajes filosoficos si ya existen en `assets/models`.

Notas de nombres:

- `Gramscito` es el mismo personaje de `lucha libre de clases`.
- `Sintomin` es `Lacancito`.
- No es `capitan nausin`: el nombre correcto es `Capitan Nausea`.
- No es `jarron pulpo`: el nombre final es `Kraken Florero`.

## 10. Galeria vs tienda

Ya existe selector entre:

- Galeria
- Tienda

Galeria:

- Es la vista principal por defecto.
- Debe mostrar las piezas como una gran galeria clasificada por disponibilidad y familia.
- Las imagenes principales deben ser las mas honestas y potentes visualmente.

Tienda:

- Debe presentar los productos disponibles de forma mas comercial, pero sin perder el espiritu SP.
- Actualmente hay textos tipo `STORE.TITLE` / `store.copy` que deben corregirse con copy real o reemplazarse por assets dibujados.

Idea conceptual de tienda:

- Mostrar etapas/fases del producto:
  1. Imagen o idea inicial
  2. Digitalizacion / render / modelo
  3. Modelo 3D/raw
  4. Objeto real terminado

Para piezas personales como `Juntitos`:

- Quitar foto real original de Juan y su novia.
- Mantener version animada, 3D y foto final impresa.
- No marcar a la venta.

## 11. Assets pendientes o a verificar

Revisar especialmente:

- `assets/models`
- `mockups/assets/models`
- `assets/processed/textos`
- `mockups/assets/processed/textos`

Pendientes conocidos:

- Integrar texto dibujado de `Kraken Florero`.
- Verificar texto dibujado de Arturito Emo.
- Verificar texto dibujado de Gramscito / Lucha Libre de Clases.
- Verificar texto dibujado de Sintomin / Lacancito.
- Verificar texto dibujado de Capitan Nausea.
- Verificar texto dibujado de Traumin si falta.
- Crear o integrar ilustracion de Traumin estilo kit premium.
- Verificar que Marxito tenga ilustracion vertical 8 x 16 cm con Marxito, no Nietzsche.
- Revisar assets nuevos agregados por Juan en la carpeta `models`; hay varios GLB no incorporados.

Para que un perfil se considere completo, idealmente debe tener:

1. Foto real/terminada.
2. Modelo 3D blanco/raw o GLB monocromatico.
3. Imagen animada/color si existe.
4. Imagen de empaque/caja si existe.
5. Titulo escrito a mano.
6. Dimensiones.
7. Precio, estado, tirada.
8. CTA correcto: comprar, avisar, pre-order o exhibicion.

## 12. Packaging y producto fisico

Vision del producto premium:

- Figura FDM intervenida.
- Caja impresa 3D o packaging propio.
- Relleno/proteccion con residuos de impresion de Bambu Lab puede ser parte de la estetica.
- Ilustracion impresa vertical 8 x 16 cm.
- Posibles stickers, librito, frase o tarjeta.

Estetica material:

- FDM raw.
- Aerosol dorado/negro/blanco.
- Intervencion manual tipo graffiti/collage.
- Acabado no hiperrealista, mas bien artesanal-premium.

Esto justifica precio y diferencia el producto de un simple STL impreso.

## 13. Central privada

Prioridad alta antes de promocionar mas:

- Central privada para revisar compras, pedidos y envios.
- Debe mostrar:
  - Fecha
  - Producto
  - Precio
  - Estado de pago
  - Nombre del cliente
  - Email
  - Telefono si se captura
  - Direccion
  - Ciudad/pais
  - Estado de fulfilment/envio
  - ID de Mercado Pago/preference/payment si existe

Juan pidio simplificar usuario/contrasena al inicio si hace falta, pero luego debe endurecerse.

No dejar accesos administrativos abiertos publicamente.

## 14. Favicon/logo

Problema reportado:

- En la pestana del navegador aparecia el icono generico/planeta.

Objetivo:

- Usar el logo de Simio Plateado como favicon.

Archivos existentes o esperados:

- `mockups/assets/favicon-32.png`
- `mockups/assets/favicon-192.png`
- `mockups/assets/favicon-512.png`
- `mockups/assets/apple-touch-icon.png`
- `mockups/favicon.ico`

Tambien:

- El logo superior izquierdo de la web debe ser clickeable y llevar al inicio/home.

## 15. Historial de fixes importantes

No reintroducir estos bugs:

- Sello `IRREAL` recortado en mobile: se corrigio reduciendo el pseudo-elemento rotado.
- Version `.v0` digital duplicada bajo titulos: se quito porque los dibujos ya incluyen version.
- Fotos de Planti cortadas: deben mantener `object-fit: contain`.
- Nombres-codigo no deben salirse del tile.
- Logo grande del simio en home debe respetar `max-width`.
- Modal explosionado y callouts/conectores fueron ajustados antes; no romper alineacion.
- Traducciones ES/EN fueron revisadas para sonar humanas, no automaticas.
- No usar `sondeo silencioso`.

## 16. Bilinguismo

La pagina debe funcionar en ES/EN con selector real y `localStorage`.

Traducir:

- Estados
- Botones
- Formularios
- Confirmaciones
- Modales
- Pricing
- Shipping
- Returns
- Copys de tienda/galeria

Evitar traduccion literal plana. Debe sonar organica, humana y con personalidad.

## 17. Cloudflare y deploy

No hay conexion Git visible para `simio-plateado` en Cloudflare Pages segun captura previa. No asumir deploy automatico por Git.

Worker deploy:

```bash
cd "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/workers/simio-sondeo"
npx wrangler deploy --config wrangler.toml
```

Antes de tocar:

```bash
cd "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado"
git status --short
```

El arbol de trabajo esta sucio y tiene muchos assets nuevos/no trackeados. No hacer `git reset`, no revertir cambios del usuario.

## 18. Verificacion recomendada

Despues de cambios frontend:

- Probar desktop 1280px o mayor.
- Probar mobile 375px.
- Revisar que no se corten imagenes, sombras, modelos, sellos ni textos.
- Revisar consola.
- Verificar que los GLB cargan.
- Verificar filtros de disponibilidad/familia.
- Verificar ES/EN.
- Verificar botones de compra.

Checkout:

- Evitar pruebas reales innecesarias.
- Si se crea producto oculto de test, retirarlo despues y redeployar.
- La prueba real del 2026-05-28 ya demostro que el flujo de Mercado Pago funciona.

## 19. Prioridades inmediatas para el nuevo chat

1. Leer este brief.
2. Revisar `mockups/index.html` y `workers/simio-sondeo/worker.js`.
3. Confirmar estado de checkout/webhook/central despues de la prueba real exitosa.
4. Arreglar filtro `GRANDES/MENTES`.
5. Verificar que el logo superior izquierdo lleva a home.
6. Integrar/corregir assets pendientes:
   - Kraken Florero texto y GLB.
   - Marxito foto real como principal.
   - Traumin foto real + animada + empaque.
   - Autores nuevos en modelos.
7. Verificar botones de compra en camisetas y gorra.
8. Ajustar vista tienda para quitar placeholders `STORE.TITLE` y `store.copy`.
9. Preparar central privada antes de promocionar.
10. Luego pensar carrito y shipping multi-producto.

## 20. Tono de trabajo

Trabajar con cuidado, alegria y precision. Simio Plateado no es solo "una tienda con productos": es una maquina rara de existencia digital y material. Cada decision visual debe sostener esa doble condicion:

- obra y producto,
- chiste y objeto serio,
- galeria y checkout,
- archivo digital y cosa hecha a mano,
- FDM raw y acabado premium.

Si una solucion se siente demasiado normal, probablemente hay que volver a mirar el objeto y dejarlo respirar.
