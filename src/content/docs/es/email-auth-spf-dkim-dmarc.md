---
title: "Autenticación de email — SPF, DKIM y DMARC explicados correctamente"
description: "Cómo SPF, DKIM y DMARC funcionan juntos para autenticar email de verdad, con los gotchas que rompen la entregabilidad en producción."
category: email
relatedToolIds: ["email-auth", "dns-lookup"]
publishedAt: 2026-04-17
lang: es
tags: ["email", "spf", "dkim", "dmarc", "deliverability"]
excerpt: "Tres registros, un trabajo: probar que tu email es de verdad tuyo. Cómo funciona cada uno, cómo interactúan y las trampas que hunden tu entregabilidad en silencio."
faq:
  - q: "¿Necesito los tres: SPF, DKIM y DMARC?"
    a: "Sí, porque cada uno cubre un punto ciego que los otros tienen. SPF autentica la IP de envío pero se rompe con reenvío y mailing lists. DKIM firma el mensaje y sobrevive al reenvío, pero por sí solo no dice a los receptores qué hacer con los fallos. DMARC es la capa de política que dice a los receptores cómo manejar los fallos de SPF/DKIM y dónde enviar reportes. Sin DMARC, los receptores aplican sus propias heurísticas. Sin DKIM, el correo reenviado falla. Sin SPF, el spoofing directo desde IPs nuevas pasa sin reto. Los tres juntos es el único setup defendible."
  - q: "¿Por qué es arriesgado activar DMARC p=reject directamente?"
    a: "Porque los senders legítimos que no conoces van a fallar y ser rechazados. La mayoría de empresas tiene vendors olvidados enviando como su dominio — herramientas de marketing viejas, servicios transaccionales, proveedores de analítica, scripts internos. Ir directo a p=reject tira a todos junto con los spoofers. La progresión correcta es p=none durante 2-4 semanas (recoger reportes, identificar cada sender legítimo), luego p=quarantine con pct=10, rampa a 50 y 100 durante 2-4 semanas, y solo entonces cambiar a p=reject. Saltarse etapas rompe campañas reales."
  - q: "¿Cómo se ve un reporte agregado de DMARC?"
    a: "Los reportes agregados llegan como ficheros XML zipados, uno por receptor (Google, Microsoft, Yahoo, etc.) por día. Cada reporte lista IPs de origen enviando como tu dominio, el volumen de mensajes, la disposition aplicada (none, quarantine, reject) y los resultados de alignment de SPF y DKIM por separado. El XML raw es doloroso de leer — usa un parser como Dmarcian, Postmark, o una herramienta self-hosted. Los campos clave a vigilar: IPs de origen inesperadas con alto volumen, fallos de alignment agrupados en senders específicos, y patrones de disposition en el tiempo."
  - q: "¿Por qué mi registro SPF a veces devuelve permerror?"
    a: "SPF está limitado a 10 lookups DNS. Cada include:, a, mx o redirect= cuenta para ese límite, y los includes anidados multiplican rápidamente. Un registro con include:_spf.google.com, include:mailgun.org, include:sendgrid.net, include:_spf.salesforce.com e include:mktomail.com ya excede 10 porque _spf.google.com solo arrastra 4+ lookups anidados. Cuando SPF excede 10 lookups, los receptores devuelven permerror y la mayoría de motores de scoring lo tratan como si no hubiera SPF. El arreglo es SPF flattening — resolver todo a IPs raw periódicamente."
  - q: "¿Qué es el alignment de DKIM y por qué falla?"
    a: "Alignment DKIM significa que el dominio d= en la firma DKIM debe coincidir con el dominio del header From: (o un subdominio en modo relajado). Si tu proveedor de email firma con d=sendgrid.net pero envías como @example.com, DKIM técnicamente pasa para el dominio de SendGrid pero falla el alignment para el tuyo. DMARC trata DKIM no alineado como fallo. El arreglo es configurar DKIM custom en tu proveedor para que el dominio firmante coincida con tu dominio de envío — todo ESP mainstream lo soporta con un CNAME en DNS."
---

La autenticación de email tiene tres piezas — SPF, DKIM y DMARC — y la mayoría de equipos configuran una de ellas, declaran victoria y se preguntan por qué sus newsletters caen en spam. Esta guía recorre qué hace cada una, cómo interactúan y las malas configuraciones específicas que rompen la entregabilidad en el mundo real. Verifica el setup actual de cualquier dominio con la [herramienta de autenticación de email](/es/email-auth/).

## Los tres registros de un vistazo

| Registro | Ubicación DNS | Qué prueba | Tipo |
|---|---|---|---|
| SPF | `example.com` TXT | Esta IP está autorizada a enviar por este dominio | Basado en ruta |
| DKIM | `selector._domainkey.example.com` TXT | Este mensaje fue firmado por una clave controlada por este dominio | Criptográfico |
| DMARC | `_dmarc.example.com` TXT | Qué hacer cuando SPF/DKIM fallan, y dónde enviar reportes | Política |

Cada uno responde a una pregunta distinta. SPF pregunta "¿está el servidor de envío autorizado?", DKIM pregunta "¿fue alterado el mensaje en tránsito?", y DMARC pregunta "¿qué debería hacer el receptor si esos checks fallan?". Necesitas los tres porque cada uno por sí solo tiene puntos ciegos.

## SPF: autenticación por ruta con un límite duro

SPF (Sender Policy Framework) es un registro TXT listando las IPs y dominios autorizados a enviar email en tu nombre. Un registro típico:

```
example.com.  3600  IN  TXT  "v=spf1 mx a:mail.example.com include:_spf.google.com include:mailgun.org ip4:203.0.113.5 -all"
```

Los mecanismos:

- `v=spf1` — versión, siempre primero
- `mx` — permite cualquier IP en tus registros MX
- `a` — permite cualquier IP en un registro A para este dominio
- `a:host.example.com` — permite registros A para un host específico
- `include:domain` — incluye el SPF de otro dominio
- `ip4:` / `ip6:` — rangos IP raw
- `-all` — hard fail a todo lo demás
- `~all` — soft fail (entregable pero marcado)
- `+all` — permite todo (nunca usarlo)
- `?all` — neutral, que es lo que pasa si no tienes registro en absoluto

La trampa: **SPF está limitado a 10 lookups DNS**. Cada `include:`, `a`, `mx` o `redirect=` cuenta. Si tu SPF excede 10 lookups, los receptores tratan el registro como `permerror`, que la mayoría de motores de scoring tratan igual que no tener SPF. Un registro que se ve así ya está roto:

```
"v=spf1 include:_spf.google.com include:mailgun.org include:sendgrid.net include:_spf.salesforce.com include:mktomail.com -all"
```

Cada uno de esos includes anidados tiene sus propios lookups. `_spf.google.com` solo arrastra 4+. Verifica el tuyo con `dig +short TXT` y cuenta — o usa la [herramienta de DNS lookup](/es/dns-lookup/) para ver la cadena completa. SPF flattening (resolver todo a IPs raw una vez y actualizar en un horario) es el workaround común; varios servicios de pago lo automatizan.

## DKIM: firma criptográfica, por selector

DKIM (DomainKeys Identified Mail) firma cada mensaje saliente con una clave privada. La clave pública vive en DNS en un selector, así los receptores pueden verificar la firma:

```
mail2026._domainkey.example.com.  3600  IN  TXT  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
```

Opciones de clave:

- **RSA-2048** — baseline actual, ampliamente soportado, registros TXT más grandes (divididos en varias strings)
- **RSA-1024** — aún aceptado pero considerado débil, Gmail lleva años advirtiendo sobre esto
- **Ed25519** — más pequeño, más rápido, soporte emergente, aún no seguro como standalone por defecto

Rota selectores al menos anualmente. El selector es la parte `mail2026` de arriba — creas uno nuevo, lo añades a DNS, cambias tu servidor de correo, luego quitas el viejo tras 30 días (suficiente para que cualquier mensaje en vuelo se verifique). Buena práctica operativa es también rotar tras una sospecha de compromiso de clave o tras el despido de un empleado con acceso.

El alignment DKIM es lo que le importa a DMARC: el dominio `d=` en la firma DKIM debe coincidir con el dominio del header `From:` (o uno de sus subdominios en modo relajado). Si tu proveedor firma con `d=sendgrid.net` y envías desde `@example.com`, DKIM pasa para el dominio de SendGrid pero falla el alignment para el tuyo. Configura siempre DKIM custom para que el dominio firmante coincida con tu dominio de envío.

## DMARC: el pegamento de política

DMARC (Domain-based Message Authentication, Reporting and Conformance) se sienta encima de SPF y DKIM, diciendo a los receptores qué hacer cuando falla el alignment y dónde enviar reportes:

```
_dmarc.example.com.  3600  IN  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc-reports@example.com; pct=100; sp=reject; adkim=s; aspf=s"
```

Tags clave:

- `p=none` — solo monitorizar, sin enforcement. Empieza aquí.
- `p=quarantine` — enviar fallos a spam.
- `p=reject` — decir a los receptores que descarten fallos.
- `rua=` — reportes agregados (resúmenes XML diarios de receptores como Google, Microsoft, Yahoo)
- `ruf=` — reportes forenses (por mensaje, rara vez enviados en la práctica por leyes de privacidad — la mayoría de receptores no honra `ruf=`)
- `pct=` — porcentaje de correo al que aplica la política (rollout gradual: 10, 50, 100)
- `sp=` — política para subdominios. Si no lo fijas, los subdominios heredan `p=`. Pon `sp=reject` para bloquear spoofing de `cualquiercosa.example.com`.
- `adkim` / `aspf` — modo de alignment, `s` para estricto (coincidencia exacta de dominio), `r` para relajado (subdominios ok)

La progresión de política que todo equipo debe seguir:

| Etapa | Política | Duración | Objetivo |
|---|---|---|---|
| 1. Deploy | `p=none` | 2-4 semanas | Recoger reportes, encontrar cada sender legítimo |
| 2. Enforcement gradual | `p=quarantine; pct=10` | 1-2 semanas | Romper un slice pequeño, medir quejas |
| 3. Ramp | `p=quarantine; pct=50` luego `pct=100` | 2-4 semanas | Quarantine completo |
| 4. Enforce | `p=reject` | Continuo | Los spoofers caen, el correo legítimo no se ve afectado |

Saltarse etapas es cómo rompes una campaña de marketing. Los reportes agregados durante `p=none` te dicen cada IP enviando como tu dominio — algunas serán vendors que olvidaste, algunas herramientas internas legítimas, algunas spoofers. Hasta que no identifiques todos los senders legítimos y los metas en SPF/DKIM, hacer enforcement es prematuro.

## La interacción que rompe cosas

DMARC requiere que SPF O DKIM pase Y esté aligned. Pasar sin alignment no te salva. Escenarios comunes:

- **SPF pasa, alignment falla, sin DKIM**: DMARC falla. Este es el problema de email reenviado — una mailing list reenvía tu mensaje desde su propia IP con tu header `From:`.
- **DKIM pasa y hace alignment, SPF falla**: DMARC pasa. Por esto DKIM importa más que SPF para correo reenviado.
- **Ambos fallan**: DMARC aplica su política.

Lo práctico: configura DKIM en cada sender. SPF solo no sobrevive al reenvío. DKIM sobrevive a mailing lists que preservan headers, y es la única autenticación que funciona cuando un MTA intermedio reproduce un mensaje más tarde.

## Leer reportes agregados

Los reportes agregados llegan como ficheros XML zipados, uno por receptor por día. El XML raw es doloroso; usa un parser. Qué buscar:

- Volumen por IP origen: las top sources deberían ser todas senders que reconoces
- Disposition: `none`, `quarantine`, `reject` — confirma qué hicieron los receptores de verdad
- Resultados de alignment: separados para SPF y DKIM, te dice cuál está rompiéndose

Si ves volumen significativo de una IP que no reconoces pasando SPF, significa que un `include:` viejo en tu SPF aún autoriza a alguien que ya no usas. Límpialo.

## Más lectura en PingThat

- [/es/docs/dns-propagation-explained/](/es/docs/dns-propagation-explained/) — SPF/DKIM/DMARC viven todos en DNS, así que los TTLs de caché afectan los rollouts
- [/es/docs/ssl-certificate-monitoring-basics/](/es/docs/ssl-certificate-monitoring-basics/) — los certificados del servidor de correo también importan, para STARTTLS y MTA-STS
- [/es/docs/http-status-codes-in-monitoring/](/es/docs/http-status-codes-in-monitoring/) — monitorizar tu inbox de reportes DMARC sigue los mismos principios de alerting
