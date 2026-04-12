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
};
