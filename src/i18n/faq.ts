import type { Lang } from "./index";

/**
 * FAQ content for the top 5 PingThat tools.
 * Consumed by Layout.astro to emit FAQPage JSON-LD for rich results.
 */

export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQContent {
  faqs: FAQ[];
}

type FAQByLang = Record<Lang, FAQContent>;

export const faqs: Record<string, FAQByLang> = {
  "my-ip": {
    en: {
      faqs: [
        {
          question: "How does 'What Is My IP' find my public IP address?",
          answer: "The page makes a request to a lookup API which reads the IP seen by the server — that's your public IP, the one the internet associates with your connection. It also returns the approximate city and country (from a GeoIP database), the ISP or hosting provider, the ASN (Autonomous System Number), and whether the IP is IPv4 or IPv6. Local/private IPs (192.168.x.x, 10.x.x.x) are not what you see here — those live inside your LAN only.",
        },
        {
          question: "Is the IP checker free?",
          answer: "Yes, completely free. No signup, no query limit beyond reasonable abuse protection, no paywall on any of the returned fields. Check your IP as often as you need — useful before connecting to a server, confirming a VPN is working, or troubleshooting geo-blocked content. All PingThat network tools are in the same free tier.",
        },
        {
          question: "Does checking my IP log or store it?",
          answer: "Your IP is inherently visible to any server you request a page from — that's how the internet works. The lookup itself reads your IP but PingThat does not persist it or associate it with an identity or fingerprint. Standard CDN/web logs apply (as they do on any site), but there is no account, no analytics profile, no retention of your lookups beyond short-term operational logs.",
        },
        {
          question: "Why does my IP address location look slightly off?",
          answer: "GeoIP databases map IP ranges to locations based on ISP filings, which are often accurate to the city but sometimes off by a region or even country for roaming, mobile, or carrier-grade NAT IPs. A location that's 50–200km off isn't unusual. If you need a precise location, GeoIP is the wrong tool — it's not GPS. For ISP/ASN info it's reliable; for pinpointing a device, it isn't.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo descubre 'What Is My IP' mi dirección IP pública?",
          answer: "La página hace una petición a una API de consulta que lee la IP que ve el servidor — esa es tu IP pública, la que internet asocia con tu conexión. Además devuelve la ciudad y país aproximados (de una base GeoIP), el ISP o proveedor de hosting, el ASN (número de sistema autónomo) y si es IPv4 o IPv6. Las IPs locales/privadas (192.168.x.x, 10.x.x.x) no aparecen aquí — viven solo dentro de tu LAN.",
        },
        {
          question: "¿El comprobador de IP es gratis?",
          answer: "Sí, completamente gratis. Sin registro, sin límite de consultas más allá de una protección anti-abuso razonable, sin pago en ninguno de los campos devueltos. Consulta tu IP cuantas veces necesites — útil antes de conectar a un servidor, confirmar que la VPN funciona o diagnosticar contenido geobloqueado. Todas las herramientas de red de PingThat están en el mismo plan gratuito.",
        },
        {
          question: "¿Comprobar mi IP la registra o almacena?",
          answer: "Tu IP es inherentemente visible para cualquier servidor al que pidas una página — así funciona internet. La consulta en sí lee tu IP pero PingThat no la persiste ni la asocia a una identidad o huella. Aplican logs estándar de CDN/web (como en cualquier sitio), pero no hay cuenta, ni perfil de analytics, ni retención de tus consultas más allá de logs operativos a corto plazo.",
        },
        {
          question: "¿Por qué la ubicación de mi IP parece ligeramente incorrecta?",
          answer: "Las bases GeoIP mapean rangos de IP a ubicaciones según registros del ISP, a menudo precisos a ciudad pero a veces desplazados a otra región o país en IPs de roaming, móvil o CGNAT de operador. Una desviación de 50–200km no es rara. Si necesitas una ubicación precisa, GeoIP no es la herramienta — no es GPS. Para info de ISP/ASN es fiable; para localizar un dispositivo, no.",
        },
      ],
    },
  },
  "dns-lookup": {
    en: {
      faqs: [
        {
          question: "How do I perform a DNS lookup on a domain?",
          answer: "Enter a domain (example.com) and pick the record type — A (IPv4), AAAA (IPv6), MX (mail), CNAME (aliases), TXT (SPF/verification), NS (nameservers), SOA (authority) — or run ALL to see everything at once. The tool queries a DNS resolver over DNS-over-HTTPS and returns the records with TTL values, so you know how long they're cached. Useful for debugging email delivery, verifying SPF/DKIM, or confirming DNS propagation after a change.",
        },
        {
          question: "Is the DNS lookup tool free?",
          answer: "Yes, fully free with no signup and no query cap. Look up any domain as often as you need — whether you're troubleshooting your own DNS, checking a competitor's setup, or verifying that a client's records have propagated after a migration. All PingThat network tools share the same open tier.",
        },
        {
          question: "Does DNS lookup query external servers with my domain?",
          answer: "Yes, by necessity. DNS lookups need to hit an actual DNS resolver — the tool uses public DoH (DNS-over-HTTPS) endpoints like Cloudflare's 1.1.1.1 or Google's 8.8.8.8 to resolve records. The domain you lookup is sent to those resolvers as part of the query; that's how DNS works. Your IP is not associated with the domain by PingThat, but the upstream resolver will see the query the same way it does for any DNS request.",
        },
        {
          question: "Why don't I see the record I just updated?",
          answer: "DNS changes are cached at many levels — your OS, your ISP's resolver, and the public resolvers the tool uses. Each level honors the TTL value that was set on the old record, so a TTL of 3600 means waiting up to an hour. Lowering TTL before a planned change helps. Use the tool across multiple record types to see what cache is currently serving, and compare against your authoritative nameserver directly to confirm the change is live at the source.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo hago una consulta DNS a un dominio?",
          answer: "Introduce un dominio (ejemplo.com) y elige el tipo de registro — A (IPv4), AAAA (IPv6), MX (correo), CNAME (alias), TXT (SPF/verificación), NS (nameservers), SOA (autoridad) — o ejecuta ALL para verlos todos de una vez. La herramienta consulta un resolver DNS sobre DNS-over-HTTPS y devuelve los registros con sus TTL, así sabes cuánto están cacheados. Útil para depurar entrega de email, verificar SPF/DKIM o confirmar la propagación DNS tras un cambio.",
        },
        {
          question: "¿La herramienta DNS Lookup es gratis?",
          answer: "Sí, totalmente gratis, sin registro ni límite de consultas. Busca cualquier dominio cuantas veces necesites — ya sea para diagnosticar tu propio DNS, revisar la configuración de un competidor o verificar que los registros de un cliente han propagado tras una migración. Todas las herramientas de red de PingThat comparten el mismo plan abierto.",
        },
        {
          question: "¿DNS Lookup consulta servidores externos con mi dominio?",
          answer: "Sí, por necesidad. Las consultas DNS tienen que llegar a un resolver DNS real — la herramienta usa endpoints DoH públicos (DNS-over-HTTPS) como 1.1.1.1 de Cloudflare o 8.8.8.8 de Google para resolver registros. El dominio que consultas se envía a esos resolvers como parte de la petición; así funciona el DNS. Tu IP no se asocia al dominio desde PingThat, pero el resolver upstream verá la consulta igual que cualquier otra petición DNS.",
        },
        {
          question: "¿Por qué no veo el registro que acabo de actualizar?",
          answer: "Los cambios DNS se cachean en muchos niveles — tu SO, el resolver de tu ISP y los resolvers públicos que usa la herramienta. Cada nivel respeta el TTL del registro anterior, así un TTL de 3600 implica esperar hasta una hora. Bajar el TTL antes de un cambio planeado ayuda. Usa la herramienta contra varios tipos de registro para ver qué está sirviendo la caché, y compara contra tu nameserver autoritativo directamente para confirmar que el cambio está vivo en origen.",
        },
      ],
    },
  },
  "ssl-checker": {
    en: {
      faqs: [
        {
          question: "How does the SSL checker test a certificate?",
          answer: "Enter a hostname (example.com) and the tool opens a TLS connection, fetches the full certificate chain, and reports issuer, subject, validity dates, SANs, signature algorithm and chain trust. It also checks HSTS headers and looks up the cert in Certificate Transparency logs to spot misissuance. You see exactly what a browser sees when it validates your HTTPS — useful for catching expiry risks, chain misconfigurations, or TLS version problems.",
        },
        {
          question: "Is the SSL checker free?",
          answer: "Yes, completely free with no signup. Check as many domains as you want — production sites, staging, internal subdomains accessible from the internet — no rate limits beyond abuse protection. All PingThat tools are in one open tier, which is why devs and sysadmins keep it in their bookmarks for quick cert sanity checks.",
        },
        {
          question: "Does the SSL checker connect to external servers?",
          answer: "Yes, inherently. Checking an SSL certificate means actually opening a TLS handshake to the host and pulling its cert. The tool performs that handshake from the server side, then relays the result to your browser — your IP is not what connects to the target host. The hostname you check IS sent to the checker backend and to Certificate Transparency log APIs, since looking up CT entries requires it.",
        },
        {
          question: "What does 'chain of trust' failure mean?",
          answer: "Every certificate is signed by an intermediate CA, which is signed by a root CA that browsers trust natively. If your server only sends the leaf cert and not the intermediate, modern browsers may fail to validate even though the cert itself is fine. The checker flags this explicitly: 'incomplete chain, intermediate missing'. Fix by including the intermediate cert in your server's cert bundle — your CA provides it.",
        },
        {
          question: "Why does the checker say my cert expires soon even though I renewed?",
          answer: "The tool reports what the server is currently serving. If you renewed with your CA but haven't deployed the new cert to the server (or to your load balancer, CDN, or reverse proxy), the old one is still live. Also check you deployed to all hosts in a fleet — it's common to update one and forget the backup. Rerun the check after deployment to confirm the new validity dates are visible.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo prueba el certificado el SSL Checker?",
          answer: "Introduce un hostname (ejemplo.com) y la herramienta abre una conexión TLS, trae la cadena completa de certificados y reporta emisor, sujeto, fechas de validez, SANs, algoritmo de firma y confianza de cadena. También comprueba las cabeceras HSTS y busca el cert en los logs de Certificate Transparency para detectar mala emisión. Ves exactamente lo que ve un navegador al validar tu HTTPS — útil para detectar riesgos de expiración, cadenas mal configuradas o problemas de versión TLS.",
        },
        {
          question: "¿El SSL Checker es gratis?",
          answer: "Sí, completamente gratis y sin registro. Comprueba cuantos dominios quieras — producción, staging, subdominios internos accesibles desde internet — sin límite más allá de protección anti-abuso. Todas las herramientas de PingThat están en un único plan abierto, por eso devs y sysadmins la guardan en marcadores para chequeos rápidos.",
        },
        {
          question: "¿El SSL Checker conecta a servidores externos?",
          answer: "Sí, por naturaleza. Comprobar un certificado SSL implica abrir un handshake TLS al host y traer su cert. La herramienta ejecuta ese handshake desde el backend y reenvía el resultado a tu navegador — tu IP no es la que conecta al host objetivo. El hostname que compruebas SÍ se envía al backend del checker y a las APIs de CT logs, ya que consultar entradas CT lo requiere.",
        },
        {
          question: "¿Qué significa un fallo de 'cadena de confianza'?",
          answer: "Cada certificado está firmado por una CA intermedia, que a su vez está firmada por una CA raíz que los navegadores confían nativamente. Si tu servidor solo envía el cert hoja y no el intermedio, los navegadores modernos pueden fallar al validar aunque el cert en sí esté bien. El checker lo marca explícitamente: 'cadena incompleta, intermedio ausente'. Se soluciona incluyendo el cert intermedio en el bundle de tu servidor — tu CA lo proporciona.",
        },
        {
          question: "¿Por qué el checker dice que mi cert expira pronto si ya lo renové?",
          answer: "La herramienta reporta lo que el servidor está sirviendo ahora. Si renovaste con tu CA pero no desplegaste el nuevo cert al servidor (o al balanceador, CDN o proxy inverso), el viejo sigue vivo. Comprueba también que desplegaste en todos los hosts de una flota — es habitual actualizar uno y olvidar el backup. Vuelve a ejecutar la comprobación tras el despliegue para confirmar que las nuevas fechas son visibles.",
        },
      ],
    },
  },
  "jwt-decoder": {
    en: {
      faqs: [
        {
          question: "How do I decode a JWT?",
          answer: "Paste the JWT (three Base64URL segments separated by dots: header.payload.signature) and the decoder splits it, Base64URL-decodes the header and payload into readable JSON, and displays both alongside the raw signature. Standard claims — exp, iat, nbf, iss, sub, aud — are shown with human-readable timestamps so you can immediately see if the token is expired. The decoder does not verify the signature; it only inspects the token contents.",
        },
        {
          question: "Is the JWT decoder free?",
          answer: "Yes, completely free, no signup, no limits. Paste as many tokens as you need during a debugging session. All PingThat tools — JWT decoder, DNS lookup, SSL checker, IP tools — share one open tier. The decoder is designed to be the fastest way from a suspect token to a readable payload.",
        },
        {
          question: "Does the JWT decoder upload my token?",
          answer: "No. Decoding a JWT is pure Base64URL → JSON work, done entirely in your browser. Your token — which might be a production access token for an API, or a signed session cookie — is never uploaded or logged. This is the whole point: a cloud service that received your JWT could impersonate the user until the token expired. The decoder stays client-side precisely to avoid that risk.",
        },
        {
          question: "Can the decoder verify the signature?",
          answer: "The basic decoder displays the header, payload and raw signature, but doesn't validate the signature against a key — doing so requires the issuer's public key (for RS256) or the shared secret (for HS256), which varies per application. Some decoders offer signature verification if you paste the key; that's a separate flow. For decoding alone, no key is needed, and that's what the tool focuses on.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo decodifico un JWT?",
          answer: "Pega el JWT (tres segmentos Base64URL separados por puntos: header.payload.signature) y el decodificador lo divide, decodifica Base64URL del header y payload a JSON legible, y muestra ambos junto a la firma en crudo. Claims estándar — exp, iat, nbf, iss, sub, aud — aparecen con marcas de tiempo legibles para que veas al instante si el token ha caducado. El decodificador no verifica la firma; solo inspecciona el contenido.",
        },
        {
          question: "¿El decodificador JWT es gratis?",
          answer: "Sí, completamente gratis, sin registro, sin límites. Pega cuantos tokens necesites en una sesión de depuración. Todas las herramientas de PingThat — JWT decoder, DNS lookup, SSL checker, herramientas IP — comparten un único plan abierto. El decodificador está pensado para ser la vía más rápida de un token sospechoso a un payload legible.",
        },
        {
          question: "¿El decodificador JWT sube mi token?",
          answer: "No. Decodificar un JWT es trabajo puro de Base64URL → JSON, hecho íntegramente en tu navegador. Tu token — que puede ser un access token de producción para una API o una cookie de sesión firmada — nunca se sube ni se registra. Ese es el sentido: un servicio en la nube que recibiera tu JWT podría suplantar al usuario hasta la expiración. El decodificador se queda en cliente precisamente para evitar ese riesgo.",
        },
        {
          question: "¿El decodificador puede verificar la firma?",
          answer: "El decodificador básico muestra header, payload y firma en crudo, pero no valida la firma contra una clave — hacerlo requiere la clave pública del emisor (para RS256) o el secreto compartido (para HS256), que varía por aplicación. Algunos decodificadores ofrecen verificación si pegas la clave; eso es un flujo aparte. Para decodificar sin más no hace falta clave, y es en lo que la herramienta se centra.",
        },
      ],
    },
  },
  "subnet-calculator": {
    en: {
      faqs: [
        {
          question: "How does the subnet calculator work?",
          answer: "Enter a CIDR notation (192.168.1.0/24) or an IP and subnet mask, and the calculator derives the network address, broadcast address, usable host range, total host count, and wildcard mask. It also shows the binary representation of the mask and the IP for teaching purposes. Useful when carving up a /16 into /24 subnets, planning VPC address ranges, or decoding what a firewall rule actually covers.",
        },
        {
          question: "Is the subnet calculator free?",
          answer: "Yes, completely free with no signup. Run unlimited calculations — IPv4 or IPv6, any mask length from /0 to /32 (or /128 for IPv6). All PingThat tools are fully open in one tier. The calculator is a fast reference for anyone working with network infrastructure, from home labs to cloud VPCs.",
        },
        {
          question: "Does the subnet calculator send my IP ranges anywhere?",
          answer: "No. The math — bitwise AND for network address, bitwise OR with wildcard for broadcast, etc. — runs entirely in your browser. The ranges you type, whether they're public internet blocks or private RFC1918 addresses inside your VPC, never leave your device. This matters because network architecture often counts as confidential internal infrastructure.",
        },
        {
          question: "What's the difference between a /24 and a /23 subnet?",
          answer: "A /24 has 256 addresses (254 usable hosts, minus the network and broadcast), a typical LAN subnet. A /23 is twice as big: 512 addresses, 510 usable hosts. Each bit less in the prefix doubles the address space. The calculator shows the exact counts so you can size a subnet to your host count without wasting IP space, or verify whether a plan actually accommodates your projected growth.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo funciona la calculadora de subredes?",
          answer: "Introduce una notación CIDR (192.168.1.0/24) o una IP con máscara de subred y la calculadora deriva la dirección de red, la de broadcast, el rango de hosts útiles, el total de hosts y la máscara wildcard. También muestra la representación binaria de la máscara y la IP con fines didácticos. Útil al dividir un /16 en /24, planificar rangos de VPC o descifrar qué cubre realmente una regla de firewall.",
        },
        {
          question: "¿La calculadora de subredes es gratis?",
          answer: "Sí, completamente gratis y sin registro. Ejecuta cálculos ilimitados — IPv4 o IPv6, cualquier longitud de máscara de /0 a /32 (o /128 en IPv6). Todas las herramientas de PingThat están abiertas en un mismo plan. La calculadora es una referencia rápida para cualquiera que trabaje con red, desde labs caseros hasta VPCs en cloud.",
        },
        {
          question: "¿La calculadora envía mis rangos IP a algún servidor?",
          answer: "No. La matemática — AND bit a bit para red, OR con wildcard para broadcast, etc. — se ejecuta íntegramente en tu navegador. Los rangos que introduces, sean bloques públicos de internet o direcciones privadas RFC1918 dentro de tu VPC, nunca salen de tu dispositivo. Importa porque la arquitectura de red suele considerarse infraestructura interna confidencial.",
        },
        {
          question: "¿Cuál es la diferencia entre una subred /24 y /23?",
          answer: "Una /24 tiene 256 direcciones (254 hosts útiles, menos la de red y la de broadcast), una subred LAN típica. Una /23 es el doble: 512 direcciones, 510 hosts útiles. Cada bit menos en el prefijo duplica el espacio. La calculadora muestra los conteos exactos para dimensionar la subred a tu número de hosts sin desperdiciar espacio, o verificar si un plan cubre tu crecimiento previsto.",
        },
      ],
    },
  },

  "caa-lookup": {
    en: {
      faqs: [
        { question: "What does a CAA record actually do?", answer: "A CAA record tells Certificate Authorities whether they are allowed to issue certificates for your domain. CAs are required by the CA/Browser Forum Baseline Requirements to check CAA before issuance. If your record says only Let's Encrypt is allowed and someone tries to get a cert from a different CA, that CA must refuse. Without CAA, any trusted public CA can issue for you — including attackers who social-engineer a different CA." },
        { question: "What's the difference between issue and issuewild?", answer: "The issue tag authorises a CA to issue standard certificates for the domain. The issuewild tag controls wildcard certificates (*.example.com) specifically. If you publish issuewild records, wildcards fall under that policy and ignore the issue policy. If you publish only issue records, wildcards inherit it. A common pattern: allow LE for standard certs via issue, but exclude wildcards by publishing issuewild with an empty value." },
        { question: "Does CAA apply to the apex or to subdomains?", answer: "CAA is inherited down the tree. A CA checks the exact domain first, then walks up: api.app.example.com → app.example.com → example.com. The first zone with CAA records applies — that's why PingThat shows 'Policy inherited from X' when a subdomain has no records but an ancestor does. Publish policy at the apex to cover everything below it." },
        { question: "What happens if I don't publish CAA?", answer: "Any trusted public CA can issue certificates for your domain. That's how most of the internet operates today, and for most sites it's acceptable because of Certificate Transparency — any mis-issuance gets logged publicly and you'd notice via CT monitoring. But CAA is a cheap additional layer: five minutes of DNS config prevents an entire class of attacks involving compromised or misled CAs." },
      ],
    },
    es: {
      faqs: [
        { question: "¿Qué hace realmente un registro CAA?", answer: "Un registro CAA le dice a las Autoridades Certificadoras si pueden emitir certificados para tu dominio. Las CAs están obligadas por los CA/Browser Forum Baseline Requirements a comprobar CAA antes de emitir. Si tu registro solo permite Let's Encrypt y alguien pide un cert en otra CA, esa CA debe rechazar. Sin CAA, cualquier CA pública de confianza puede emitir por ti — incluidos atacantes que engañen a otra CA." },
        { question: "¿Cuál es la diferencia entre issue e issuewild?", answer: "La etiqueta issue autoriza a una CA a emitir certificados estándar. La etiqueta issuewild controla específicamente los wildcard (*.ejemplo.com). Si publicas issuewild, los wildcard siguen esa política e ignoran issue. Si solo publicas issue, los wildcard la heredan. Patrón común: permitir LE para certs estándar via issue, pero excluir wildcards publicando issuewild con valor vacío." },
        { question: "¿CAA aplica al apex o a subdominios?", answer: "CAA se hereda hacia abajo del árbol. Una CA comprueba el dominio exacto primero y luego sube: api.app.ejemplo.com → app.ejemplo.com → ejemplo.com. La primera zona con registros CAA se aplica — por eso PingThat muestra 'Política heredada de X' cuando un subdominio carece de registros pero un ancestro sí tiene. Publica la política en el apex para cubrir todo lo que cuelgue debajo." },
        { question: "¿Qué pasa si no publico CAA?", answer: "Cualquier CA pública de confianza puede emitir certificados para tu dominio. Así funciona la mayor parte de internet y para muchos sitios es aceptable gracias a Certificate Transparency — cualquier emisión indebida queda en logs públicos y lo detectas con monitorización CT. Pero CAA es una capa extra barata: cinco minutos de config DNS previenen toda una clase de ataques con CAs comprometidas o engañadas." },
      ],
    },
  },

  "ipv6-check": {
    en: {
      faqs: [
        { question: "Why does IPv6 readiness matter if my site already works?", answer: "Mobile carriers, datacentres, and many ISPs run IPv6-only networks. When those users hit your IPv4-only site they go through NAT64/DNS64 which adds latency, breaks some protocols, and is a known source of intermittent failures. Full dual-stack (apex + www + NS + MX with AAAA) serves them directly over v6, faster and more reliably. The score surfaces exactly which layer is still v4-only." },
        { question: "Do nameservers and mail servers need AAAA too?", answer: "Yes — otherwise IPv6-only resolvers can't reach your nameservers (DNS resolution fails), and IPv6-only mail servers can't deliver to you (mail bounces). The apex and www are the obvious parts but the infrastructure layers are where most domains still fail. PingThat flags those separately so you know where the real gap is." },
        { question: "Is getting a 4/4 expensive?", answer: "Not if you use a modern DNS provider and a modern mail provider — both Cloudflare and major mail services publish AAAA automatically for their infrastructure. You inherit that just by delegating your domain there. The only gap for most hosting setups is ensuring your own origin has an AAAA record; most VPS and cloud providers give you an IPv6 address for free." },
        { question: "Why is the www check special?", answer: "Many setups make apex work via an ALIAS/ANAME that includes AAAA but forget to configure www the same way. PingThat tests them separately because they commonly diverge. If www.example.com is v4-only but the apex is dual-stack, IPv6-only users typing www in the browser still hit the NAT64 fallback path." },
      ],
    },
    es: {
      faqs: [
        { question: "¿Por qué importa la preparación IPv6 si mi sitio ya funciona?", answer: "Las operadoras móviles, los datacentres y muchos ISPs usan redes IPv6-only. Cuando esos usuarios entran en tu sitio IPv4-only pasan por NAT64/DNS64 que añade latencia, rompe algunos protocolos y causa fallos intermitentes. El dual-stack completo (apex + www + NS + MX con AAAA) les sirve directamente por v6, más rápido y fiable. La puntuación revela exactamente qué capa sigue siendo solo v4." },
        { question: "¿Los nameservers y servidores de correo también necesitan AAAA?", answer: "Sí — si no, los resolvers IPv6-only no pueden llegar a tus nameservers (falla la resolución DNS) y los servidores de correo IPv6-only no pueden entregarte correo (rebotan). Apex y www son la parte obvia pero las capas de infraestructura son donde siguen fallando la mayoría de dominios. PingThat las marca por separado para que sepas dónde está el hueco real." },
        { question: "¿Llegar a 4/4 es caro?", answer: "No si usas un proveedor DNS y de correo modernos — Cloudflare y los servicios de correo mayores publican AAAA automáticamente para su infraestructura. Lo heredas solo con delegar el dominio ahí. El único hueco en muchos hostings es asegurar que tu origen tenga AAAA; la mayoría de VPS y cloud te dan IPv6 gratis." },
        { question: "¿Por qué el check de www es especial?", answer: "Muchas configuraciones hacen que el apex funcione vía ALIAS/ANAME que incluye AAAA pero olvidan configurar www igual. PingThat los prueba por separado porque suelen divergir. Si www.ejemplo.com es solo v4 pero el apex es dual-stack, los usuarios IPv6-only que escriban www seguirán cayendo por el camino de NAT64." },
      ],
    },
  },

  "dnssec-check": {
    en: {
      faqs: [
        { question: "What's the difference between Bogus and Insecure?", answer: "Insecure means the zone isn't signed at all — no DNSKEY, no DS — and resolvers accept answers without validation. It's the default for most domains and it's fine. Bogus means the zone IS signed but validation fails — DS says 'this zone is signed' but the signatures don't check out. Bogus is a production outage: validating resolvers return SERVFAIL instead of your records, so every user on those resolvers can't reach you. Always fix Bogus urgently." },
        { question: "Why does my DNSKEY query return empty on a Bogus zone?", answer: "Cloudflare's 1.1.1.1 is a validating resolver. When DNSSEC validation fails, it refuses to return the signed records to you — that's the whole point of DNSSEC. So on a Bogus zone, DNSKEY appears as 0 answers even though the authoritative server is serving them. PingThat detects this by combining Status=2 (SERVFAIL) on the A query with DS presence at the parent, which is the exact fingerprint of a Bogus zone." },
        { question: "Should I enable DNSSEC?", answer: "Most hosting setups don't strictly need it — HTTPS already authenticates the server, so DNS tampering is caught at the TLS layer. DNSSEC matters more for DANE-based email, DoT/DoH authentication, and some government compliance. And crucially: enabling DNSSEC adds a failure mode (Bogus) that can take your domain offline if keys expire or mis-sign. If you turn it on, monitor it continuously." },
        { question: "What algorithms should I use?", answer: "ECDSA P-256/SHA-256 (algorithm 13) or Ed25519 (algorithm 15) for new zones. Both are small, fast, and broadly supported. Avoid RSA/SHA-1 (algorithm 5 or 7) — it's deprecated. Most modern DNS providers (Cloudflare, Google Cloud DNS, Route 53) use algorithm 13 or 14 by default. PingThat shows the algorithm name in the DS and DNSKEY tables so you can verify." },
      ],
    },
    es: {
      faqs: [
        { question: "¿Cuál es la diferencia entre Bogus e Insecure?", answer: "Insecure significa que la zona no está firmada — sin DNSKEY, sin DS — y los resolvers aceptan respuestas sin validar. Es el comportamiento por defecto y es correcto. Bogus significa que la zona SÍ está firmada pero la validación falla — DS dice 'esta zona está firmada' pero las firmas no cuadran. Bogus es un incidente en producción: los resolvers validadores devuelven SERVFAIL y todos los usuarios con esos resolvers no pueden llegar a ti. Arregla Bogus con urgencia." },
        { question: "¿Por qué mi consulta DNSKEY devuelve vacío en una zona Bogus?", answer: "Cloudflare 1.1.1.1 es un resolver validador. Cuando falla la validación DNSSEC, se niega a devolver los registros firmados — ese es el propósito de DNSSEC. Así que en zona Bogus, DNSKEY aparece con 0 respuestas aunque el servidor autoritativo los esté sirviendo. PingThat detecta esto combinando Status=2 (SERVFAIL) en la consulta A con presencia de DS en el padre, firma exacta de una zona Bogus." },
        { question: "¿Debo habilitar DNSSEC?", answer: "La mayoría de hostings no lo necesitan estrictamente — HTTPS ya autentica el servidor y el tampering DNS se detecta en TLS. DNSSEC importa más para correo DANE, autenticación DoT/DoH y ciertos compliance gubernamentales. Y crucial: habilitarlo añade un modo de fallo (Bogus) que puede tirar tu dominio si las claves caducan o firman mal. Si lo activas, monitorízalo continuamente." },
        { question: "¿Qué algoritmos debo usar?", answer: "ECDSA P-256/SHA-256 (algoritmo 13) o Ed25519 (algoritmo 15) para zonas nuevas. Ambos son pequeños, rápidos y bien soportados. Evita RSA/SHA-1 (algoritmo 5 o 7) — está deprecado. Los proveedores DNS modernos (Cloudflare, Google Cloud DNS, Route 53) usan algoritmo 13 o 14 por defecto. PingThat muestra el nombre del algoritmo en las tablas DS y DNSKEY para verificarlo." },
      ],
    },
  },

  "reverse-dns": {
    en: {
      faqs: [
        { question: "Why would an IP have no PTR record?", answer: "PTR is optional from the IP owner's side. Residential ISPs almost never publish meaningful PTR for consumer IPs — you'll see generic ones like c-72-123-45-67.hsd1.ca.comcast.net or nothing at all. Some cloud providers leave PTR empty by default for tenants. Missing PTR is a strong negative signal for mail servers (many will reject or greylist) but is fine for general web traffic." },
        { question: "How do I set up reverse DNS?", answer: "PTR records live in the in-addr.arpa or ip6.arpa zone, which is controlled by whoever owns the IP block — usually your ISP, hosting provider, or cloud vendor. You don't control PTR through your own DNS. Most cloud platforms expose a PTR field in the instance config (AWS EC2, GCP VM, Hetzner, etc.). For colocated hardware, ask your ISP to delegate the PTR zone to you or to set specific records on request." },
        { question: "Should forward and reverse match for mail servers?", answer: "Yes. Many mail servers reject or heavily penalise senders where the PTR doesn't forward-resolve back to the same IP. The chain is: your mail server's IP has a PTR of mail.example.com; an A query on mail.example.com returns the same IP. Mismatches look like misconfigured or hijacked senders. Use PingThat's DNS Lookup tool to verify the forward resolution after checking the PTR." },
        { question: "Does PTR work for IPv6?", answer: "Yes — same principle with a different arpa zone. IPv6 PTR uses ip6.arpa with each of the 32 nibbles reversed and dotted, so 2606:4700:4700::1111 becomes 1.1.1.1.0.0.0.0...7.4.6.0.6.2.ip6.arpa. PingThat constructs it automatically so you just paste the IP. v6 PTR adoption is much lower than v4, especially in residential ranges." },
      ],
    },
    es: {
      faqs: [
        { question: "¿Por qué una IP no tiene PTR?", answer: "PTR es opcional desde el lado del propietario de la IP. Los ISPs residenciales casi nunca publican PTR con sentido para IPs de cliente — verás genéricos tipo c-72-123-45-67.hsd1.ca.comcast.net o nada. Algunos cloud providers dejan PTR vacío por defecto. Su ausencia es señal negativa fuerte para correo (muchos rechazan o meten en greylist) pero es irrelevante para tráfico web general." },
        { question: "¿Cómo configuro DNS inverso?", answer: "Los PTR viven en la zona in-addr.arpa o ip6.arpa, controlada por el dueño del bloque IP — normalmente tu ISP, hosting o cloud. No controlas PTR desde tu propio DNS. Las plataformas cloud exponen un campo PTR en la config de la instancia (AWS EC2, GCP VM, Hetzner, etc.). Para hardware colocado, pide a tu ISP que te delegue la zona PTR o que configure registros concretos bajo petición." },
        { question: "¿Deben coincidir forward y reverse en servidores de correo?", answer: "Sí. Muchos servidores de correo rechazan o penalizan fuerte a remitentes cuyo PTR no resuelve hacia adelante a la misma IP. La cadena: tu IP de correo tiene un PTR mail.ejemplo.com; una consulta A a mail.ejemplo.com devuelve la misma IP. La discrepancia parece un emisor mal configurado o secuestrado. Usa DNS Lookup de PingThat para verificar la resolución forward tras comprobar el PTR." },
        { question: "¿Funciona PTR en IPv6?", answer: "Sí — mismo principio con zona arpa distinta. IPv6 PTR usa ip6.arpa con los 32 nibbles invertidos separados por puntos, así 2606:4700:4700::1111 se convierte en 1.1.1.1.0.0.0.0...7.4.6.0.6.2.ip6.arpa. PingThat lo construye automáticamente, solo pegas la IP. La adopción PTR en v6 es mucho más baja que en v4, especialmente en rangos residenciales." },
      ],
    },
  },

  "resolver-compare": {
    en: {
      faqs: [
        { question: "Why would resolvers disagree on an answer?", answer: "Three common causes. (1) Propagation: you changed DNS and some resolvers still have the old record cached until TTL expires. (2) GeoDNS: the authoritative server returns different answers depending on where the query comes from — resolvers in different regions see different IPs legitimately. (3) Bugs or outages at a specific resolver. The consistency verdict tells you there's divergence; the per-resolver answer tells you which flavour you're seeing." },
        { question: "How is this different from a 'DNS propagation checker'?", answer: "Traditional propagation checkers query the authoritative server from multiple geographic locations to see whether the change has been rolled out. Resolver Compare queries what end users actually see — the public recursive resolvers they use daily (Cloudflare 1.1.1.1, Google 8.8.8.8, etc.). The end-user view is what matters because resolvers cache; propagation is only one cause of divergence." },
        { question: "Why Cloudflare, Google, AdGuard, NextDNS specifically?", answer: "All four offer JSON-format DNS-over-HTTPS, which is what PingThat queries against. Between them they cover the bulk of public recursive DNS traffic. Quad9 and OpenDNS also offer DoH but not in compatible JSON form, so they're excluded for now. The four represent a geographically diverse and technically diverse sample — divergence between them tends to be meaningful." },
        { question: "What's a good latency number?", answer: "Under 150 ms (green) means the resolver is nearby and responsive. 150–400 ms (yellow) suggests a longer route or a less optimised POP. Over 400 ms (red) is unusual — it indicates either a transit problem from PingThat's edge to that resolver, or the resolver itself is slow on this specific query. Retry; if it persists, the resolver may be rate-limiting or have an issue." },
      ],
    },
    es: {
      faqs: [
        { question: "¿Por qué los resolvers podrían discrepar?", answer: "Tres causas comunes. (1) Propagación: cambiaste DNS y algunos resolvers aún tienen el registro viejo en caché hasta que el TTL caduque. (2) GeoDNS: el servidor autoritativo devuelve respuestas distintas según el origen de la consulta — resolvers en regiones distintas ven IPs distintas legítimamente. (3) Bugs o incidencias en un resolver concreto. El veredicto de consistencia te avisa de divergencia; la respuesta por resolver te dice cuál estás viendo." },
        { question: "¿En qué se diferencia de un 'DNS propagation checker'?", answer: "Los checkers clásicos consultan al servidor autoritativo desde varias ubicaciones geográficas para ver si el cambio se ha desplegado. Resolver Compare consulta lo que realmente ven los usuarios finales — los resolvers recursivos públicos que usan a diario (Cloudflare 1.1.1.1, Google 8.8.8.8, etc.). La vista del usuario final es la que importa porque los resolvers cachean; la propagación es solo una de las causas de divergencia." },
        { question: "¿Por qué Cloudflare, Google, AdGuard, NextDNS en particular?", answer: "Los cuatro ofrecen DNS-over-HTTPS en formato JSON, que es lo que PingThat consulta. Entre ellos cubren el grueso del tráfico DNS público recursivo. Quad9 y OpenDNS también ofrecen DoH pero no en JSON compatible, así que quedan fuera por ahora. Los cuatro representan una muestra diversa geográfica y técnicamente — la divergencia entre ellos suele ser significativa." },
        { question: "¿Qué latencia es buena?", answer: "Menos de 150 ms (verde): el resolver está cerca y responde bien. 150–400 ms (amarillo): ruta más larga o POP menos optimizado. Más de 400 ms (rojo): inusual — indica o un problema de tránsito desde el edge de PingThat hacia ese resolver, o que el resolver va lento en esta consulta. Repite; si persiste, puede estar rate-limitando o tener un incidente." },
      ],
    },
  },

  "site-speed": {
    en: {
      faqs: [
        { question: "Why is this different from Lighthouse or PageSpeed Insights?", answer: "Lighthouse runs a single synthetic probe from a clean environment — one device, one network, no real users. Site Speed reads the Chrome UX Report, which is aggregated real-field data from every Chrome user who opted in. Google uses CrUX for ranking; Lighthouse is a diagnostic tool. Both matter: Lighthouse tells you what could be faster in a lab, CrUX tells you what actually is faster for real visitors." },
        { question: "What does 'not enough data' mean?", answer: "CrUX only publishes data for origins and URLs with enough Chrome traffic to aggregate anonymously. Below that threshold — typically a few hundred real visitors per 28-day window — Google withholds the metrics to prevent single-user inference. If your site shows 'not enough data', run Lighthouse or WebPageTest for synthetic measurements instead." },
        { question: "What's the difference between URL-level and origin-level scope?", answer: "URL-level measures the specific URL you entered (e.g. /pricing). Origin-level aggregates every URL across the entire hostname. PingThat tries URL-level first because it's more actionable. If URL-level has no data, it falls back to origin-level, which usually has enough traffic. Origin-level is coarser: you see the typical experience across the site, not the specific page." },
        { question: "Which metric should I optimise first?", answer: "Whichever is rated Poor. In 2024-2025, INP is where most sites fail first because it was recently tightened. If INP is Good and LCP is Poor, optimise LCP: preload the hero image, reduce render-blocking CSS, and ship critical JS earlier. CLS is Poor usually because images or ads load without reserved space — that's the cheapest fix." },
      ],
    },
    es: {
      faqs: [
        { question: "¿En qué se diferencia de Lighthouse o PageSpeed Insights?", answer: "Lighthouse hace una sonda sintética desde un entorno limpio — un dispositivo, una red, sin usuarios reales. Site Speed lee el Chrome UX Report, datos reales agregados de cada usuario de Chrome que ha optado. Google usa CrUX para ranking; Lighthouse es diagnóstico. Ambos importan: Lighthouse te dice qué podría ser más rápido en laboratorio, CrUX lo que realmente lo es para visitantes reales." },
        { question: "¿Qué significa 'datos insuficientes'?", answer: "CrUX solo publica datos de orígenes y URLs con suficiente tráfico Chrome para agregar anónimamente. Por debajo — típicamente unos cientos de visitantes reales por ventana de 28 días — Google retiene las métricas para evitar inferir por usuario único. Si tu sitio muestra 'datos insuficientes', ejecuta Lighthouse o WebPageTest como alternativa sintética." },
        { question: "¿Cuál es la diferencia entre ámbito URL y origen?", answer: "URL mide la URL específica que introdujiste (p. ej. /precios). Origen agrega todas las URLs del hostname completo. PingThat intenta URL primero porque es más accionable. Si URL no tiene datos, cae a origen que suele tener suficiente tráfico. Origen es más grueso: ves la experiencia típica del sitio, no la página concreta." },
        { question: "¿Qué métrica debo optimizar primero?", answer: "La que esté en Deficiente. En 2024-2025, INP es donde más sitios fallan primero porque se endureció recientemente. Si INP es Bueno y LCP Deficiente, optimiza LCP: precarga la imagen hero, reduce CSS bloqueante y envía JS crítico antes. CLS suele estar Deficiente porque imágenes o anuncios cargan sin reservar espacio — ese es el arreglo más barato." },
      ],
    },
  },
};
