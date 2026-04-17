---
title: "Escaneo de puertos — Legalidad, ética y uso seguro"
description: "Cuándo el escaneo de puertos es legal, cuándo es delito y cómo usar scanners con responsabilidad — con desglose por jurisdicción y comparación de herramientas."
category: security
relatedToolIds: ["port-scan"]
publishedAt: 2026-04-17
lang: es
tags: ["port-scanning", "security", "legality", "ethics"]
excerpt: "Escanear tus propios sistemas está bien. Escanear los de otro sin permiso es delito en la mayoría de jurisdicciones. Aquí va la línea, con citas."
---

El escaneo de puertos es el reconocimiento más barato que hay, por eso cada currículum de seguridad empieza con él y cada ingeniero junior acaba recibiendo una carta legal al respecto. La herramienta es neutra, la legalidad no. Esta guía cubre qué puedes escanear, qué necesita autorización y cómo usar scanners sin crear problemas para ti o el objetivo.

## La línea: autorización

En casi toda jurisdicción, el test es **autorización**, no intención. Escanear una IP que posees, o una para la que tienes permiso escrito, está bien. Escanear a un tercero sin permiso es acceso no autorizado bajo la mayoría de estatutos de computer-crime, incluso si no te conectas a nada y aunque no encuentres nada.

Qué cuenta como autorización:

- Posees la IP (tu red doméstica, tu servidor, la infraestructura de tu empresa si estás empleado para asegurarla)
- Permiso escrito del dueño — un documento de scope de bug bounty, una carta de engagement de pentest o un contrato
- Una plataforma pública que autoriza escaneo explícitamente: Hack The Box, TryHackMe, OverTheWire, objetivos CTF in-scope
- En casos raros, una exención estatutaria de investigación — son estrechas y específicas por jurisdicción

Qué no cuenta:

- "Estaba en Shodan así que es público"
- "Solo estaba comprobando si el puerto estaba abierto, no me conecté"
- "El sitio tiene una página de responsible disclosure" (disclosure ≠ autorización de escaneo)
- "Soy investigador de seguridad" (la ley no reconoce esto como categoría por sí sola en la mayoría de sitios)

## Resumen jurisdiccional

Las reglas difieren y sí importan. Una tabla corta no exhaustiva:

| Jurisdicción | Ley relevante | Posición sobre escaneo no autorizado |
|---|---|---|
| Estados Unidos | Computer Fraud and Abuse Act (CFAA), 18 U.S.C. § 1030 | Acceso no autorizado; escaneo por sí solo ha sido procesado, pero la jurisprudencia es mixta. Van Buren (2021) estrechó el alcance ligeramente. |
| Reino Unido | Computer Misuse Act 1990, § 1-3 | Acceso no autorizado a material informático es delito. Escaneo para identificar servicios ha sido imputado. |
| España | Código Penal, Artículo 197 bis (modificado 2015) | Acceso no autorizado o facilitación es punible; escaneo puro se procesa menos a menudo pero el estatuto lo cubre. |
| Alemania | §§ 202a, 202c StGB (Hackerparagraph) | Amplio; incluso poseer herramientas de escaneo "para" acceso no autorizado ha sido controvertido. |
| Francia | Article 323-1 du Code pénal | Acceso no autorizado; escaneo ha sido imputado como actos preparatorios. |
| Países Bajos | Wet Computercriminaliteit | Acceso no autorizado ilegal; existe guía de responsible disclosure pero no otorga derechos generales de escaneo. |
| Australia | Criminal Code Act 1995, Part 10.7 | Delitos de acceso no autorizado; escaneo ha sido procesado. |
| Brasil | Lei 12.737/2012 (Lei Carolina Dieckmann) | Acceso no autorizado criminalizado. |

No tomes esto como asesoría legal. El patrón en todas las jurisdicciones es el mismo: la autorización es el test. Si dudas, asume que es ilegal y consigue permiso escrito.

## Cuándo es claramente lícito

- Tus propias IPs, tus propios dominios, tus propias cuentas cloud
- Un engagement de pentest con SOW firmado y scope de IPs
- Un programa de bug bounty con el objetivo en scope (lee el scope — muchos programas excluyen explícitamente el escaneo activo)
- Entornos de laboratorio: Hack The Box, TryHackMe, objetivos de PortSwigger's Web Academy, DVWA, tus propias VMs
- Competiciones CTF, solo objetivos in-scope
- Rangos de IP públicos que tu empleador posee, si tu descripción de puesto cubre testing de seguridad

Si haces escaneo con fines de aprendizaje y no estás seguro de si un objetivo es válido, usa Hack The Box o similar. Existen precisamente para evitar este problema. También puedes usar la [herramienta de port scan](/es/port-scan) contra tus propios servidores para verificar los servicios expuestos.

## Cuándo es claramente un problema

- Escanear la infraestructura de un competidor de negocio "para ver qué corren"
- Ejecutar un scanner de rango amplio contra el espacio IP de un proveedor cloud sin autorización
- Escanear una app de citas, producto SaaS o servidor de juego que no estás autorizado a probar, aunque encuentres un bug
- Publicar resultados de escaneo en público, aunque el escaneo haya sido anónimo
- Escanear desde una IP que no quieres asociada a tu identidad — si necesitas esconderla, no deberías estar haciéndolo

Los scanners a escala de internet (ZMap, Masscan a velocidad completa) son su propia categoría. Aun operados legalmente por una institución de investigación, generan quejas de abuse. No los ejecutes desde una conexión residencial.

## Escaneo seguro y útil

Para uso legítimo — tu propia infraestructura, la de un cliente con autorización, o un laboratorio — elige herramientas según el trabajo:

```bash
# nmap: el por defecto, preciso, relativamente lento, gran detección de servicios
nmap -sS -sV -p- -T4 --open 192.0.2.10

# rustscan: descubrimiento rápido de puertos TCP, pipea a nmap para detección de servicios
rustscan -a 192.0.2.10 --ulimit 5000 -- -sV

# naabu: scanner SYN rápido de ProjectDiscovery, bueno para automatización
naabu -host 192.0.2.10 -p - -rate 1000

# masscan: stateless, muy rápido, puedes saturar tu propia red
masscan 192.0.2.10 -p0-65535 --rate 10000
```

Compromisos:

| Herramienta | Velocidad | Precisión | Detección de servicios | Mejor para |
|---|---|---|---|---|
| nmap | Media | La más alta | Sí, extensiva | Auditoría profunda, scripting (NSE) |
| rustscan | Muy rápida | Alta (puertos), delega detección | Vía pipe a nmap | Descubrimiento rápido de puertos antes de nmap |
| naabu | Muy rápida | Alta | No (combinar con otros) | Pipelines de automatización |
| masscan | La más rápida | Menor por puerto | No | Investigación a escala internet con autorización |

Un workflow típico: rustscan o naabu para descubrimiento de puertos, nmap con `-sV` en los puertos descubiertos para fingerprinting de servicios, follow-up manual en lo que sea interesante.

## Ética más allá de la legalidad

Legal no significa apropiado:

- **Rate limits**: escanear un objetivo pequeño a 10.000 paquetes por segundo puede saturar su red aunque estés autorizado. Empieza lento.
- **Ruido**: deja una tarjeta de visita en tu User-Agent o banner de escaneo si haces investigación, así el objetivo sabe a quién contactar.
- **Manejo de datos**: si tu escaneo revela incidentalmente datos expuestos (buckets S3 abiertos, paneles admin sin autenticar), no husmees más — repórtalo por un canal de responsible disclosure.
- **Logging**: guarda tus propios logs de qué escaneaste, cuándo y bajo qué autorización, durante unos años. Si alguien alguna vez se queja, quieres prueba.

## Si recibes una queja

Pasa — un email de abuse de un proveedor cloud, un cease-and-desist, o peor. El consejo es universal: para inmediatamente, preserva tus registros y consigue un abogado si escala más allá de "por favor, para". No discutas el punto técnico con el quejante. La pregunta "¿fue el escaneo dañino?" no es la pregunta legal; "¿estaba autorizado?" sí lo es.

## Más lectura en PingThat

- [/es/docs/http-status-codes-in-monitoring/](/es/docs/http-status-codes-in-monitoring/) — una vez identificados los servicios, monitorizar su salud es el siguiente paso
- [/es/docs/ssl-certificate-monitoring-basics/](/es/docs/ssl-certificate-monitoring-basics/) — el escaneo revela servicios TLS, luego compruebas sus certificados
- [/es/docs/dns-propagation-explained/](/es/docs/dns-propagation-explained/) — entender qué hostnames resuelven dónde es parte de conocer tu propia superficie de ataque
