---
title: "Monitoreo de certificados SSL — Qué vigilar y cuándo alertar"
description: "Guía práctica para monitorizar certificados TLS — umbrales de expiración, registros CAA, OCSP stapling y lo que realmente falla en producción."
category: monitoring
relatedToolIds: ["ssl-checker", "is-it-up"]
publishedAt: 2026-04-17
lang: es
tags: ["ssl", "tls", "certificates", "monitoring"]
excerpt: "Un certificado expirado tira el sitio entero. Aquí va qué monitorizar, qué umbrales fijar y los fallos sutiles que se le escapan a la mayoría de checkers."
faq:
  - q: "¿Con cuántos días de antelación debería alertar sobre certificados TLS?"
    a: "Para un certificado Let's Encrypt o cualquier cert de 90 días con renovación automática, alerta a 30 días (info), 14 días (warning), 7 días (critical), 3 días (page) y 1 día (page más comms públicas). Para certificados renovados manualmente con validez de un año, sube la ventana a 60/30/14/7. La idea es que tu ventana de alerta cubra al menos dos ciclos completos de renovación — las renovaciones pueden fallar en silencio durante semanas antes de que el certificado expire de verdad, así que una ventana estrecha te deja sin tiempo de reacción."
  - q: "¿La auto-renovación de Let's Encrypt siempre funciona?"
    a: "No. Los fallos silenciosos comunes incluyen challenges HTTP-01 bloqueados por reglas de CDN o Basic auth sobre /.well-known/acme-challenge/, tokens API de DNS-01 caducados, rate limits alcanzados durante incidentes, y certbot corriendo bien pero el post-hook que recarga nginx no disparándose. Añade un test externo de integración que haga curl a tu sitio una vez al día y verifique que la fecha Not After del certificado hoja se mantiene más allá de 60 días. Si baja de 60, la cadena de renovación está rota y tienes unos 30 días para arreglarla antes de que salten las alertas."
  - q: "¿Qué es OCSP stapling y por qué debería monitorizarlo?"
    a: "OCSP stapling es cuando tu servidor obtiene periódicamente el estado de revocación del certificado desde la CA y lo adjunta al handshake TLS, haciendo los checks de revocación rápidos y privados. El modo de fallo es un nginx o Apache mal configurado sirviendo una respuesta stapled obsoleta, que los clientes rechazan. Si usas OCSP Must-Staple, un bug de stapling tira el sitio entero. Monitoriza la edad de la respuesta stapled — la mayoría de configs refresca cada hora, así que cualquier respuesta con más de 24 horas indica que el fetcher OCSP está roto."
  - q: "¿Por qué los registros CAA rompen silenciosamente las renovaciones TLS?"
    a: "Los registros CAA (Certificate Authority Authorization) dicen a las CAs públicas cuáles pueden emitir certificados para tu dominio. Si cambias de CA — por ejemplo de Let's Encrypt a ZeroSSL — y olvidas actualizar el registro CAA, la siguiente renovación falla con un mensaje que casi nadie lee. Un CAA que lista una CA que ya no usas es una caída a cámara lenta esperando a que la ventana de 90 días del cert actual se cierre. Monitoriza tus registros CAA junto con el certificado mismo."
  - q: "¿En qué debería hacer page y en qué warn para alertas de certificados?"
    a: "Page en: expira en menos de 3 días, hostname no coincide con la lista Subject Alternative Name, cadena rota que no verifica contra el root store de Mozilla, o certificado revocado. Warn en: expira 3-14 días, OCSP stapling obsoleto más de 24 horas, cadena incluye algoritmos deprecados (SHA-1, RSA menor a 2048, o desde 2026 RSA menor a 3072). Info en: expira 14-30 días, nuevo emisor detectado. Todo lo demás es ruido — evita alertar por soporte de TLS 1.0 o temas de política similares salvo que sea un proyecto rastreado."
---

Todo sysadmin tiene la misma historia: un certificado de producción expiró un domingo por la mañana, y el lunes se fue en explicar por qué el checkout estaba roto. Monitorizar certificados no es glamuroso, pero es una de las automatizaciones con mejor ROI que puedes poner. Esta guía cubre qué vigilar más allá de la fecha de expiración, porque "días hasta expirar" por sí solo se deja la mitad de los modos de fallo reales.

## Por qué la expiración no es suficiente

La expiración es el modo de fallo obvio, pero los certificados se rompen de varias maneras que un check ingenuo de "válido hasta" no detecta:

- La cadena de certificados está incompleta (el navegador lo acepta, `curl` no, o al revés)
- Falta el hostname en la lista de Subject Alternative Name
- La CA emisora fue distrustada (Symantec, TrustCor y otros en años recientes)
- OCSP stapling mal configurado, causando handshakes TLS de 3-5 segundos
- Un registro CAA bloquea tu CA de renovación
- La renovación corrió, pero el certificado nuevo nunca se cargó (no se recargó nginx)

Un monitor serio verifica todo esto. Puedes comprobar cualquiera rápido con el [SSL checker](/es/ssl-checker/) antes de poner un sitio de producción detrás de tu stack de monitorización.

## Umbrales de expiración que funcionan

Para un certificado Let's Encrypt con renovación automática, deberías alertar antes de lo que crees, porque la renovación puede fallar silenciosamente durante semanas antes de que el certificado expire de verdad:

| Días para expirar | Severidad | Qué hacer |
|---|---|---|
| 30 | Info | Registrar, sin acción si la auto-renovación va bien |
| 14 | Warning | Investigar — la renovación debería haber ocurrido ya |
| 7 | Critical | Intervención manual: `certbot renew --dry-run`, revisar logs |
| 3 | Page | Despertar a alguien |
| 1 | Page + comms | Prepararse para fallback a certificado de respaldo |

Para certificados renovados manualmente (validez más larga, a menudo 1 año), sube los umbrales: 60/30/14/7. El punto es que tu ventana de alerta debe cubrir al menos dos ciclos de renovación completos, así una renovación rota no te sorprende.

## Verifica la cadena de certificados, no solo la hoja

Un certificado con la cadena intermedia rota funciona en Chrome (que descarga intermedios faltantes vía AIA) pero falla en `curl`, Android, el cliente HTTP de Go y la mayoría de librerías HTTP de backend. Te enteras cuando empiezan a fallar los webhooks.

```bash
# Check de cadena completa — falla si falta algún intermedio
openssl s_client -connect example.com:443 -servername example.com \
  -showcerts < /dev/null

# Check más corto para fechas del certificado hoja
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -dates -subject -issuer
```

Un buen monitor parsea la cadena completa y verifica que cada eslabón llega a una raíz confiable. No dependas del navegador para decirte que la cadena está bien — los navegadores son demasiado permisivos.

## Registros CAA: el asesino de renovaciones que nadie revisa

Los registros CAA (Certificate Authority Authorization) en DNS dicen a las CAs públicas cuáles pueden emitir certificados para tu dominio. Son excelentes para seguridad, y rompen renovaciones silenciosamente si los añades incorrectamente.

```dns
example.com.  300  IN  CAA  0 issue "letsencrypt.org"
example.com.  300  IN  CAA  0 issue "pki.goog"
example.com.  300  IN  CAA  0 iodef "mailto:security@example.com"
```

Si cambias de Let's Encrypt a ZeroSSL y olvidas el registro CAA, la siguiente renovación falla con un mensaje que casi todo el mundo ignora. Añade monitorización CAA a tu checklist — un CAA que lista una CA que ya no usas es una caída a cámara lenta. Puedes consultar los registros CAA actuales con la [herramienta de DNS lookup](/es/dns-lookup/).

## OCSP stapling y OCSP Must-Staple

OCSP (Online Certificate Status Protocol) permite a un cliente verificar si un certificado fue revocado. Hay tres variantes, con distinto coste operativo:

- **OCSP plano** — el cliente consulta el responder OCSP de la CA. Lento, filtra datos de navegación a la CA, y si la CA está caída el cliente hace soft-fail (la mayoría de navegadores) o hard-fail
- **OCSP stapling** — tu servidor obtiene la respuesta OCSP periódicamente y la adjunta al handshake TLS. Rápido, privado, pero un nginx/Apache mal configurado sirve una respuesta stapled obsoleta y es rechazado
- **OCSP Must-Staple** — una extensión del certificado que dice a los clientes "rechaza cualquier handshake de este cert sin una respuesta stapled válida". Seguridad fuerte, pero un bug de configuración de stapling tira el sitio

Si usas stapling, monitoriza la edad de la respuesta stapled. La mayoría de configs de servidor refrescan cada hora; si la tuya está sirviendo una respuesta con más de 24h, algo va mal con el fetcher OCSP.

## Particularidades de Let's Encrypt

Los certificados Let's Encrypt son válidos 90 días por defecto, y `certbot` renueva a los 60 días. Los modos de fallo son predecibles:

- Rate limits alcanzados (50 certs por dominio registrado por semana) — raro, pero feo durante incidentes
- El challenge HTTP-01 falla porque `/.well-known/acme-challenge/` no es alcanzable (redirects, reglas de CDN, Basic auth)
- El challenge DNS-01 falla por un token de API caducado
- `certbot` renueva, pero el post-hook que recarga nginx nunca corre

Añade un test de integración: haz curl a tu propio sitio por la internet pública una vez al día y verifica que el "Not After" del certificado hoja está más allá de 60 días. Si baja de 60, tu cadena de renovación está rota y tienes ~30 días para arreglarla antes de que salten las alertas. Combínalo con un check de [is-it-up](/es/is-it-up/) para confirmar que el sitio sigue respondiendo tras la renovación.

## Sobre qué alertar realmente

El ruido mata la monitorización. Aquí va una base sensata para alertas de certificados:

- Page en: expira < 3 días, hostname no coincide, cadena rota (no verifica contra el root store de Mozilla), certificado revocado
- Warn en: expira 3-14 días, OCSP stapling obsoleto > 24h, cadena incluye algoritmo deprecado (SHA-1, RSA < 2048, o en 2026+, RSA < 3072)
- Info en: expira 14-30 días, nuevo emisor detectado, nuevo Subject Alternative Name añadido

Todo lo demás es ruido. No alertes por "TLS 1.0 soportado" salvo que el equipo de seguridad haya firmado su eliminación — eso es un proyecto, no una alerta.

## Más lectura en PingThat

- [/es/docs/dns-propagation-explained/](/es/docs/dns-propagation-explained/) cubre propagación CAA y por qué tu renovación puede esperar al TTL
- [/es/docs/http-status-codes-in-monitoring/](/es/docs/http-status-codes-in-monitoring/) explica con qué códigos de respuesta se manifiesta un fallo de certificado
- [/es/docs/uptime-sla-math/](/es/docs/uptime-sla-math/) pone una caída TLS de 4 horas en contexto contra tu presupuesto de SLA

Los certificados son aburridos hasta que dejan de serlo. Automatiza el check, fija umbrales conservadores y sigue adelante.
