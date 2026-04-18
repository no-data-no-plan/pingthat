---
title: "Códigos de estado HTTP en monitoreo — Cuáles disparan alertas y cuáles no"
description: "No todo no-200 es una caída. Guía práctica de qué códigos HTTP deberían despertarte y cuáles son solo ruido."
category: http
relatedToolIds: ["http-headers", "redirect-checker", "is-it-up", "site-speed"]
publishedAt: 2026-04-17
lang: es
tags: ["http", "monitoring", "status-codes", "alerts"]
excerpt: "Alertar por cualquier no-2xx es cómo entrenas a tu equipo a ignorar alertas. Aquí va un mapeo más sensato de códigos a severidad."
faq:
  - q: "¿Debería alertar por respuestas HTTP 429?"
    a: "Normalmente no. Un 429 Too Many Requests casi siempre significa que tu propio monitor está pegando en un rate limit, no que los usuarios vean caídas. El arreglo es bajar la frecuencia del probe o añadir el monitor a un allowlist, no despertar a alguien. La excepción es cuando los 429 aparecen en tráfico real de usuarios en logs de tu aplicación — eso indica que necesitas más capacidad o un mejor tier de rate-limit. Para el monitor mismo, suprime alertas 429 y baja la tasa del probe."
  - q: "¿Un 503 Service Unavailable siempre es caída?"
    a: "No siempre. Una aplicación bien diseñada sirve 503 con cabecera Retry-After durante deploys planificados o mantenimiento, y eso es comportamiento esperado. La regla: 503 con Retry-After o durante una ventana de mantenimiento conocida es warning, 503 sin ninguna de las dos es critical. Configura tu monitor para leer un flag de mantenimiento o parsear la cabecera Retry-After, y suprime alertas cuando indiquen caída planificada. 503 recurrentes en horas normales significan que tu app está sin capacidad y deberías hacer page."
  - q: "¿Las respuestas 3xx cuentan como downtime?"
    a: "No, siempre que la cadena de redirección termine en un 2xx válido. Configura tu monitor para seguir redirects hasta 5 saltos y evaluar el estado final. Un 301 a un destino funcional no es caída — un 301 a un destino roto sí. Bucles de redirección y cadenas de más de 3 saltos suelen indicar mala configuración. Usa un redirect checker periódicamente para auditar tus redirects en busca de bucles accidentales, cambios de método (POST a GET), o cadenas que pierden parámetros de query."
  - q: "¿Cuándo debería un 404 disparar una alerta?"
    a: "Alerta cuando un 404 aparece en una URL que monitorizas explícitamente — algo que debería existir y solía devolver 2xx. No alertes por 404s de paths aleatorios crawleados, probes de scanners, o URLs que nunca anunciaste. La señal de severidad es un 404 súbito en un endpoint estable monitorizado, que casi siempre significa que un deploy removió o movió el recurso. Para analítica, rastrea tasas agregadas de 404 por separado, pero haz page solo en fallos de URL monitorizada."
  - q: "¿Debería hacer page por una sola respuesta 5xx?"
    a: "No. Un 500 único es ruido estadístico en la mayoría de setups — clima de red, una tormenta de reintentos, o un crash puntual. Haz page en N fallos consecutivos (típicamente 2 o 3) desde múltiples probes geográficos, y solo cuando una mayoría de probes coincida en el fallo. Esto suaviza blips transitorios sin perder señal en caídas reales. Para SLAs más estrictos (99.99% y arriba) haz probe cada 10-30 segundos desde 3+ regiones para que N=2 siga disparando dentro de tu presupuesto de downtime."
---

Un monitor ingenuo de uptime trata cualquier cosa fuera del rango 200-299 como fallo. Por eso tantos equipos sufren fatiga de alertas — les despiertan por redirects 301, prompts de auth 401 y blips de rate-limit 429 que no son caídas reales. Mapear códigos HTTP a severidad de alerta correctamente es una de las formas más baratas de cortar ruido sin perder señal real.

## Las cinco clases de estado de un vistazo

| Clase | Significado | Acción por defecto para un monitor |
|---|---|---|
| 1xx Informational | Raros en la práctica (100 Continue, 101 Switching Protocols) | Ignorar, no son respuestas finales |
| 2xx Success | Petición exitosa | Verde |
| 3xx Redirection | Recurso movido | Seguir redirects, verificar estado final |
| 4xx Client error | Algo de la petición iba mal | Depende del contexto, a menudo no es caída |
| 5xx Server error | El servidor sabe que falló | Alertar, casi siempre |

Esa tabla es el punto de partida, no la regla. Cada clase tiene excepciones que vale la pena entender.

## 2xx: no tan simple como parece

Un 200 significa que el servidor respondió. No significa que la respuesta sea correcta. Una página puede devolver HTTP 200 con:

- Una página HTML de error que dice "Lo sentimos, algo salió mal"
- Un body vacío porque una API backend falló silenciosamente
- Un formulario de login porque expiró la sesión y la app no devuelve 401
- Un JSON `{"error": "database unavailable"}` con envoltorio 200 (mal diseño de API, muy común)

Un monitor HTTP real hace validación de contenido encima del status: verifica un string esperado, un campo JSON, un content-length mínimo. Si tu homepage siempre contiene `<title>Example Corp</title>`, matchea contra eso — un 200 con body vacío debería despertarte. Puedes inspeccionar cabeceras y body reales con la [herramienta de HTTP headers](/es/http-headers/).

## 3xx: sigue la cadena, luego juzga

Un 301 o 302 a un destino funcional no es una caída. Un 301 a un destino roto sí. Un bucle de redirección es definitivamente una caída. La mayoría de monitores debe seguir redirects (hasta un límite, digamos 5) y evaluar el estado final.

Códigos 3xx clave:

- **301 Moved Permanently** — se cachea fuerte, úsalo solo para cambios de URL finales. Meterlo mal es un bug de SEO a largo plazo, no una caída
- **302 Found** — temporal, se re-pide cada vez. Normal para "login y redirigir de vuelta"
- **303 See Other** — patrón Post/Redirect/Get, siempre GET en el redirect
- **307 Temporary Redirect / 308 Permanent Redirect** — igual que 302/301 pero preservan el método (un POST redirigido con 307 sigue siendo POST)
- **304 Not Modified** — validación de caché; trátalo como 200 para monitoreo

El [redirect checker](/es/redirect-checker/) ayuda a auditar cadenas de redirección y detectar bucles. Una cadena de más de 3 saltos casi siempre es un bug.

## 4xx: la zona de matices

Aquí es donde pasan la mayoría de falsos positivos. No todo 4xx es una caída:

- **400 Bad Request** — tu monitor envió algo mal, o un WAF rechaza el probe. Investiga el monitor, no el servidor
- **401 Unauthorized / 403 Forbidden** — casi nunca es caída por sí solo. Si tu monitor tocó una página que requiere auth y recibió 401, arregla el monitor. Un 403 en una página que antes era pública SÍ es una caída (control de acceso mal configurado)
- **404 Not Found** — depende del contexto. Un 404 en una URL que debería existir es alerta. Un 404 en un path aleatorio crawleado no
- **408 Request Timeout** — el servidor se cansó de esperar al cliente; del lado cliente, un timeout se ve así. Vale la pena alertar si es recurrente
- **410 Gone** — intencional, no alertar
- **429 Too Many Requests** — rate limiting, a menudo tu propio monitor pegando en el umbral. Baja la frecuencia del probe, no alertes
- **451 Unavailable for Legal Reasons** — tienes problemas más grandes que el monitoreo

Regla: alerta por 4xx solo cuando la forma de la petición no cambió y la respuesta previa era 2xx. 404s repentinos en URLs estables son sospechosos. 401s repentinos en endpoints públicos significan que alguien pusheó middleware de auth roto. Confirma alcance desde fuera de tu red con [is-it-up](/es/is-it-up/).

## 5xx: casi siempre alertar

Los errores de servidor son el servidor admitiendo que falló:

- **500 Internal Server Error** — algo crasheó, alerta siempre
- **501 Not Implemented** — raro, suele significar que un load balancer está mal configurado
- **502 Bad Gateway** — el upstream no responde o devolvió basura. Alerta
- **503 Service Unavailable** — puede ser intencional (página de mantenimiento) o no (sin capacidad). Alerta, luego verifica el flag de mantenimiento planificado
- **504 Gateway Timeout** — el upstream no respondió a tiempo. Alerta
- **507 Insufficient Storage** — disco lleno, alerta fuerte
- **511 Network Authentication Required** — captive portal, tu monitor está en un sitio raro

503 es el que hay que pensar. Una app bien diseñada sirve 503 con cabecera `Retry-After` durante deploys o mantenimiento. Puedes o bien suprimir alertas cuando está presente `Retry-After`, o mantener un flag de ventana de mantenimiento que tu monitor lea.

## Un mapeo de severidad sensato

Esto es lo que uso de verdad:

| Estado | Severidad |
|---|---|
| 200 con match de contenido válido | OK |
| 200 con contenido que no coincide | Warning, escalar tras 3 consecutivos |
| 301/302/307/308 seguidos hasta 2xx | OK |
| Cadena 3xx > 5 saltos o bucle | Warning |
| 401/403 en endpoint público | Critical |
| 404 en URL monitorizada | Critical |
| 429 | Suprimir, bajar frecuencia del probe |
| 500, 502, 504 | Critical, page inmediato |
| 503 con Retry-After o en ventana de mantenimiento | Warning |
| 503 en otro caso | Critical |
| Connection refused, fallo DNS, error TLS | Critical |

Ajusta a tu entorno — un blog personal no necesita pages a las 2am, un procesador de pagos sí.

## Fallos consecutivos, no blips únicos

Un 500 único es ruido estadístico en la mayoría de setups. Alerta en N fallos consecutivos (típicamente 2 o 3) desde múltiples probes geográficos:

```bash
# Probe típico basado en curl, emite exit codes que tu monitor puede trapear
curl -sS -o /dev/null -w "%{http_code} %{time_total}\n" \
  --max-time 10 \
  --retry 2 --retry-delay 5 \
  https://example.com/health
```

Los buenos monitores hacen probe desde 3+ ubicaciones y solo alertan cuando una mayoría ve el fallo. Un probe único viendo 500 probablemente es clima de red, no una caída.

## No alertes por lo que no puedes arreglar

Si tu monitor alerta por códigos de estado que tu equipo no puede afectar, es ruido. 503s de una API de terceros que tu app superficial como 502: alerta, porque puedes añadir un circuit breaker. 503s desde un dashboard de un partner no relacionado: no alertes, los vas a ignorar igualmente.

## Más lectura en PingThat

- [/es/docs/ssl-certificate-monitoring-basics/](/es/docs/ssl-certificate-monitoring-basics/) — los errores de certificado aparecen a menudo como fallos de conexión, no códigos HTTP
- [/es/docs/dns-propagation-explained/](/es/docs/dns-propagation-explained/) — los fallos DNS se manifiestan distinto a los HTTP
- [/es/docs/uptime-sla-math/](/es/docs/uptime-sla-math/) — cómo las ventanas de fallos consecutivos afectan tu uptime medido
