---
title: "Propagación DNS — Por qué \"esperar 48 horas\" es casi siempre incorrecto"
description: "Los cambios DNS no se propagan — los cachés expiran. Cómo funcionan realmente TTL, negative caching y los resolvers públicos durante una migración."
category: dns
relatedToolIds: ["dns-lookup", "whois-lookup"]
publishedAt: 2026-04-17
lang: es
tags: ["dns", "ttl", "propagation", "resolvers"]
excerpt: "Nadie está \"propagando\" nada. DNS es un problema de expiración de caché, y puedes controlarlo en gran medida. Esto es lo que pasa de verdad."
faq:
  - q: "¿Por qué dig muestra resultados distintos según el resolver?"
    a: "Porque DNS es un problema de expiración de caché, no de propagación. Cuando cambias un registro, tu servidor autoritativo sirve el valor nuevo inmediatamente, pero los resolvers del mundo siguen con el valor viejo en caché hasta que expire su TTL individual. Un resolver que obtuvo tu registro hace 300 segundos con TTL de 3600 seguirá sirviendo datos stale durante otros 3300 segundos sin importar lo que cambies. Correr dig contra 1.1.1.1, 8.8.8.8 y 9.9.9.9 muestra respuestas distintas porque el caché de cada resolver expiró en un momento diferente."
  - q: "¿Qué tan bajo puedo poner el TTL de DNS?"
    a: "La mayoría de resolvers públicos respeta TTLs hasta unos 30 segundos (Cloudflare 1.1.1.1 impone un mínimo ~30s), y cualquier valor 60-300 segundos es seguro en la práctica. Algunos resolvers ISP y cachés corporativos imponen mínimos en torno a 300 segundos, así que valores por debajo se redondean hacia arriba en silencio. Para una migración, baja el TTL a 300 unas 24-48 horas antes del cambio, luego súbelo de vuelta a 3600 o 86400 una vez estable — lookups constantes para registros que no cambian son desperdicio."
  - q: "¿Se necesita DNSSEC para monitorizar DNS correctamente?"
    a: "No, pero si tu zona está firmada, la monitorización se complica. Los cachés stale son peores con DNSSEC porque los resolvers validadores también cachean registros RRSIG con sus propios TTLs. Cambiar un registro significa que la firma vieja también queda stale, y algunos resolvers validadores rechazan hasta que ambos expiren. Si usas DNSSEC, baja TTLs 72 horas antes de los cambios, nunca rotes claves DNSSEC durante una migración, y usa WHOIS para confirmar que tu registrador tiene el registro DS correcto — un DS mal pareado es la causa más común de fallos de validación."
  - q: "¿Qué es negative caching y cómo rompe registros DNS nuevos?"
    a: "Cuando un resolver consulta un nombre que no existe (NXDOMAIN) o un tipo de registro ausente (como un AAAA que no está), cachea la respuesta negativa. La duración del caché viene del campo mínimo del registro SOA. Si preguntas por mail.example.com, no existe, y tu resolver cachea NXDOMAIN durante 3600 segundos. Luego creas el registro — los usuarios siguen recibiendo NXDOMAIN durante la próxima hora. Para evitarlo, baja el mínimo SOA a 300 antes de crear nombres nuevos."
  - q: "¿Cuánto tardan realmente los cambios de NS?"
    a: "Los cambios de NS en tu registrador son el único caso donde 48 horas es una estimación razonable. Los nameservers del TLD mismos cachean los registros de delegación, y sus TTLs típicos son de 1-2 días. A diferencia de cambios normales de A o CNAME, no puedes bajar el TTL con antelación porque el TLD controla esos cachés. Planea migraciones de NS con más lead time: baja TTLs de sub-registros con antelación, mantén los nameservers viejos sirviendo datos correctos al menos 48 horas después del cambio, y verifica con dig +trace."
---

Cada tutorial de DNS te dice que "esperes 48 horas a que propague" después de un cambio. Ese consejo es una reliquia de cuando los registradores empujaban zone files a los servidores raíz según un calendario. El DNS moderno es un sistema de caché distribuido — no propaga nada, los cachés expiran. Entender la diferencia te ahorra horas mirando `dig` preguntándote por qué un resolver se actualizó y otro no.

## Qué es la "propagación" realmente

Cuando cambias un registro DNS, el servidor autoritativo sirve el nuevo valor inmediatamente. Lo que toma tiempo es el mundo de resolvers que aún tienen el valor viejo en caché. Cada copia cacheada expira en su propio horario, gobernado por el TTL (time-to-live) en segundos que el servidor autoritativo envió junto con la respuesta original.

Un resolver que obtuvo tu registro A viejo hace 300 segundos con TTL de 3600 servirá ese valor stale durante otros 3300 segundos, da igual lo que cambies arriba. No hay mecanismo para que el servidor autoritativo invalide cachés — solo espera a que expiren y vuelvan a pedir una respuesta fresca.

El consejo de "48 horas" es un peor caso que asume que algunos resolvers en configuraciones ISP oscuras tienen TTLs de 48 horas incrustados. Para los resolvers públicos a los que llega la mayoría de tus usuarios, la realidad es mucho más limpia.

## Los resolvers que importan

Entre un 70-80% de las queries DNS globales pasan por un puñado de resolvers públicos más los grandes de ISP. Todos los resolvers públicos importantes respetan el TTL que configuras, con redondeos menores:

| Resolver | IP | Comportamiento TTL |
|---|---|---|
| Cloudflare | 1.1.1.1 | Respeta TTL exactamente, mínimo ~30s |
| Google | 8.8.8.8 | Respeta TTL, redondea TTLs muy largos hacia abajo |
| Quad9 | 9.9.9.9 | Respeta TTL exactamente |
| OpenDNS | 208.67.222.222 | Respeta TTL, algunos mínimos en planes de pago |
| Resolvers ISP | varía | Suelen respetar TTL pero algunos imponen mínimo de 300s o máximo de 86400s |

La consecuencia práctica: si fijas un TTL de 300 segundos (5 minutos), el 80% de tus usuarios verá el registro nuevo en esos 5 minutos. El 20% restante está detrás de resolvers con su propio TTL mínimo (a menudo 1 hora), cachés corporativas, o el caché del propio sistema operativo. Verifica cualquier resolver con la [herramienta de DNS lookup](/es/dns-lookup/).

## Checklist pre-migración

Si sabes que vas a cambiar un registro (migración de IP, cambio de CDN, cambio de MX), baja el TTL 24-48 horas antes del cambio:

```dns
# Antes de migrar, fijar TTL bajo
example.com.  300  IN  A  192.0.2.10

# Esperar a que el TTL VIEJO (ej. 3600s) expire en todas partes
# Ahora puedes migrar con una ventana de recuperación de 5 minutos

# Tras estabilizar la migración, subir el TTL de nuevo
example.com.  3600  IN  A  192.0.2.20
```

Un TTL más bajo significa más queries a tu servidor autoritativo, pero durante 48 horas en torno a una migración ese coste es trivial. Una vez completada la migración, vuelve a subir el TTL a 3600 o 86400 — lookups DNS constantes para registros que nunca cambian son desperdicio.

## Negative caching: la que te pilla

Cuando un resolver pregunta por un nombre que no existe (NXDOMAIN) o un tipo de registro que no existe (por ejemplo, no hay AAAA), cachea la respuesta negativa. El TTL del negative caching viene del registro SOA, específicamente el campo mínimo:

```dns
example.com.  IN  SOA  ns1.example.com. admin.example.com. (
                  2026041700  ; serial
                  3600        ; refresh
                  1800        ; retry
                  1209600     ; expire
                  3600 )      ; TTL mínimo (para NXDOMAIN)
```

Escenario: preguntas por `mail.example.com`, no existe, tu resolver cachea "mail.example.com no existe" durante 3600 segundos. Creas el registro. Los usuarios reciben NXDOMAIN durante la próxima hora a pesar de que el registro está vivo. Baja el SOA mínimo a 300 antes de cambios que impliquen crear nombres nuevos.

## Usar dig +trace para saltarse los cachés

Cuando depuras un cambio, quieres preguntar al servidor autoritativo directamente, no a tu resolver. `dig +trace` camina desde los servidores raíz hacia abajo:

```bash
# Seguir toda la cadena de delegación, ignorar caché local
dig +trace example.com A

# Preguntar a un servidor autoritativo específico
dig @ns1.example.com example.com A

# Comparar respuestas de varios resolvers públicos
for r in 1.1.1.1 8.8.8.8 9.9.9.9; do
  echo "=== $r ==="
  dig @$r example.com A +short
done
```

Si `dig +trace` muestra el valor nuevo pero `dig @8.8.8.8` sigue mostrando el viejo, el cambio está vivo y solo estás esperando al caché de Google. Si `dig +trace` aún muestra viejo, el cambio no entró — revisa el panel de tu proveedor DNS.

## DNSSEC complica las cosas

Si tu zona está firmada, los cachés stale son peores porque los resolvers validadores también cachean registros RRSIG con sus propios TTLs. Cambiar un registro en una zona firmada significa que la firma del registro viejo también queda stale, y algunos resolvers validadores se ponen pesados hasta que ambos expiren. La regla: si usas DNSSEC, baja TTLs con más anticipación (72 horas) y no rotes llaves DNSSEC durante una migración. Usa la [herramienta de WHOIS](/es/whois-lookup/) para confirmar que tu registrador tiene el registro DS correcto publicado — un DS que no coincide es la razón más común de fallos de validación DNSSEC tras un cambio.

## Tipos de registro con sus propias reglas

Algunos tipos de registro se comportan algo distinto en caché:

| Tipo | Peculiaridades de caché |
|---|---|
| A/AAAA | Comportamiento TTL estándar |
| MX | Estándar, pero el email se reintenta durante días — MX viejo en caché duele menos |
| TXT (SPF/DKIM/DMARC) | Estándar, pero los lookups SPF ocurren por email, así que registros viejos causan fallos de autenticación |
| CAA | Solo se verifica al emitir cert, cacheado brevemente por CAs (8 horas típico en Let's Encrypt) |
| NS | Cacheado tanto por resolvers como por TLDs; cambiar NS sí puede tardar 48h |
| CNAME | Cacheado dos veces (el CNAME y la A final), así que TTL percibido = suma de ambos |

Los cambios de NS en tu registrador son el único caso legítimo donde "48 horas" es razonable, porque los nameservers del TLD mismos cachean la delegación.

## El resumen honesto

Los cambios DNS son rápidos si te preparaste (TTL bajo con anticipación). Los cambios DNS son lentos si no (TTL alto incrustado en cada caché). Si alguna vez estás tentado a decirle a alguien "espera 48 horas", pregunta primero: ¿cuál era el TTL original? Ese es tu peor caso real.

## Más lectura en PingThat

- [/es/docs/email-auth-spf-dkim-dmarc/](/es/docs/email-auth-spf-dkim-dmarc/) cubre registros DNS de autenticación de email y por qué fallan los lookups SPF
- [/es/docs/ssl-certificate-monitoring-basics/](/es/docs/ssl-certificate-monitoring-basics/) explica cómo interactúan los registros CAA con la renovación de certificados
- [/es/docs/http-status-codes-in-monitoring/](/es/docs/http-status-codes-in-monitoring/) muestra cómo los fallos DNS aparecen como errores HTTP en tus monitores
