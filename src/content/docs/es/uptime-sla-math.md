---
title: "Matemática de SLA de uptime — Qué significa realmente 99.9% vs 99.99% (y qué cuesta)"
description: "El coste real de cada nueve adicional en tu SLA de uptime, en minutos de caída, cambios de arquitectura y esfuerzo de ingeniería."
category: monitoring
relatedToolIds: ["is-it-up", "is-it-down"]
publishedAt: 2026-04-17
lang: es
tags: ["sla", "uptime", "monitoring", "availability"]
excerpt: "Cada nueve cuesta unas 10 veces más que el anterior. Aquí va la matemática honesta y lo que hace falta para entregar cada nivel de verdad."
---

Todos los slide decks de vendor prometen "cinco nueves" de uptime. La mayoría no los entrega, y la mayoría de clientes no los necesita. Entender la matemática de los niveles de disponibilidad, y lo que cada nivel cuesta en arquitectura y procesos, es cómo evitas sobre-ingenierizar (o peor, infra-ingenierizar) tus propios sistemas.

## El presupuesto de caída para cada nivel

Los porcentajes de disponibilidad suenan abstractos hasta que los conviertes a caída permitida. Aquí va la tabla práctica:

| Disponibilidad | Caída al año | Caída al mes | Caída por semana |
|---|---|---|---|
| 99% (dos nueves) | 87.6 horas | 7.3 horas | 1.68 horas |
| 99.5% | 43.8 horas | 3.65 horas | 50.4 min |
| 99.9% (tres nueves) | 8.76 horas | 43.8 min | 10.1 min |
| 99.95% | 4.38 horas | 21.9 min | 5.04 min |
| 99.99% (cuatro nueves) | 52.56 min | 4.38 min | 1.01 min |
| 99.999% (cinco nueves) | 5.26 min | 26.3 seg | 6.05 seg |

Fíjate en la curva: cada nueve adicional corta la caída aproximadamente 10x, y el presupuesto mensual de cada nivel cae más rápido de lo que parece intuitivo. 99.9% te da 43 minutos al mes — lo justo para absorber un mal deploy. 99.99% te da 4 minutos — apenas para enterarte, menos aún para responder.

## Lo que cada nivel requiere realmente

El presupuesto te dice qué está en juego. Lo que hace falta para entregarlo es otra historia:

- **99%** — un servidor, backups regulares, alguien que despierte con alertas. Proyectos hobby y herramientas internas.
- **99.5%** — monitoreo que funcione, rotación on-call, procedimiento de restore probado, control de cambios decente. SaaS pequeño.
- **99.9%** — infraestructura redundante a nivel app, load balancer, réplicas de base de datos (o DB gestionada), CDN, proceso real de incident response. La mayoría del SaaS mediano vive aquí.
- **99.95%** — 99.9% más multi-AZ en todo, failover automatizado, runbooks para los top 20 tipos de incidente, rotación on-call grande como para no quemar a la gente.
- **99.99%** — multi-región activo-pasivo, deploys sin downtime, remediación automatizada para fallos comunes, chaos engineering, equipo SRE dedicado. Ya eres una empresa de plataforma.
- **99.999%** — multi-región activo-activo, arquitectura basada en células, verificación formal de rutas críticas, NOC 24/7 con escalado por niveles, y respuesta automatizada sub-minuto. Pocas empresas fuera de telecom, banca y grandes proveedores cloud lo entregan.

El salto de 99.9% a 99.99% es donde la mayoría de organizaciones fallan en entregar lo que vendieron. Pasar de 99% a 99.9% suele ser un fin de semana de infraestructura redundante. Pasar de 99.9% a 99.99% es un proyecto de arquitectura de seis meses. Pasar de 99.99% a 99.999% es un esfuerzo multianual a nivel de empresa entera.

## La curva de coste es exponencial

Multiplicadores aproximados de coste de entrega (tiempo de ingeniería e infraestructura combinados):

```
99%     baseline (llámalo 1x)
99.5%   ~1.5x
99.9%   ~3x
99.95%  ~5x
99.99%  ~15x
99.999% ~75x
```

Estos números no son científicos, pero la forma es correcta. Cada nueve requiere eliminar una nueva clase de fallo. En 99% absorbes error humano; en 99.9% sobrevives al fallo de un solo servidor; en 99.99% sobrevives al fallo de una sola región; en 99.999% sobrevives al fallo de un solo proveedor. Cada uno es un orden de magnitud más caro que el anterior.

## Los créditos SLA no son compensación

Los SLAs de vendor suelen prometer créditos — 10% de la factura mensual si fallan su objetivo, 25% por brecha mayor, 100% en catástrofe. Lee los números reales. Un SLA 99.9% con 10% de crédito sobre una factura mensual de $500 significa $50 de vuelta si estuvieron caídos 43 minutos. Si tu sitio hizo $500/minuto durante esos 43 minutos, ese crédito cubre 6 segundos de ingresos perdidos.

Los créditos SLA son palanca reputacional, no financiera. Si la disponibilidad realmente importa a tu negocio, el crédito es irrelevante — necesitas el uptime, no el reembolso. Un monitor como [is-it-up](/es/is-it-up) te da una segunda opinión independiente cuando la página de estado de tu vendor discrepa de la realidad.

## Medir uptime honestamente

Tu uptime medido depende enteramente de tu setup de probes:

- Probe cada 60 segundos desde una ubicación: resolución máxima ~1 minuto. Una caída de 40 segundos puede pasar desapercibida.
- Probe cada 30 segundos desde 3 regiones: captura la mayoría de caídas cortas, pero pagas 3x el volumen de probes.
- Alerta en N fallos consecutivos: suaviza blips transitorios, pero N=3 a 60s significa un suelo de 3 minutos antes de alertar.

Para un objetivo de 99.99% (presupuesto 4 min/mes), hacer probe cada 60 segundos es demasiado grueso. Necesitas intervalos de 10-30s desde múltiples regiones. [Is it down](/es/is-it-down) es útil para el "alguien cree que está roto" que entra durante un incidente — compruebas desde fuera antes de gastar tiempo de ingeniería en un no-problema.

## El problema de disponibilidad compuesta

Si tu servicio depende de tres vendors, cada uno con SLA 99.9%, tu techo teórico es:

```
0.999 × 0.999 × 0.999 = 0.997 ≈ 99.7%
```

Eso son 26 horas de caída al año, no 9. Y eso asumiendo que las caídas de los tres vendors son independientes, lo cual no es verdad si los tres dependen del mismo DNS, IAM o red del mismo proveedor cloud. Tu techo real es peor que lo que sugiere la matemática.

## El tiempo medio de recuperación es la palanca

Un objetivo 99.99% con 4 minutos de presupuesto mensual significa que tu MTTR debe estar cómodamente bajo 4 minutos para la mayoría de incidentes. Eso no es timeline humano — es territorio de automatización:

```cron
# Ejemplo: auto-reiniciar un health check fallido cada minuto
* * * * * /usr/local/bin/check-health.sh || /usr/local/bin/restart-service.sh
```

Ese cron es de juguete, pero el principio es real. Para pegar cuatro nueves, la mayoría de la recuperación tiene que estar automatizada. MTTR con humano en el loop es 10-30 minutos incluso con un gran equipo, lo que te topa en 99.9% a 99.95% en la práctica.

## Elige el nivel que necesitas, no el que suena bien

La mayoría de clientes B2B SaaS aceptan 99.9%. La mayoría de apps de consumo aceptan 99.5%. La mayoría de herramientas internas aceptan "suele funcionar". Antes de comprometerte con 99.99%, comprueba si algún cliente lo pidió por escrito. La mayoría del tiempo "99.99%" en una página de ventas es aspiracional, no arquitectónico — y la brecha entre reclamación y realidad es donde muere la credibilidad.

## Más lectura en PingThat

- [/es/docs/http-status-codes-in-monitoring/](/es/docs/http-status-codes-in-monitoring/) — cómo los códigos de estado mapean a tu contabilidad de caída
- [/es/docs/ssl-certificate-monitoring-basics/](/es/docs/ssl-certificate-monitoring-basics/) — las expiraciones de certificados son top-10 en causas de caída "no planeada"
- [/es/docs/dns-propagation-explained/](/es/docs/dns-propagation-explained/) — los problemas DNS parecen caída pero tienen su propia línea de recuperación
