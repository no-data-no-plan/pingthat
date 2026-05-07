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
          question: "How does this tool detect my public IP?",
          answer: "The tool calls a public IP-info API (ipapi.co or ipify.org) which reads the source IP of the incoming TCP handshake on its server. That source IP is whatever endpoint terminates the connection on the public internet — for a residential customer it's typically your home router's WAN address, assigned by DHCP from the ISP. Behind that gateway your devices use RFC 1918 private addresses (10/8, 172.16/12, 192.168/16) translated by NAT. For mobile or CGNAT customers an extra translation tier (RFC 6598 100.64.0.0/10) sits between the LAN and the public IP. When traffic traverses a load balancer or reverse proxy that adds a Forwarded header (RFC 7239, Petersson & Nilsson, 2014), the original client IP is preserved through the chain so the API can see you, not the proxy — provided the proxy is configured to set the header correctly.",
        },
        {
          question: "Why are my IPv4 and IPv6 addresses different?",
          answer: "They're different addresses for different network protocols, allocated independently. IPv4 (RFC 791) uses 32-bit addresses; the global free pool effectively exhausted in 2011, leading to widespread NAT. IPv6 (RFC 4291) uses 128-bit addresses with vast address space and avoids most NAT — your device usually has a routable IPv6 address with a globally unique prefix from your ISP. A dual-stack network supplies both. Routing paths can differ: a query routed via IPv4 may transit different intermediate networks than the same query via IPv6, which is why latency and even GeoIP location may differ between the two stacks. Operationally, when you firewall or troubleshoot, treat them as two separate identities — a rule applied to your IPv4 doesn't apply to your IPv6 unless you configure both.",
        },
        {
          question: "Why might my IP show as 100.64.x.x or report unexpectedly?",
          answer: "You're behind carrier-grade NAT. RFC 6598 (Weil, Kuarsingh, Donley, Liljenstolpe & Azinger, 2012) reserved 100.64.0.0/10 — known as the Shared Address Space — for ISPs to use on the customer side of CGNAT translation. Mobile networks and some fibre operators run customers behind CGNAT to conserve IPv4 addresses; multiple subscribers share a smaller pool of real public IPs. From the open internet's perspective you appear to share an IP with hundreds of others, which complicates IP-based blocking and authentication. Some VPN services also assign 100.64/10 internally. If you see this address as your 'public' IP, you can't typically port-forward or run public services on IPv4 from your home — but IPv6 is usually unaffected because IPv6 normally avoids CGNAT.",
        },
        {
          question: "How accurate is the geolocation actually?",
          answer: "Accuracy depends on the IP type. Commercial GeoIP databases such as MaxMind GeoLite2 build their tables from regional registry filings (ARIN, RIPE, APNIC, LACNIC, AFRINIC) plus traceroute-derived geolocation and ISP-supplied data. ISP-fixed residential IPs are usually accurate to the city level because the registry filings include locale data per /24 block. Mobile IPs roam across regions — the same IP can appear in multiple cities within minutes — and CGNAT IPs may be reported at a regional aggregation point. Datacentre IPs (AWS, Hetzner, OVH) report the datacentre, not your physical location — which is why VPN exit nodes show the country/city of the VPN provider, not yours. Expect 50-200 km of slack for residential consumer IPs and significantly more for mobile/CGNAT/datacentre.",
        },
        {
          question: "What does the ASN tell me?",
          answer: "The Autonomous System Number (RFC 1930, Hawkinson & Bates, 1996) identifies the network operator that owns and announces the IP block. Each AS is a connected group of IP prefixes run by one or more network operators with a single, clearly defined routing policy — for example AS15169 belongs to Google, AS32934 to Meta, AS13335 to Cloudflare. ASNs are assigned by the regional registry that allocated the IP block and stay relatively stable; an ASN change usually means the operator transferred ownership or merged. From an ASN you can tell whether traffic comes from a residential ISP, a mobile carrier, a datacentre, a VPN provider, or a security scanner — this is more useful for fraud detection and traffic shaping than the IP itself, because IP-level geolocation is noisy but ASN identity is unambiguous.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cómo detecta esta herramienta mi IP pública?",
          answer: "La herramienta llama a una API pública de IP-info (ipapi.co o ipify.org) que lee la IP origen del handshake TCP entrante en su servidor. Esa IP origen es el endpoint que termina la conexión en internet pública — para un cliente residencial es típicamente la dirección WAN de tu router doméstico, asignada por DHCP desde el ISP. Detrás de ese gateway tus dispositivos usan direcciones privadas RFC 1918 (10/8, 172.16/12, 192.168/16) traducidas por NAT. Para clientes móviles o CGNAT hay una capa extra de traducción (RFC 6598 100.64.0.0/10) entre la LAN y la IP pública. Cuando el tráfico atraviesa un balanceador o proxy inverso que añade una cabecera Forwarded (RFC 7239, Petersson y Nilsson, 2014), la IP original del cliente se preserva a través de la cadena para que la API te vea a ti, no al proxy — siempre que el proxy esté configurado para establecer la cabecera correctamente.",
        },
        {
          question: "¿Por qué mis IPv4 e IPv6 son distintas?",
          answer: "Son direcciones distintas para protocolos de red distintos, asignadas independientemente. IPv4 (RFC 791) usa direcciones de 32 bits; el pool global libre se agotó efectivamente en 2011, llevando a NAT generalizado. IPv6 (RFC 4291) usa direcciones de 128 bits con espacio vasto y evita la mayoría de NAT — tu dispositivo suele tener una dirección IPv6 enrutable con prefijo globalmente único desde tu ISP. Una red dual-stack provee ambas. Los caminos de routing pueden diferir: una consulta enrutada por IPv4 puede transitar redes intermedias distintas que la misma consulta por IPv6, razón por la que latencia e incluso ubicación GeoIP pueden diferir entre los dos stacks. Operacionalmente, cuando aplicas firewall o diagnosticas, trátalas como dos identidades separadas — una regla aplicada a tu IPv4 no aplica a tu IPv6 a menos que configures ambas.",
        },
        {
          question: "¿Por qué mi IP aparece como 100.64.x.x o reporta inesperadamente?",
          answer: "Estás detrás de carrier-grade NAT. RFC 6598 (Weil, Kuarsingh, Donley, Liljenstolpe y Azinger, 2012) reservó 100.64.0.0/10 — conocido como Shared Address Space — para que los ISPs lo usen en el lado del cliente de la traducción CGNAT. Las redes móviles y algunas operadoras de fibra mantienen clientes detrás de CGNAT para conservar direcciones IPv4; múltiples suscriptores comparten un pool más pequeño de IPs públicas reales. Desde la perspectiva de internet abierta apareces compartiendo IP con cientos de otros, lo que complica el bloqueo y la autenticación basados en IP. Algunos servicios VPN también asignan 100.64/10 internamente. Si ves esta dirección como tu IP 'pública', normalmente no puedes hacer port-forward ni correr servicios públicos en IPv4 desde casa — pero IPv6 suele no estar afectado porque IPv6 normalmente evita CGNAT.",
        },
        {
          question: "¿Qué precisión tiene realmente la geolocalización?",
          answer: "La precisión depende del tipo de IP. Las bases GeoIP comerciales como MaxMind GeoLite2 construyen sus tablas a partir de los registros de los registries regionales (ARIN, RIPE, APNIC, LACNIC, AFRINIC) más geolocalización derivada de traceroute y datos suministrados por ISPs. Las IPs residenciales fijas de ISP suelen ser precisas a nivel ciudad porque los registros incluyen datos de locale por bloque /24. Las IPs móviles itineran entre regiones — la misma IP puede aparecer en varias ciudades en minutos — y las IPs CGNAT pueden reportarse en un punto de agregación regional. Las IPs de centro de datos (AWS, Hetzner, OVH) reportan el propio centro de datos, no tu ubicación física — razón por la que los nodos de salida VPN muestran el país/ciudad del proveedor VPN, no el tuyo. Espera 50-200 km de imprecisión para IPs residenciales y significativamente más para móvil/CGNAT/centro de datos.",
        },
        {
          question: "¿Qué me dice el ASN?",
          answer: "El Número de Sistema Autónomo (RFC 1930, Hawkinson y Bates, 1996) identifica al operador de red dueño del bloque IP que lo anuncia. Cada AS es un grupo conectado de prefijos IP operado por uno o más operadores de red con una política de routing única y claramente definida — por ejemplo AS15169 pertenece a Google, AS32934 a Meta, AS13335 a Cloudflare. Los ASNs son asignados por el registry regional que asignó el bloque IP y permanecen relativamente estables; un cambio de ASN suele significar que el operador transfirió la propiedad o se fusionó. Desde un ASN puedes saber si el tráfico viene de un ISP residencial, un carrier móvil, un datacentre, un proveedor VPN o un escáner de seguridad — esto es más útil para detección de fraude y traffic shaping que la IP en sí, porque la geolocalización a nivel IP es ruidosa pero la identidad ASN es unívoca.",
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
        { question: "What does a CAA record actually do?", answer: "A CAA record (RFC 8659 Hallam-Baker, Stradling & Hoffman-Andrews, 2019; obsoletes RFC 6844 from 2013) tells Certificate Authorities whether they are allowed to issue certificates for your domain. Since 8 September 2017 the CA/Browser Forum Baseline Requirements §3.2.2.8 (Ballot 187, version 1.4.3) require all publicly trusted CAs to check CAA before issuance — non-compliance can revoke a CA's trust anchor at the root program level. If your record allows only Let's Encrypt and someone requests a certificate from a different CA, that CA must refuse. Without a CAA record, any publicly trusted CA can issue for your domain, including an attacker who tricks a different CA via social engineering or relaxed validation." },
        { question: "What's the difference between issue and issuewild?", answer: "The `issue` tag authorises a CA to issue standard certificates for the domain. The `issuewild` tag controls wildcard certificates (*.example.com) specifically. If you publish `issuewild` records, wildcards fall under that policy and ignore `issue` per RFC 8659 §4.3. If you publish only `issue` records, wildcards inherit it. A common pattern: allow Let's Encrypt for standard certificates via `issue`, but exclude all wildcards by publishing `issuewild` with the value `;` (empty parameter syntax) to refuse every CA." },
        { question: "Does CAA apply to the apex or to subdomains?", answer: "CAA is inherited down the DNS tree. A CA checks the exact domain first, then walks up per RFC 8659 §3: `api.app.example.com` → `app.example.com` → `example.com`. The first zone with CAA records applies — that's why PingThat shows 'Policy inherited from X' when a subdomain has no records but an ancestor does. Publishing policy at the apex covers everything below it; subdomain-specific records override the apex policy for that branch only. The critical-bit flag (issuer-critical, value 128) makes CAs that don't recognise a tag refuse issuance — useful for forward-compatible policy deployment." },
        { question: "What happens if I don't publish CAA?", answer: "Any publicly trusted CA can issue certificates for your domain. That's how most of the internet operates today, and for most sites it's acceptable because of Certificate Transparency — any mis-issuance gets logged publicly to CT logs (Chrome's policy since 2018 requires CT inclusion for all publicly trusted certs) and detection tools like crt.sh surface unexpected issuance. CAA adds a complementary prevention layer: five minutes of DNS configuration blocks an entire class of attacks involving misled or compromised CAs. Best practice is to layer both — CAA for prevention at issuance time, CT monitoring for detection after-the-fact." },
        { question: "Can I restrict CAA to a specific ACME account or validation method?", answer: "Yes. RFC 8657 (Landau, November 2019) added two parameter extensions. The `accounturi` parameter restricts issuance to a specific ACME account URI: even if the CA is allowed by an `issue` record, only certificate requests originating from the exact account succeed. The `validationmethods` parameter limits which domain-validation methods (DNS-01, HTTP-01, TLS-ALPN-01) the CA may use — preventing an attacker who compromised your DNS but not your HTTPS endpoint from passing DNS-01. Both parameters appear after the CA name in the issue record, e.g. `0 issue \"letsencrypt.org; accounturi=https://acme-v02.api.letsencrypt.org/acme/acct/123; validationmethods=dns-01\"`. Adoption is still partial across CAs — Let's Encrypt's Boulder honours both since 2022." },
      ],
    },
    es: {
      faqs: [
        { question: "¿Qué hace realmente un registro CAA?", answer: "Un registro CAA (RFC 8659 Hallam-Baker, Stradling y Hoffman-Andrews, 2019; obsoleta el RFC 6844 de 2013) indica a las Autoridades Certificadoras si pueden emitir certificados para tu dominio. Desde el 8 de septiembre de 2017 los CA/Browser Forum Baseline Requirements §3.2.2.8 (Ballot 187, versión 1.4.3) obligan a todas las CAs públicamente confiadas a comprobar CAA antes de emitir — el incumplimiento puede revocar el anclaje de confianza en los programas raíz. Si tu registro solo permite Let's Encrypt y alguien pide un certificado en otra CA, esa CA debe rechazar. Sin un registro CAA, cualquier CA pública confiada puede emitir para tu dominio, incluyendo a un atacante que engañe a otra CA por ingeniería social o validación laxa." },
        { question: "¿Cuál es la diferencia entre issue e issuewild?", answer: "La etiqueta `issue` autoriza a una CA a emitir certificados estándar para el dominio. La etiqueta `issuewild` controla específicamente los certificados wildcard (*.ejemplo.com). Si publicas `issuewild`, los wildcard siguen esa política e ignoran `issue` según RFC 8659 §4.3. Si solo publicas `issue`, los wildcard la heredan. Patrón común: permitir Let's Encrypt para certificados estándar vía `issue`, pero excluir todos los wildcards publicando `issuewild` con el valor `;` (sintaxis de parámetro vacío) para rechazar cualquier CA." },
        { question: "¿CAA aplica al apex o a subdominios?", answer: "CAA se hereda hacia abajo del árbol DNS. Una CA comprueba el dominio exacto primero y luego sube según RFC 8659 §3: `api.app.ejemplo.com` → `app.ejemplo.com` → `ejemplo.com`. La primera zona con registros CAA se aplica — por eso PingThat muestra 'Política heredada de X' cuando un subdominio carece de registros pero un ancestro sí tiene. Publicar la política en el apex cubre todo lo que cuelgue debajo; los registros específicos de subdominio sobrescriben la política del apex solo para esa rama. El bit crítico (issuer-critical, valor 128) hace que las CAs que no reconozcan una etiqueta rechacen la emisión — útil para despliegue de política compatible hacia adelante." },
        { question: "¿Qué pasa si no publico CAA?", answer: "Cualquier CA pública confiada puede emitir certificados para tu dominio. Así funciona la mayor parte de internet hoy y para muchos sitios es aceptable gracias a Certificate Transparency — cualquier emisión indebida queda registrada en logs CT públicos (la política de Chrome desde 2018 requiere inclusión CT para todos los certs públicamente confiados) y herramientas como crt.sh detectan emisiones inesperadas. CAA añade una capa complementaria de prevención: cinco minutos de configuración DNS bloquean toda una clase de ataques con CAs engañadas o comprometidas. La mejor práctica es combinar ambos — CAA para prevención en el momento de emisión, monitorización CT para detección posterior." },
        { question: "¿Puedo restringir CAA a una cuenta ACME específica o a un método de validación?", answer: "Sí. El RFC 8657 (Landau, noviembre 2019) añadió dos extensiones de parámetros. El parámetro `accounturi` restringe la emisión a un URI de cuenta ACME específico: incluso si la CA está permitida por un registro `issue`, solo las peticiones de certificado originadas desde la cuenta exacta tienen éxito. El parámetro `validationmethods` limita qué métodos de validación de dominio (DNS-01, HTTP-01, TLS-ALPN-01) puede usar la CA — evitando que un atacante que comprometió tu DNS pero no tu endpoint HTTPS pase un DNS-01. Ambos parámetros aparecen tras el nombre de la CA en el registro issue, p.ej. `0 issue \"letsencrypt.org; accounturi=https://acme-v02.api.letsencrypt.org/acme/acct/123; validationmethods=dns-01\"`. La adopción aún es parcial entre CAs — Boulder de Let's Encrypt honra ambos desde 2022." },
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

  "port-scan": {
    en: {
      faqs: [
        {
          question: "What's the difference between filtered and closed?",
          answer: "Both states indicate the service isn't reachable, but the wire-level signature differs. A closed port returns a TCP RST flag immediately — RFC 9293 §3.10.7 specifies this as the kernel's response when no socket is listening on the probed port. The host is alive; it just isn't running that service. Filtered means the probe got no answer at all within the timeout. Three different conditions produce that same silence: a stateful firewall dropped the SYN packet, the route to the host is broken upstream, or the host itself is offline. The scanner cannot distinguish among them without TCP traceroute or ICMP echo. Filtered is a 'something is between you and the service' signal, not a confirmed firewall verdict.",
        },
        {
          question: "Is port scanning legal?",
          answer: "Scanning your own infrastructure or systems you have written permission to test is legal everywhere. Scanning third-party hosts without authorisation occupies a grey zone that varies by jurisdiction. In the United States, Moulton v. VC3, Inc. (USDC ND Ga 2000) ruled that an unauthorised port scan and throughput test against VC3's servers — absent damage exceeding the $5,000 CFAA threshold — did not violate 18 USC §1030 or the Georgia Computer Systems Protection Act. The court found the activity reckless but the statutory damage requirement unmet. That precedent applies to facts resembling Moulton; courts in other circuits have decided differently. In Germany, §202c StGB ('Hacker-Paragraph', 2007 amendment) criminalises preparation of data interception and has been read to cover unauthorised scanning tools. Written authorisation is the only safe operating principle, regardless of jurisdiction.",
        },
        {
          question: "Why does a port appear open from this tool but closed when scanned from inside the network?",
          answer: "Cloud-hosted scanners hit your perimeter the way the internet sees it — through the public-facing security group, load balancer, or NAT gateway. Internal scans run after that perimeter and only see the host firewall (iptables, Windows Firewall). A port can be open at the perimeter (security group permits 22/tcp) but blocked at the host (iptables drops it). The reverse is also common: the host listens but the perimeter blocks. The verdict you trust depends on the threat model: external scans answer 'what can the internet reach?', internal scans answer 'what would a compromised internal box reach?'. Both views are useful; neither is wrong.",
        },
        {
          question: "Why is HTTP-based probing different from nmap?",
          answer: "nmap's default scan (-sS, SYN scan) crafts raw IP packets and reads TCP flags directly. It can complete a half-open handshake — SYN/ACK received, RST sent in reply — without making the application layer aware of a connection attempt. Application logs stay clean. Cloudflare Workers do not expose raw sockets, so this tool issues full HTTP/HTTPS connections from edge POPs: the handshake completes, the application logs the connection, and any rate-limit or fail2ban rule fires as it would for a real client. The trade-off is fidelity to what an actual external client experiences versus stealth — impossible from this runtime. For broad reachability checks the HTTP probe is sufficient; for protocol-specific deep inspection, nmap from a host you control remains the right tool.",
        },
        {
          question: "How does IANA decide which ports get assigned numbers?",
          answer: "RFC 6335 (Cotton, Eggert, Touch, Westerlund & Cheshire, 2011) defines three procedures by range. System Ports (0–1023) require IETF Review or IESG Approval — registration usually accompanies a published RFC, which is why every entry in this range traces to a standards-track document. User Ports (1024–49151) accept Expert Review submissions: the requester documents the protocol, IANA's expert checks for conflicts and assigns. Dynamic and/or Private Ports (49152–65535) are not assigned by IANA; operating systems pick from this range when an application opens an outbound connection without specifying a source port. Many third-party services bind in the User range (Redis 6379, PostgreSQL 5432, MySQL 3306) — their numbers are advisory only; nothing in the protocol layer forces a server to use them.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Cuál es la diferencia entre filtrado y cerrado?",
          answer: "Ambos estados indican que el servicio no está alcanzable, pero la firma a nivel de paquete difiere. Un puerto cerrado devuelve un flag TCP RST de inmediato — RFC 9293 §3.10.7 lo especifica como la respuesta del kernel cuando no hay socket escuchando en el puerto sondeado. El host está vivo; simplemente no está ejecutando ese servicio. Filtrado significa que el sondeo no recibió respuesta dentro del timeout. Tres condiciones distintas producen ese mismo silencio: un firewall stateful descartó el paquete SYN, la ruta al host está rota aguas arriba o el host está offline. El escáner no puede distinguir entre ellas sin TCP traceroute o ICMP echo. Filtrado es una señal de 'algo se interpone entre ti y el servicio', no un veredicto confirmado de firewall.",
        },
        {
          question: "¿Es legal escanear puertos?",
          answer: "Escanear tu propia infraestructura o sistemas para los que tienes permiso escrito es legal en todas partes. Escanear hosts de terceros sin autorización ocupa una zona gris que varía por jurisdicción. En Estados Unidos, Moulton v. VC3, Inc. (USDC ND Ga 2000) dictaminó que un escaneo de puertos y test de throughput sin autorización contra los servidores de VC3 — en ausencia de daños superiores al umbral CFAA de 5.000 dólares — no violaba 18 USC §1030 ni la Georgia Computer Systems Protection Act. El tribunal consideró la actividad imprudente pero el requisito estatutario de daños no cumplido. Ese precedente aplica a hechos similares a Moulton; tribunales de otros circuitos han decidido distinto. En Alemania, §202c StGB ('Hacker-Paragraph', enmienda 2007) criminaliza la preparación de interceptación de datos y se ha interpretado que cubre herramientas de escaneo no autorizadas. La autorización por escrito es el único principio operativo seguro, sea cual sea la jurisdicción.",
        },
        {
          question: "¿Por qué un puerto aparece abierto en esta herramienta pero cerrado al escanearlo desde dentro de la red?",
          answer: "Los escáneres alojados en cloud golpean tu perímetro como lo ve internet — a través del security group público, balanceador o gateway NAT. Los escaneos internos corren después de ese perímetro y sólo ven el firewall del host (iptables, Windows Firewall). Un puerto puede estar abierto en el perímetro (el security group permite 22/tcp) pero bloqueado en el host (iptables lo descarta). El caso contrario también es común: el host escucha pero el perímetro bloquea. El veredicto en el que confías depende del modelo de amenaza: los escaneos externos responden '¿qué alcanza internet?', los internos responden '¿qué alcanzaría una caja interna comprometida?'. Ambas vistas son útiles; ninguna está mal.",
        },
        {
          question: "¿En qué se diferencia el sondeo HTTP de nmap?",
          answer: "El escaneo por defecto de nmap (-sS, SYN scan) construye paquetes IP en crudo y lee los flags TCP directamente. Puede completar un handshake medio-abierto — recibido SYN/ACK, enviado RST en respuesta — sin que la capa de aplicación se entere del intento de conexión. Los logs de aplicación permanecen limpios. Cloudflare Workers no expone sockets en crudo, así que esta herramienta emite conexiones HTTP/HTTPS completas desde sus POPs edge: el handshake se completa, la aplicación registra la conexión y cualquier regla de rate-limit o fail2ban se dispara como lo haría para un cliente real. El trade-off es fidelidad a lo que ve un cliente externo real frente a sigilo — imposible desde este runtime. Para chequeos amplios de alcanzabilidad el sondeo HTTP basta; para inspección profunda de protocolo, nmap desde un host que controles sigue siendo la herramienta correcta.",
        },
        {
          question: "¿Cómo decide IANA qué puertos reciben número asignado?",
          answer: "RFC 6335 (Cotton, Eggert, Touch, Westerlund y Cheshire, 2011) define tres procedimientos por rango. Los System Ports (0–1023) requieren IETF Review o IESG Approval — el registro suele acompañar a un RFC publicado, razón por la que cada entrada de este rango remite a un documento standards-track. Los User Ports (1024–49151) aceptan envíos de Expert Review: el solicitante documenta el protocolo, el experto IANA verifica conflictos y asigna. Los Dynamic and/or Private Ports (49152–65535) no son asignados por IANA; los sistemas operativos eligen de este rango cuando una aplicación abre una conexión saliente sin especificar puerto de origen. Muchos servicios de terceros se enlazan en el rango User (Redis 6379, PostgreSQL 5432, MySQL 3306) — sus números son orientativos; nada en la capa de protocolo obliga al servidor a usarlos.",
        },
      ],
    },
  },

  "ip-converter": {
    en: {
      faqs: [
        {
          question: "Why does my IPv6 address show as ::ffff:192.168.1.1 in some logs?",
          answer: "That's an IPv4-mapped IPv6 address, defined in RFC 4291 §2.5.5.2 (Hinden & Deering, 2006). The prefix ::ffff:0:0/96 lets a dual-stack socket receive both IPv4 and IPv6 connections on a single AF_INET6 file descriptor — when an IPv4 client connects, the kernel synthesises this textual form so the application can treat the address uniformly. Java in particular surfaces these mappings: InetAddress.getByName(\"192.168.1.1\") may stringify as /192.168.1.1 but bind() returns it as ::ffff:c0a8:0101 on a v6 socket. Logs that mix v4 and v6 traffic on the same listener show this form for everything the kernel mapped, which surprises engineers the first time they see it. The underlying address is still the 32-bit IPv4 value; only the textual form changed.",
        },
        {
          question: "Why does the canonical IPv6 form use lowercase letters and one specific compression?",
          answer: "RFC 5952 (Kawamura & Kawashima, 2010) tightens RFC 4291 by mandating one textual form per address, removing ambiguity that had broken string-equality comparisons across systems. §4.3 requires lowercase hex ('a' through 'f', not 'A' through 'F'). §4.2.3 mandates :: compress the longest run of consecutive 16-bit zero fields; when two runs tie, the first one wins. §4.2.2 forbids using :: to elide a single zero field. So 2001:DB8:0:0:0:0:0:1 must canonicalise to 2001:db8::1 — not 2001:db8:0:0::1 or 2001:DB8::1. Tools that fail to canonicalise inputs frequently mis-compare addresses or duplicate firewall entries; the converter normalises every IPv6 input to the §4 form before showing the alternative representations.",
        },
        {
          question: "What's the difference between RFC 1918 private space and the 100.64.0.0/10 CGNAT range?",
          answer: "RFC 1918 (Rekhter et al., 1996) reserved 10/8, 172.16/12, and 192.168/16 for organisations using NAT — these ranges are routable inside an enterprise but never on the public internet. ISPs hit a problem as IPv4 exhaustion approached: their customer routers already used RFC 1918 ranges internally, so the carrier-side NAT layer needed a different range to avoid collisions when both endpoints used 10/8. RFC 6598 (Weil, Kuarsingh, Donley, Liljenstolpe & Azinger, 2012) carved 100.64.0.0/10 out of the unallocated v4 space specifically for that ISP-CGNAT tier. A packet may traverse three layers of NAT: customer LAN (RFC 1918) → ISP CGNAT (RFC 6598 100.64/10) → public internet. Tools that only flag RFC 1918 as 'private' miss the 100.64/10 carrier scope, which is why the converter highlights both.",
        },
        {
          question: "Are class A, B, and C still meaningful?",
          answer: "Functionally, no. The 1981 IPv4 specification (RFC 791) introduced classful addressing — class A reserved 1.0.0.0–127.255.255.255 with an 8-bit network mask, B 128–191 with /16, C 192–223 with /24, plus class D for multicast and class E reserved. As routing tables exploded in the early 1990s, the IETF deprecated the classful scheme and replaced it with CIDR (Classless Inter-Domain Routing). The original CIDR documents (RFC 1518/1519, September 1993) defined the variable-length prefix system; RFC 4632 (Fuller & Li, 2006) is the current canonical specification. Modern routers, allocators, and registries do not use classes; addresses are described by /CIDR alone. The terminology survives in legacy curriculum, some Cisco IOS commands ('ip classless'), and shorthand among engineers who learned in that era.",
        },
        {
          question: "Why does my IP show up as a giant integer in MySQL or Cloudflare logs?",
          answer: "MySQL's INET_ATON('192.168.1.1') returns 3232235777 — the four octets read as a big-endian 32-bit unsigned integer (192*16777216 + 168*65536 + 1*256 + 1). The integer form takes 4 bytes in storage versus 15 characters for the dotted string, and integer comparisons run faster than string ops against indexed columns. INET_NTOA(3232235777) reverses the conversion. Cloudflare logs and BigQuery exports follow the same big-endian-integer pattern. IPv6 needs 16 bytes — INET6_ATON returns a binary blob, not a single Long. Network order (big-endian) is the canonical wire format defined for IP fields in RFC 791; tools that read packet captures or socket buffers see those bytes directly, while applications that handle IP addresses as integers may need POSIX htonl()/ntohl() conversions on hosts whose CPU stores integers in little-endian. The converter shows both the dotted-decimal and the integer alongside hex/binary so operators can cross-reference log dumps without manual math.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Por qué mi dirección IPv6 aparece como ::ffff:192.168.1.1 en algunos logs?",
          answer: "Esa es una dirección IPv4-mapped IPv6, definida en RFC 4291 §2.5.5.2 (Hinden y Deering, 2006). El prefijo ::ffff:0:0/96 permite a un socket dual-stack recibir conexiones IPv4 e IPv6 sobre un único descriptor AF_INET6 — cuando un cliente IPv4 conecta, el kernel sintetiza esta forma textual para que la aplicación trate la dirección de manera uniforme. Java en particular expone estos mapeos: InetAddress.getByName(\"192.168.1.1\") puede mostrar /192.168.1.1 pero bind() la devuelve como ::ffff:c0a8:0101 en un socket v6. Los logs que mezclan tráfico v4 y v6 sobre el mismo listener muestran esta forma para todo lo que el kernel mapeó, lo que sorprende a los ingenieros la primera vez que lo ven. La dirección subyacente sigue siendo el valor IPv4 de 32 bits; sólo la forma textual cambió.",
        },
        {
          question: "¿Por qué la forma canónica IPv6 usa letras minúsculas y una compresión concreta?",
          answer: "RFC 5952 (Kawamura y Kawashima, 2010) endurece RFC 4291 al imponer una única forma textual por dirección, eliminando la ambigüedad que rompía las comparaciones de igualdad de string entre sistemas. §4.3 requiere hex en minúsculas ('a' a 'f', no 'A' a 'F'). §4.2.3 obliga a que :: comprima la racha más larga de campos 16-bit cero consecutivos; cuando dos rachas empatan, gana la primera. §4.2.2 prohíbe usar :: para elidir un único campo cero. Así 2001:DB8:0:0:0:0:0:1 debe canonicalizar a 2001:db8::1 — no 2001:db8:0:0::1 ni 2001:DB8::1. Las herramientas que no canonicalizan los inputs suelen mis-comparar direcciones o duplicar entradas de firewall; el conversor normaliza cada input IPv6 a la forma §4 antes de mostrar las representaciones alternativas.",
        },
        {
          question: "¿Cuál es la diferencia entre el espacio privado RFC 1918 y el rango CGNAT 100.64.0.0/10?",
          answer: "RFC 1918 (Rekhter et al., 1996) reservó 10/8, 172.16/12 y 192.168/16 para organizaciones que usan NAT — estos rangos son enrutables dentro de una empresa pero nunca en la internet pública. Los ISPs chocaron con un problema al acercarse el agotamiento IPv4: sus routers de cliente ya usaban rangos RFC 1918 internamente, así que la capa NAT del lado del operador necesitaba un rango distinto para evitar colisiones cuando ambos extremos usaban 10/8. RFC 6598 (Weil, Kuarsingh, Donley, Liljenstolpe y Azinger, 2012) reservó 100.64.0.0/10 del espacio v4 sin asignar específicamente para esa capa ISP-CGNAT. Un paquete puede atravesar tres capas de NAT: LAN del cliente (RFC 1918) → CGNAT del ISP (RFC 6598 100.64/10) → internet pública. Las herramientas que sólo marcan RFC 1918 como 'privado' pierden el alcance carrier 100.64/10, razón por la que el conversor resalta ambos.",
        },
        {
          question: "¿Siguen siendo relevantes las clases A, B y C?",
          answer: "Funcionalmente, no. La especificación IPv4 de 1981 (RFC 791 §3.2) introdujo el direccionamiento unicast por clases — la clase A reservaba 1.0.0.0–127.255.255.255 con máscara de 8 bits, clase B 128–191 con /16, clase C 192–223 con /24. La clase D para multicast (224.0.0.0–239.255.255.255) la añadió RFC 988 (1986) y la refinó RFC 1112 (1989); la clase E (240.0.0.0/4, reservada para uso futuro) quedó apartada en RFC 1112 §4. Cuando las tablas de routing explotaron a principios de los 90, el IETF deprecó el esquema unicast por clases y lo reemplazó con CIDR (Classless Inter-Domain Routing). Los documentos originales de CIDR (RFC 1518/1519, septiembre 1993) definieron el sistema de prefijos de longitud variable; RFC 4632 (Fuller y Li, 2006) es la especificación canónica actual. Los routers, asignadores y registries modernos no usan clases; las direcciones se describen sólo por /CIDR. La terminología sobrevive en currículos legacy, algunos comandos Cisco IOS ('ip classless') y la jerga de ingenieros que aprendieron en aquella era.",
        },
        {
          question: "¿Por qué mi IP aparece como un entero gigante en logs de MySQL o Cloudflare?",
          answer: "INET_ATON('192.168.1.1') de MySQL devuelve 3232235777 — los cuatro octetos leídos como un entero sin signo de 32 bits big-endian (192*16777216 + 168*65536 + 1*256 + 1). La forma entera ocupa 4 bytes en almacenamiento frente a 15 caracteres del string punteado, y las comparaciones enteras corren más rápido que las operaciones de string contra columnas indexadas. INET_NTOA(3232235777) invierte la conversión. Los logs de Cloudflare y los exports a BigQuery siguen el mismo patrón big-endian. IPv6 necesita 16 bytes — INET6_ATON devuelve un blob binario, no un único Long. El network order (big-endian) es el formato canónico en cable definido para los campos IP en RFC 791; las herramientas que leen capturas de paquetes o buffers de socket ven esos bytes directamente, mientras que las aplicaciones que manejan direcciones IP como enteros pueden necesitar conversiones POSIX htonl()/ntohl() en hosts cuya CPU almacena enteros en little-endian. El conversor muestra la decimal punteada y el entero junto a hex/binario para que los operadores cruzen volcados de log sin matemática manual.",
        },
      ],
    },
  },

  "privacy-check": {
    en: {
      faqs: [
        {
          question: "What is browser fingerprinting and how unique is mine likely to be?",
          answer: "Eckersley's 2010 Panopticlick paper (How Unique is Your Web Browser?, Privacy Enhancing Technologies Symposium 2010, Berlin) measured 18.1 bits of identifying entropy from just 8 features (User-Agent, HTTP Accept headers, plug-ins, fonts, time zone, screen size, supercookies, cookies-enabled flag) across approximately 470,000 browsers. 84% of those browsers had unique configurations — meaning at random, only 1 in 286,777 would share a fingerprint. Among browsers with Flash or Java the figure rose to 94% unique with 18.8 bits entropy. Modern fingerprinting libraries combine 30+ signals reaching higher uniqueness. The combined value can persist across cookie clearing, incognito mode, and IP changes, which is why fingerprinting is tracked as a privacy concern alongside cookies.",
        },
        {
          question: "Which surfaces of my browser actually contribute to the fingerprint?",
          answer: "The high-entropy contributors are well-documented: Canvas pixel rendering (varies by GPU driver + font versions), AudioContext output sampling (varies by audio DSP), WebGL renderer string (gl.getParameter exposes GPU model), enumerated fonts (Canvas measureText probes installed fonts), screen resolution and color depth (window.screen), preferred languages (navigator.languages), timezone (Date.getTimezoneOffset), CPU concurrency (navigator.hardwareConcurrency), and the User-Agent string. Lower-entropy values like cookies-enabled and Do Not Track also contribute. The combination is what's unique, not any single value. Even with cookies cleared and a fresh browser session, the fingerprint persists because these surfaces don't reset. Tools that score your specific fingerprint against the global distribution exist; the EFF maintains the canonical successor to Panopticlick for that purpose.",
        },
        {
          question: "How can I reduce my browser fingerprint exposure?",
          answer: "Three browser-native paths exist. Firefox's privacy.resistFingerprinting preference dates from Firefox 41 (2015) under the Tor Uplift project; letterboxing — applying multiples of 200×100 px to window dimensions — shipped in Firefox 67 on 21 May 2019. The pref also rounds performance.now() and animation timestamps to 16.67 ms, reports the timezone as UTC, and spoofs the User-Agent to a Tor-Browser-like value. Safari's Intelligent Tracking Prevention (announced WWDC June 2017, shipped Safari 11 September 2017) keeps third-party cookies accessible for 24 hours after the user's last first-party interaction, partitions them between 24 h and 30 days, and purges them after 30 days of inactivity. Chrome's Privacy Sandbox initially proposed Topics API for interest-based ad targeting and FedCM for federated identity; Google retired Topics and Protected Audience in October 2025, with FedCM and CHIPS surviving. UA-Client Hints (Chrome 89, 3 March 2021) freeze the User-Agent string and expose Sec-CH-UA / Sec-CH-UA-Mobile / Sec-CH-UA-Platform headers on opt-in. Browser extensions can spoof additional surfaces but break some sites; the trade-off depends on your threat model.",
        },
        {
          question: "What is UA-Client Hints and does it actually improve privacy?",
          answer: "UA-Client Hints (UA-CH) is a W3C draft (Web Incubator Community Group / WICG specification) that replaces the legacy User-Agent header with a frozen baseline value plus opt-in headers. As of Chrome 89 (3 March 2021), Chrome and Chromium-derived browsers send Sec-CH-UA and Sec-CH-UA-Mobile by default; sites that need browser version, platform, or architecture details must request them explicitly via Accept-CH. This reduces passive fingerprinting because the User-Agent string itself is no longer high-entropy — but it doesn't prevent fingerprinting via Canvas, WebGL, or fonts. Privacy improvement is partial: UA-CH constrains one axis (browser identity) while leaving the others (rendering, hardware) untouched. Firefox and Safari have not adopted UA-CH at the same depth as Chrome — Mozilla considers it an incremental change rather than a fundamental privacy win.",
        },
        {
          question: "How do cookies and fingerprints differ legally and what consent applies?",
          answer: "Cookies fall under EU ePrivacy Directive 2002/58/EC Article 5(3) (amended by Directive 2009/136/EC) which requires informed user consent before storing or accessing data on the user's terminal — that's the prompt every site shows. Combined with GDPR Article 6 (lawful basis: typically consent for tracking, legitimate interest for essential function), this gives users a control point. Browser fingerprints don't store anything on the device — they read configuration the browser already exposes — but Article 5(3) was extended in 2009 to cover 'access of information' too, so technically fingerprinting for tracking purposes also requires consent. Enforcement is patchy. Do Not Track (a browser-side opt-out signal proposed at the W3C) lost momentum because too few sites honoured it; Apple deprecated DNT in Safari 12.1 (March 2019) and the W3C closed the Tracking Protection Working Group in January 2019.",
        },
      ],
    },
    es: {
      faqs: [
        {
          question: "¿Qué es el fingerprinting de navegador y cuán única es probable que sea la mía?",
          answer: "El paper Panopticlick de Eckersley 2010 (How Unique is Your Web Browser?, Privacy Enhancing Technologies Symposium 2010, Berlín) midió 18,1 bits de entropía identificadora con solo 8 características (User-Agent, cabeceras HTTP Accept, plug-ins, fuentes, zona horaria, tamaño de pantalla, supercookies, flag de cookies) a través de aproximadamente 470.000 navegadores. El 84% tenían configuraciones únicas — significa que al azar, solo 1 de cada 286.777 compartiría una huella. Entre navegadores con Flash o Java la cifra subió a 94% únicos con 18,8 bits. Las bibliotecas modernas de fingerprinting combinan 30+ señales alcanzando mayor unicidad. El valor combinado persiste a través de borrado de cookies, modo incógnito y cambios de IP, razón por la que el fingerprinting se rastrea como preocupación de privacidad junto con las cookies.",
        },
        {
          question: "¿Qué superficies de mi navegador contribuyen realmente a la huella?",
          answer: "Los contribuyentes de alta entropía están bien documentados: renderizado de píxeles en Canvas (varía por driver GPU + versiones de fuente), salida de muestreo de AudioContext (varía por DSP de audio), cadena renderer WebGL (gl.getParameter expone modelo GPU), fuentes enumeradas (Canvas measureText sondea fuentes instaladas), resolución de pantalla y profundidad de color (window.screen), idiomas preferidos (navigator.languages), zona horaria (Date.getTimezoneOffset), concurrencia de CPU (navigator.hardwareConcurrency) y la cadena User-Agent. Valores de baja entropía como cookies-enabled y Do Not Track también contribuyen. La combinación es lo único, no un valor individual. Incluso con cookies borradas y sesión fresca, la huella persiste porque estas superficies no se reinician. Existen herramientas que puntúan tu huella específica contra la distribución global; la EFF mantiene el sucesor canónico de Panopticlick con esa finalidad.",
        },
        {
          question: "¿Cómo puedo reducir mi exposición al fingerprinting?",
          answer: "Existen tres caminos nativos del navegador. La preferencia privacy.resistFingerprinting de Firefox existe desde Firefox 41 (2015) dentro del proyecto Tor Uplift; el letterboxing — que aplica múltiplos de 200×100 px a las dimensiones de ventana — se incorporó en Firefox 67 el 21 de mayo de 2019. La preferencia también redondea performance.now() y los timestamps de animación a 16,67 ms, reporta la zona horaria como UTC y falsea el User-Agent con un valor tipo Tor Browser. Intelligent Tracking Prevention de Safari (anunciado WWDC junio 2017, lanzado en Safari 11 septiembre 2017) mantiene las cookies de terceros accesibles durante 24 h tras la última interacción de origen del usuario, las particiona entre 24 h y 30 días y las purga tras 30 días de inactividad. Privacy Sandbox de Chrome propuso inicialmente Topics API para targeting de anuncios por intereses y FedCM para identidad federada; Google retiró Topics y Protected Audience en octubre de 2025, sobreviviendo FedCM y CHIPS. UA-Client Hints (Chrome 89, 3 de marzo de 2021) congela la cadena User-Agent y expone Sec-CH-UA / Sec-CH-UA-Mobile / Sec-CH-UA-Platform por opt-in. Las extensiones de navegador pueden falsear superficies adicionales pero rompen algunos sitios; el trade-off depende de tu modelo de amenaza.",
        },
        {
          question: "¿Qué es UA-Client Hints y mejora realmente la privacidad?",
          answer: "UA-Client Hints (UA-CH) es un draft del W3C (especificación del Web Incubator Community Group / WICG) que reemplaza la cabecera User-Agent legacy con un valor base congelado más cabeceras por opt-in. A partir de Chrome 89 (3 de marzo de 2021), Chrome y los navegadores derivados de Chromium envían Sec-CH-UA y Sec-CH-UA-Mobile por defecto; los sitios que necesiten versión del navegador, plataforma o detalles de arquitectura deben pedirlas explícitamente vía Accept-CH. Esto reduce el fingerprinting pasivo porque la cadena User-Agent ya no es de alta entropía — pero no previene fingerprinting vía Canvas, WebGL o fuentes. La mejora de privacidad es parcial: UA-CH restringe un eje (identidad del navegador) dejando los otros (renderizado, hardware) intactos. Firefox y Safari no han adoptado UA-CH con la misma profundidad que Chrome — Mozilla lo considera un cambio incremental más que una victoria fundamental de privacidad.",
        },
        {
          question: "¿En qué difieren legalmente cookies y fingerprints y qué consentimiento aplica?",
          answer: "Las cookies caen bajo la Directiva ePrivacy 2002/58/CE Artículo 5(3) (modificada por la Directiva 2009/136/CE) que requiere consentimiento informado del usuario antes de almacenar o acceder a datos en el terminal del usuario — ese es el prompt que muestra cada sitio. Combinado con el Artículo 6 del RGPD (base legal: típicamente consentimiento para rastreo, interés legítimo para función esencial), esto da a los usuarios un punto de control. Los fingerprints de navegador no almacenan nada en el dispositivo — leen configuración que el navegador ya expone — pero el Artículo 5(3) se extendió en 2009 para cubrir también 'acceso a información', así que técnicamente el fingerprinting con fines de rastreo también requiere consentimiento. La aplicación es desigual. Do Not Track (una señal opt-out del lado del navegador propuesta en el W3C) perdió impulso porque pocos sitios lo respetaban; Apple deprecó DNT en Safari 12.1 (marzo de 2019) y el W3C cerró el grupo de trabajo Tracking Protection en enero de 2019.",
        },
      ],
    },
  },

  "redirect-checker": {
    en: {
      faqs: [
        { question: "What's the practical difference between 301, 302, 303, 307, and 308?", answer: "RFC 9110 §15.4 (Fielding, Nottingham & Reschke, 2022) defines five redirect types with specific semantics. 301 Moved Permanently (§15.4.2) and 302 Found (§15.4.3) historically allowed clients to convert POST to GET on retry — meaning a form submission redirected via 302 would lose its body. 303 See Other (§15.4.4) explicitly converts any method to GET; useful for the POST-redirect-GET pattern after form submission. 307 Temporary Redirect (§15.4.8) and 308 Permanent Redirect (§15.4.9) preserve the request method and body — POST stays POST, PUT stays PUT — making them safe for API redirects where the original semantics matter. For SEO, Google's Gary Illyes confirmed in 2016 that 30x redirects no longer lose PageRank, so the choice between 301 and 302 is now about HTTP semantics, not ranking signals." },
        { question: "How long should a redirect chain be?", answer: "Each hop adds one round-trip — TCP plus TLS plus HTTP — and increases the chance of the chain breaking. Browsers and HTTP clients enforce maximum chain limits to prevent loops: Chromium and Firefox cap at 20 redirects, Safari at 16, curl defaults to 50 (configurable via --max-redirs), Python's requests library defaults to 30. RFC 9110 §15.4 says clients SHOULD limit chain length but doesn't mandate a number. From a performance perspective, every redirect adds approximately 50–200 ms depending on geography and TLS resumption. Best practice is to keep chains to one hop maximum — the typical legitimate cases are HTTP-to-HTTPS (HSTS preload makes this skippable) and apex-to-www (or vice versa) for canonicalisation." },
        { question: "What is HSTS preload and how does it interact with redirects?", answer: "HSTS (HTTP Strict Transport Security, RFC 6797 Hodges, Jackson & Barth, 2012) tells browsers to upgrade all subsequent HTTP requests for a domain to HTTPS automatically. Once a domain is preloaded into Chromium's HSTS preload list (hstspreload.org, also used by Firefox, Safari, and Edge), browsers refuse plain HTTP entirely — which means the first HTTP-to-HTTPS redirect is skipped: the browser jumps straight to HTTPS internally without ever hitting the HTTP endpoint. This eliminates one redirect hop and closes a man-in-the-middle window during the initial TLS upgrade. Preload list inclusion requires a max-age of at least one year (31536000 seconds), the includeSubDomains directive, and the preload directive in the HSTS response header. Hstspreload.org's deployment guidance recommends ramping max-age in stages (5 minutes → 1 week → 1 month) before submission, but the staged ramp is guidance, not a strict admission requirement. Once added, removal takes weeks — design accordingly." },
        { question: "What is an open redirect vulnerability?", answer: "An open redirect (CWE-601 per MITRE, falling under OWASP A01:2021 Broken Access Control) occurs when a web application accepts a user-controlled URL parameter and redirects to it without validation — for example example.com/redirect?url=evil.com. Attackers exploit this for phishing campaigns: the trusted parent domain in the URL gives credibility while the actual destination is malicious. Common attack vectors include redirect-after-login flows, email tracking pixels, and 'continue to' parameters. Mitigations include maintaining an allowlist of acceptable redirect targets, rejecting absolute URLs in user input, and whitelist-validating against same-origin. Reject schemes other than https/http; specifically reject userinfo, javascript:, and data: schemes. The CWE catalogue entry was added by MITRE in 2007 (CWE Draft 6)." },
        { question: "Why does this tool show different chains than my browser?", answer: "Browsers add layers raw HTTP doesn't see: HSTS upgrades (described above), cookies that affect server-side redirect logic, geo-IP detection at the edge that varies routing, Service Worker cache that intercepts requests entirely, and HTTP/3 negotiation that can shortcut through alt-svc. This tool follows redirects from a Cloudflare Worker without browser cookies, without HSTS state, and without service worker layers — the result is what a fresh, cold HTTP client sees. If your browser shows a different chain it's typically because of HSTS upgrades (not visible in raw protocol) or cookie-driven server logic. To match this tool's view in your browser: open DevTools Network tab with 'Disable cache' and 'Preserve log' enabled, then test in an incognito or private window." },
      ],
    },
    es: {
      faqs: [
        { question: "¿Cuál es la diferencia práctica entre 301, 302, 303, 307 y 308?", answer: "RFC 9110 §15.4 (Fielding, Nottingham y Reschke, 2022) define cinco tipos de redirección con semántica específica. 301 Moved Permanently (§15.4.2) y 302 Found (§15.4.3) históricamente permitían a los clientes convertir POST a GET al reintentar — lo que significa que una petición de formulario redirigida vía 302 perdía su cuerpo. 303 See Other (§15.4.4) convierte explícitamente cualquier método a GET; útil para el patrón POST-redirect-GET tras envío de formulario. 307 Temporary Redirect (§15.4.8) y 308 Permanent Redirect (§15.4.9) preservan el método y el cuerpo de la petición — POST sigue siendo POST, PUT sigue siendo PUT — haciéndolas seguras para redirecciones de API donde la semántica original importa. Para SEO, Gary Illyes (Google) confirmó en 2016 que las redirecciones 30x ya no pierden PageRank, así que la elección entre 301 y 302 es ahora sobre semántica HTTP, no sobre señales de ranking." },
        { question: "¿Cuán larga debe ser una cadena de redirección?", answer: "Cada salto añade una ida y vuelta — TCP más TLS más HTTP — y aumenta la probabilidad de que la cadena se rompa. Los navegadores y clientes HTTP imponen límites máximos para evitar bucles: Chromium y Firefox cap a 20 redirecciones, Safari a 16, curl por defecto 50 (configurable vía --max-redirs), la biblioteca requests de Python por defecto 30. RFC 9110 §15.4 dice que los clientes SHOULD limitar la longitud pero no manda un número. Desde una perspectiva de rendimiento, cada redirección añade aproximadamente 50–200 ms según geografía y resumen TLS. La mejor práctica es mantener las cadenas a un salto máximo — los casos legítimos típicos son HTTP a HTTPS (preload HSTS lo hace omitible) y apex a www (o viceversa) para canonicalización." },
        { question: "¿Qué es HSTS preload y cómo interactúa con las redirecciones?", answer: "HSTS (HTTP Strict Transport Security, RFC 6797 Hodges, Jackson y Barth, 2012) indica a los navegadores que actualicen automáticamente todas las peticiones HTTP siguientes para un dominio a HTTPS. Una vez que un dominio está precargado en la lista de preload HSTS de Chromium (hstspreload.org, usada también por Firefox, Safari y Edge), los navegadores rechazan HTTP plano por completo — lo que significa que la primera redirección HTTP a HTTPS se omite: el navegador salta directo a HTTPS internamente sin tocar nunca el endpoint HTTP. Esto elimina un salto de redirección y cierra una ventana man-in-the-middle durante la actualización TLS inicial. La inclusión en preload requiere un max-age de al menos un año (31536000 segundos), la directiva includeSubDomains y la directiva preload en la cabecera HSTS. La guía de despliegue de hstspreload.org recomienda escalar max-age por etapas (5 minutos → 1 semana → 1 mes) antes de enviar el dominio, pero esa progresión es orientativa, no un requisito estricto de admisión. Una vez añadido, la eliminación lleva semanas — diseña en consecuencia." },
        { question: "¿Qué es una vulnerabilidad de redirección abierta?", answer: "Una redirección abierta (CWE-601 según MITRE, dentro de OWASP A01:2021 Broken Access Control) ocurre cuando una aplicación web acepta un parámetro URL controlado por el usuario y redirige sin validar — por ejemplo example.com/redirect?url=malicioso.com. Los atacantes explotan esto en campañas de phishing: el dominio padre confiable en la URL da credibilidad mientras el destino real es malicioso. Vectores comunes incluyen flujos de redirect-tras-login, píxeles de tracking en email y parámetros 'continue to'. Mitigaciones incluyen mantener una allowlist de destinos aceptables, rechazar URLs absolutas en la entrada del usuario y validación por allowlist contra el mismo origen. Rechaza esquemas distintos de https/http; específicamente rechaza userinfo, javascript:, y data:. La entrada del catálogo CWE fue añadida por MITRE en 2007 (CWE Draft 6)." },
        { question: "¿Por qué esta herramienta muestra cadenas distintas a mi navegador?", answer: "Los navegadores añaden capas que el HTTP en crudo no ve: actualizaciones HSTS (descritas arriba), cookies que afectan a la lógica de redirección del servidor, detección geo-IP en el edge que varía el routing, caché de Service Worker que intercepta peticiones por completo y negociación HTTP/3 que puede saltar vía alt-svc. Esta herramienta sigue las redirecciones desde un Cloudflare Worker sin cookies de navegador, sin estado HSTS y sin capas de service worker — el resultado es lo que ve un cliente HTTP frío y limpio. Si tu navegador muestra una cadena distinta es típicamente por actualizaciones HSTS (no visibles en el protocolo en crudo) o lógica de servidor basada en cookies. Para igualar la vista de esta herramienta en tu navegador: abre la pestaña Network de DevTools con 'Disable cache' y 'Preserve log' activados, luego prueba en una ventana de incógnito o privada." },
      ],
    },
  },
};
