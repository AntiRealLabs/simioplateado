# Simio Plateado - Resumen para hoja de vida

## Rol sugerido

Fundador, director creativo y desarrollador de producto digital / Creative Technologist.

Tambien puede presentarse como:
- Product Designer + Full-stack Developer
- Founder / Creative Technologist
- Director de producto, arte generativo e impresion 3D
- Diseñador de experiencias web, comercio digital y objetos 3D

## Resumen corto del proyecto

Simio Plateado es una marca/galeria experimental de objetos de coleccion, piezas impresas en 3D, productos intervenidos y encargos personalizados. El proyecto combina diseño visual, narrativa de marca, catalogo web, comercio electronico, integracion con pagos, modelos 3D interactivos, automatizacion de pedidos, analitica, optimizacion de performance y un flujo de generacion de modelos 3D con IA para solicitudes personalizadas.

El proyecto fue concebido como una experiencia entre galeria digital, tienda de piezas fisicas y laboratorio creativo. La pagina permite explorar piezas disponibles, irreales o en gestacion, ver modelos 3D, consultar fichas de producto, iniciar compras, enviar solicitudes personalizadas y generar modelos preliminares desde imagenes usando Tripo3D.

## Que se construyo

- Direccion conceptual y visual de la marca Simio Plateado, manteniendo una estetica de galeria minima, material, experimental y artesanal.
- Catalogo web responsive con piezas organizadas por familias: literatos, grandes mentes, objetos, criaturas, Simiugs, Party Animals, wearables y productos disponibles.
- Fichas individuales de producto con imagenes optimizadas, titulos manuscritos, descripciones, precios, medidas, disponibilidad, modelos 3D y llamados a compra.
- Sistema de checkout con Mercado Pago para productos disponibles, incluyendo validaciones, manejo de errores, pagina de gracias, seguimiento de pagos y registro interno.
- Boton y flujo de ayuda para usuarios que no pudieron completar una compra.
- Integracion de Meta Pixel y Google Ads para medicion de trafico, eventos y campañas.
- Seccion de pedidos personalizados donde el usuario puede subir una imagen, indicar que sujeto quiere extraer, elegir opciones de tamaño, acabado, cantidad, envio, estuche y texto personalizado.
- Integracion con Tripo3D API para generar modelos 3D preliminares desde imagenes cargadas por usuarios.
- Manejo de tareas asincronas de Tripo3D: creacion de tarea, polling de progreso, recuperacion de modelos GLB y vista renderizada.
- Backend serverless en Cloudflare Workers con endpoints para checkout, solicitudes, analitica, Tripo3D, notificaciones y administracion interna.
- Uso de Cloudflare Pages para publicar el frontend estatico y Cloudflare KV para persistencia ligera.
- Optimizacion fuerte de performance web: compresion y conversion de imagenes, carga diferida, versionado de assets, reduccion de peso inicial y mejora del Lighthouse/PageSpeed hasta niveles altos en pruebas.
- Creacion de un sistema de contenido visual con imagenes reales, renders, modelos GLB, handwritten assets y fotografias de piezas fisicas.
- Preparacion de expansion internacional: comunicacion de precios con envio incluido, consideracion de envios internacionales, Wise Business y estructura comercial para otros mercados.

## Stack y herramientas

- Frontend: HTML, CSS y JavaScript vanilla, con una arquitectura ligera orientada a performance.
- Backend: Cloudflare Workers.
- Hosting: Cloudflare Pages.
- Persistencia: Cloudflare KV.
- Pagos: Mercado Pago.
- Modelos 3D: GLB, model-viewer, Tripo3D API.
- IA/automatizacion: generacion conceptual de piezas, prompts, pipeline de imagen a modelo 3D.
- Analitica y publicidad: Meta Pixel, Google Ads, eventos personalizados.
- Optimizacion: WebP, lazy loading, cache, assets versionados, auditorias Lighthouse/PageSpeed.
- Operacion: Wrangler CLI, pruebas con curl, despliegues controlados, revision de errores y flujos de produccion.

## Logros y responsabilidades principales

- Diseñe y desarrolle una experiencia digital completa para una marca experimental de objetos 3D, desde el concepto visual hasta la publicacion web.
- Construí un catalogo de productos con decenas de piezas, categorias, filtros, fichas individuales, galerias, modelos 3D y estados de disponibilidad.
- Implemente un flujo de compra funcional con Mercado Pago, incluyendo validacion de datos, manejo de errores, retorno post-pago y registro de ordenes.
- Integre un flujo de pedidos personalizados que convierte imagenes de referencia en modelos 3D preliminares mediante Tripo3D API.
- Diseñe la experiencia de usuario para solicitudes a pedido, con estimacion de precio, opciones de acabado, tamaño, envio, estuche y personalizacion.
- Desarrolle endpoints serverless para procesar formularios, crear tareas de generacion 3D, consultar estados asincronos, guardar solicitudes y notificar internamente.
- Optimice la pagina tras auditorias de PageSpeed/Lighthouse, reduciendo la carga inicial y mejorando significativamente el rendimiento percibido.
- Produje y gestione un sistema de assets visuales que combina fotografias reales, renders, dibujos manuscritos, modelos GLB y piezas impresas.
- Configure integraciones de medicion y publicidad para preparar campañas pagadas y entender mejor el comportamiento de usuarios.
- Documente y ajuste procesos comerciales: precios, disponibilidad, envios, encargos personalizados, pagos, comunicaciones y experiencia post-compra.

## Bullets listos para hoja de vida

- Fundé y desarrollé Simio Plateado, una marca experimental que combina diseño de producto, impresion 3D, comercio digital y narrativa visual.
- Diseñe e implemente una plataforma web de catalogo y tienda para piezas 3D, con fichas de producto, imagenes optimizadas, modelos interactivos y checkout integrado.
- Construí un backend serverless en Cloudflare Workers para pagos, solicitudes personalizadas, analitica, notificaciones y generacion de modelos 3D mediante API externa.
- Integre Tripo3D API para generar modelos GLB preliminares a partir de imagenes subidas por usuarios, incluyendo manejo asincrono de tareas y polling de progreso.
- Implemente pagos con Mercado Pago y flujos de soporte para reducir friccion en intentos de compra fallidos.
- Optimice el rendimiento de la pagina mediante carga diferida, conversion de imagenes a WebP, reduccion de assets iniciales y despliegues controlados en Cloudflare Pages.
- Desarrolle una identidad visual propia basada en handwritten assets, catalogo editorial, modelos 3D y una estetica de galeria experimental.
- Prepare el proyecto para campañas digitales con Meta Pixel, Google Ads y eventos personalizados orientados a conversion y aprendizaje de usuarios.

## Version breve para perfil profesional

Fundador y desarrollador de Simio Plateado, una marca experimental de objetos impresos en 3D y piezas personalizadas. El proyecto integra direccion creativa, diseño de producto, desarrollo web, comercio electronico, pagos digitales, modelos 3D interactivos, automatizacion serverless y generacion de modelos con IA. Construí una plataforma completa en Cloudflare Pages/Workers con catalogo responsive, checkout con Mercado Pago, analitica, optimizacion de performance y un flujo de encargos personalizados conectado a Tripo3D API.

## Version mas tecnica

Desarrolle una plataforma web serverless para Simio Plateado, una tienda/galeria de objetos 3D y productos personalizados. El frontend fue construido en HTML, CSS y JavaScript vanilla, optimizado para performance con WebP, lazy loading, cache y assets versionados. El backend usa Cloudflare Workers y KV para gestionar checkout, formularios, analitica, registros de pedidos, notificaciones y generacion de modelos 3D. Integre Mercado Pago para compras y Tripo3D API para convertir imagenes de usuario en modelos GLB preliminares, con manejo de tareas asincronas, polling, validacion de entradas y recuperacion de archivos generados.

## Version mas creativa

Simio Plateado es un laboratorio de objetos posibles: una galeria-tienda donde personajes, escritores, criaturas y piezas imaginarias pueden volverse objetos fisicos. Dirigi la identidad visual, el catalogo, la experiencia web y el sistema tecnico que permite explorar piezas, comprarlas o solicitar encargos personalizados. El proyecto combina arte generativo, impresion 3D, modelos interactivos, handwritten assets, comercio electronico y automatizacion con IA para transformar imagenes de referencia en modelos 3D preliminares.

## Competencias demostradas

- Direccion de producto digital.
- Desarrollo frontend y backend serverless.
- Integracion de APIs externas.
- UX/UI para comercio electronico y flujos de personalizacion.
- Optimizacion de performance web.
- Automatizacion de procesos comerciales.
- Diseño de marca e identidad visual.
- Gestion de catalogos digitales y assets multimedia.
- Experimentacion con IA generativa y modelos 3D.
- Publicidad digital, medicion y conversion.

## Nota honesta para adaptar en la hoja de vida

El proyecto todavia esta en etapa de construccion, validacion comercial y lanzamiento. Conviene presentarlo como un emprendimiento/proyecto propio de producto digital y creative technology, enfatizando lo construido, las integraciones tecnicas, el diseño de experiencia y la capacidad de llevar una idea completa desde concepto hasta publicacion, medicion y operacion real.
