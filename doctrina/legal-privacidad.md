# Política de Privacidad · Simio Plateado

*Texto canónico de la política de privacidad de simioplateado.com. Cumple con la Ley 1581 de 2012 y su Decreto Reglamentario 1377 de 2013 (Habeas Data, Colombia), y con el Reglamento (UE) 2016/679 (GDPR) para clientes en la Unión Europea. Última actualización: 29 de mayo de 2026 · Versión 1.1.*

---

## 1 · Resumen rápido

Antes del legal completo, esta es la versión corta de cómo manejamos tus datos:

- **Recolectamos solo lo necesario** para procesar tu compra y entregarte tu pieza.
- **No vendemos tus datos** a terceros bajo ninguna circunstancia.
- **Usamos el Pixel de Meta** para medición publicitaria y conversión, según se explica en la sección 8.
- **Almacenamos tus datos cifrados** en infraestructura segura (Cloudflare).
- **Tienes derecho a acceder, corregir, eliminar y portar tus datos** cuando quieras.
- **Cumplimos Habeas Data Colombia y GDPR** según la jurisdicción que aplique a tu caso.

Si estás de acuerdo con lo anterior, no necesitas leer el resto. Si quieres el detalle, sigue.

---

## 2 · Quién es el responsable de tus datos

**Anti Real Labs S.A.S.** (en adelante "Simio Plateado") es el responsable del tratamiento de tus datos personales recolectados en simioplateado.com.

- Domicilio: Medellín, Colombia
- Correo de contacto para datos personales: **el@simioplateado.com**
- Persona designada para atención a titulares: Juan Montoya Espinosa, representante legal

---

## 3 · Qué datos recolectamos y para qué

### 3.1 · Datos que tú nos das directamente

| Dato                       | Cuándo lo pedimos                   | Para qué lo usamos                          |
|----------------------------|-------------------------------------|---------------------------------------------|
| Correo electrónico         | Al hacer una compra                 | Confirmación, notificaciones de fase, soporte |
| Nombre completo            | Al hacer una compra                 | Facturación, envío                          |
| Dirección de envío         | Al hacer una compra                 | Despacho de la pieza                        |
| Teléfono (opcional)        | En el formulario de envío           | Coordinación con transportista              |
| Fotografía (solo ESPEJO)   | Al pedir pieza personalizable       | Generar tu pieza ESPEJO (ver §3.3)          |
| Mensaje en formulario contacto | Al escribirnos                  | Responder a tu solicitud                    |

### 3.2 · Datos que se recolectan automáticamente

| Dato                              | Origen                  | Para qué                                       |
|-----------------------------------|-------------------------|------------------------------------------------|
| Dirección IP                      | Visita al sitio         | Seguridad, prevención de fraude, analítica básica |
| Tipo de navegador y sistema       | Visita al sitio         | Compatibilidad técnica                         |
| Páginas visitadas y duración      | Visita al sitio         | Mejorar el sitio (analítica agregada)          |
| Hash de IP                        | Firma de consentimiento | Evidencia legal del consentimiento             |

### 3.3 · Datos sensibles · fotografía facial en ESPEJO

Cuando pides una pieza ESPEJO PLATEADO subes una o varias fotografías de tu rostro. Esto constituye **dato sensible** según ambas legislaciones aplicables.

El tratamiento de tu fotografía se hace exclusivamente bajo el **consentimiento explícito** que firmas en el paso 4 del wizard de pedido. Ese consentimiento está descrito en detalle en `/legal/uso-imagen` y forma parte integral de esta política.

Características clave del tratamiento de fotografías ESPEJO:

- Las fotos se almacenan cifradas en Cloudflare R2 (no en servidores propios).
- Las fotos pasan por servicios de IA generativa (Tripo3D, Meshy, modelos comerciales) que NO retienen tu imagen para entrenamiento.
- Las fotos originales se eliminan máximo 30 días después de entregada tu pieza (15 días si es un menor de edad).
- NUNCA usamos tus fotos para entrenar IA propia, ni las compartimos con servicios de reconocimiento facial, ni las vendemos.

---

## 4 · Con quién compartimos tus datos

Para entregarte tu pieza necesitamos compartir información mínima con terceros operativos. Todos están bajo contrato de confidencialidad o cláusulas equivalentes:

| Tercero               | Qué datos comparten           | Para qué                              | Política propia              |
|-----------------------|-------------------------------|---------------------------------------|------------------------------|
| **Mercado Pago**      | Nombre, email, teléfono, monto, referencia de orden | Procesar el pago | mercadopago.com/privacy |
| **Cloudflare**        | Datos almacenados en KV/R2    | Hosting e infraestructura             | cloudflare.com/privacy       |
| **DHL / FedEx / 4-72**| Nombre, dirección, teléfono   | Envío físico de la pieza              | Política del transportista   |
| **Tripo3D / Meshy**   | Foto (solo ESPEJO)            | Generar modelo 3D                     | Política del proveedor       |
| **MailChannels / Resend** | Email + contenido del correo | Envío de correos transaccionales  | Política del proveedor       |

**Bajo ninguna circunstancia** vendemos tus datos a empresas de marketing, agregadores de datos, brokers o cualquier tercero con fines publicitarios.

---

## 5 · Por cuánto tiempo guardamos tus datos

| Categoría de dato                                | Retención                                                     |
|--------------------------------------------------|---------------------------------------------------------------|
| Datos del pedido (email, nombre, dirección)      | 5 años (obligación contable colombiana)                       |
| Texto del consentimiento firmado                 | 5 años (evidencia legal)                                      |
| Fotografías originales ESPEJO                    | 30 días después de entregada la pieza (15 días para menores)  |
| Imagen final generada ESPEJO                     | Indefinidamente como archivo del catálogo (sin tu nombre)     |
| Mensajes de soporte                              | 2 años                                                        |
| Logs técnicos (IP, navegador)                    | 90 días                                                       |
| Datos de visitantes no compradores               | Hasta 12 meses (analítica agregada)                           |

Después de los plazos indicados, los datos se eliminan o anonimizan permanentemente.

---

## 6 · Tus derechos

Tienes derecho a:

- **Conocer**: pedirnos qué datos tuyos tenemos.
- **Actualizar**: corregir un dato incorrecto.
- **Rectificar**: completar un dato incompleto.
- **Suprimir**: pedir que eliminemos tus datos antes del plazo de retención, con la excepción de los que estamos obligados a guardar por ley (datos contables).
- **Revocar el consentimiento**: especialmente útil para el uso de imagen ESPEJO. La revocación es prospectiva — no afecta usos ya realizados, pero detiene los futuros.
- **Acceder a los datos en formato portable**: pedirnos una copia estructurada de tus datos para llevarlos a otro lado.
- **Oponerte al tratamiento**: especialmente al uso promocional opcional.
- **No ser sometido a decisiones automatizadas**: no usamos sistemas que tomen decisiones legales sobre ti automáticamente.

### 6.1 · Cómo ejercer estos derechos

Envía un correo a **el@simioplateado.com** con:

1. Tu nombre y email del pedido (para identificarte)
2. El derecho que quieres ejercer
3. (Opcional) Número de orden si aplica

Respondemos en máximo 10 días hábiles para casos colombianos, máximo 30 días para casos europeos (GDPR).

### 6.2 · Quejas ante autoridad

Si consideras que no hemos atendido tu solicitud satisfactoriamente:

- **En Colombia**: Superintendencia de Industria y Comercio (sic.gov.co)
- **En la Unión Europea**: la autoridad nacional de protección de datos de tu país
- **En Reino Unido**: Information Commissioner's Office (ico.org.uk)

---

## 7 · Seguridad

Aplicamos medidas técnicas y organizativas razonables para proteger tus datos:

- Almacenamiento en Cloudflare con cifrado en reposo y en tránsito (TLS 1.3)
- Secrets y credenciales en almacenamiento cifrado, no en código fuente
- Acceso a datos restringido al personal autorizado (en este momento: solo Juan Montoya)
- Pagos procesados por Mercado Pago sin que pasen datos de tarjeta por nuestros servidores
- Backups regulares con retención limitada
- Eliminación segura cuando vencen los plazos de retención

Ninguna medida de seguridad es 100% infalible. En caso de una brecha que afecte tus datos personales, te notificaríamos en máximo 72 horas a través del correo registrado, y reportaríamos a la autoridad competente según corresponda.

---

## 8 · Cookies y tecnologías similares

simioplateado.com usa el mínimo posible de tecnologías de rastreo:

| Tipo de cookie         | Uso                                        | ¿Esencial? |
|------------------------|--------------------------------------------|------------|
| Cookies de sesión      | Mantener el carrito o sesión activa        | Sí         |
| Preferencias           | Recordar idioma o configuración            | Sí         |
| Analítica agregada     | Conteo de visitas (sin identificarte)      | No         |
| Pixel de Meta          | Medir anuncios, visitas a piezas, inicios de checkout y compras confirmadas | No |

Utilizamos el **Pixel de Meta** (Facebook/Instagram) para medir la efectividad de nuestra publicidad y entender cómo las personas interactúan con el sitio. El Pixel puede enviar a Meta información sobre páginas visitadas, piezas vistas, inicios de checkout y compras confirmadas, junto con datos técnicos del navegador.

Puedes limitar o desactivar este tipo de medición desde las preferencias de anuncios de Meta, la configuración de privacidad de tu navegador, bloqueadores de rastreo o ajustes de cookies/privacidad de tu dispositivo. No vendemos tus datos a Meta ni a terceros.

---

## 9 · Menores de edad

simioplateado.com no está dirigido a menores de 14 años. No recolectamos conscientemente datos de menores de esa edad. Si descubrimos que un menor ha proporcionado datos sin autorización parental, los eliminamos.

Para pedidos ESPEJO que incluyan imagen de un menor entre 14 y 17 años, requerimos autorización firmada del padre, madre o tutor legal, con plazos de retención más estrictos y sin permiso de uso promocional bajo ninguna circunstancia.

---

## 10 · Transferencias internacionales de datos

Algunos de nuestros proveedores tienen sus servidores fuera de Colombia (Cloudflare en USA/global, Mercado Pago en infraestructura regional/global, etc.). Esto implica transferencia internacional de tus datos.

Estas transferencias se hacen bajo:

- Cláusulas contractuales estándar (CCE) aprobadas por la Comisión Europea para clientes UE
- Certificaciones de cumplimiento (ej. Cloudflare bajo SCC y Data Privacy Framework)
- Autorización del titular cuando aplique

Si te incomoda una transferencia específica, contáctanos y evaluamos alternativas.

---

## 11 · Modificaciones a esta política

Esta política puede actualizarse. La versión vigente es siempre la publicada en `/legal/privacidad` con su fecha al pie.

Si hacemos cambios materiales que te afecten (ej. nuevos terceros, cambio de retención), te notificamos por correo si tienes una compra activa o has firmado consentimiento ESPEJO.

Las compras pasadas y consentimientos firmados se rigen por la versión vigente al momento de su firma. Esta versión queda archivada con el registro del consentimiento.

---

## 12 · Contacto

Para cualquier asunto relacionado con privacidad y datos personales:

- Correo: **el@simioplateado.com**
- Asunto sugerido: `[DATOS PERSONALES] tu solicitud`
- Tiempo de respuesta: 10 días hábiles (Colombia) / 30 días (GDPR)

---

*Política creada 2026-05-18. Versión 1.1 actualizada 2026-05-29 para reflejar Mercado Pago/COP como flujo transaccional vigente. Acompaña a los Términos y Condiciones (`/legal/terminos`) y al Consentimiento de Uso de Imagen para ESPEJO (`/legal/uso-imagen`).*
