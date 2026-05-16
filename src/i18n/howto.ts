import type { Lang } from "./index";

export interface HowToStep {
  name: string;
  text: string;
}

export interface ToolHowTo {
  name: string;
  steps: HowToStep[];
}

type HowToByLang = Record<Lang, ToolHowTo>;

export const howtoSteps: Record<string, HowToByLang> = {
  "my-ip": {
    en: {
      name: "How to Check Your Public IP Address",
      steps: [
        { name: "Open PingThat My IP", text: "Visit pingthat.dev/my-ip in any modern browser. No account or app install needed." },
        { name: "Wait for auto-detection", text: "PingThat detects your public IPv4 and IPv6 addresses automatically via a client-side request." },
        { name: "Review the details", text: "See your ISP, country, city, and ASN alongside the IP address." },
        { name: "Copy or share", text: "Click the copy button to place your IP on the clipboard for sharing or debugging." },
      ],
    },
    es: {
      name: "Cómo comprobar tu dirección IP pública",
      steps: [
        { name: "Abre PingThat Mi IP", text: "Visita pingthat.dev/es/my-ip desde cualquier navegador moderno. Sin cuenta ni instalación." },
        { name: "Espera la detección automática", text: "PingThat detecta tus direcciones IPv4 e IPv6 automáticamente mediante una petición en el cliente." },
        { name: "Revisa los detalles", text: "Consulta tu ISP, país, ciudad y ASN junto a la dirección IP." },
        { name: "Copia o comparte", text: "Haz clic en copiar para colocar la IP en el portapapeles y compartirla o debuggear." },
      ],
    },
  },

  "privacy-check": {
    en: {
      name: "How to Audit Your Browser Privacy",
      steps: [
        { name: "Open Privacy Check", text: "Visit pingthat.dev/privacy-check in the browser you want to audit." },
        { name: "Run the detection", text: "PingThat inspects your User-Agent, cookies, Do Not Track, referrer policy, and fingerprinting surface." },
        { name: "Review each signal", text: "Each row shows what the site sees, whether it's risky, and how to mitigate it in your browser settings." },
        { name: "Tighten your config", text: "Follow the linked fixes — enable ETP Strict, disable third-party cookies, or install a privacy-focused extension." },
      ],
    },
    es: {
      name: "Cómo auditar la privacidad de tu navegador",
      steps: [
        { name: "Abre Privacy Check", text: "Visita pingthat.dev/es/privacy-check desde el navegador que quieras auditar." },
        { name: "Ejecuta la detección", text: "PingThat inspecciona User-Agent, cookies, Do Not Track, política referrer y superficie de fingerprinting." },
        { name: "Revisa cada señal", text: "Cada fila muestra lo que ve el sitio, si es riesgoso y cómo mitigarlo en la configuración del navegador." },
        { name: "Ajusta tu configuración", text: "Sigue los fixes enlazados — activa ETP Strict, bloquea cookies de terceros, instala extensiones de privacidad." },
      ],
    },
  },

  "webrtc-leak-test": {
    en: {
      name: "How to Test for WebRTC IP Leaks",
      steps: [
        { name: "Connect to your VPN", text: "If you use a VPN, connect first so PingThat can confirm whether it masks your real IP." },
        { name: "Open the WebRTC Leak Test", text: "Visit pingthat.dev/webrtc-leak-test — the page triggers a benign WebRTC ICE gathering." },
        { name: "Inspect the results", text: "PingThat lists the local (RFC 1918) and public IPs exposed through ICE candidates." },
        { name: "Mitigate if leaking", text: "If your real IP appears, disable WebRTC or use a browser extension to block it (Firefox: media.peerconnection.enabled=false)." },
      ],
    },
    es: {
      name: "Cómo probar fugas de IP por WebRTC",
      steps: [
        { name: "Conéctate a tu VPN", text: "Si usas VPN, conéctate primero para que PingThat pueda confirmar si enmascara tu IP real." },
        { name: "Abre WebRTC Leak Test", text: "Visita pingthat.dev/es/webrtc-leak-test — la página activa un ICE gathering de WebRTC inofensivo." },
        { name: "Revisa los resultados", text: "PingThat lista las IPs locales (RFC 1918) y públicas expuestas a través de candidatos ICE." },
        { name: "Mitiga si hay fuga", text: "Si aparece tu IP real, desactiva WebRTC o usa una extensión (Firefox: media.peerconnection.enabled=false)." },
      ],
    },
  },

  "subnet-calculator": {
    en: {
      name: "How to Calculate an IPv4 Subnet",
      steps: [
        { name: "Enter a CIDR block", text: "Type any CIDR like 192.168.1.0/24 or 10.0.0.0/8 into the input field." },
        { name: "Review the breakdown", text: "PingThat computes network address, broadcast, subnet mask, wildcard, host range, and total hosts instantly." },
        { name: "Switch between formats", text: "Toggle between decimal, binary, and hex notation to see every representation of the mask." },
        { name: "Copy the result", text: "Click any value to copy it — handy for filling out firewall rules, routing tables, or documentation." },
      ],
    },
    es: {
      name: "Cómo calcular una subred IPv4",
      steps: [
        { name: "Introduce un bloque CIDR", text: "Escribe cualquier CIDR como 192.168.1.0/24 o 10.0.0.0/8 en el campo de entrada." },
        { name: "Revisa el desglose", text: "PingThat calcula dirección de red, broadcast, máscara, wildcard, rango de hosts y total de hosts al instante." },
        { name: "Cambia entre formatos", text: "Alterna entre decimal, binario y hex para ver cada representación de la máscara." },
        { name: "Copia el resultado", text: "Haz clic en cualquier valor para copiarlo — útil para reglas de firewall, tablas de ruteo o documentación." },
      ],
    },
  },

  "ip-converter": {
    en: {
      name: "How to Convert an IP Address to Other Formats",
      steps: [
        { name: "Type an IP address", text: "Enter any IPv4 address like 192.168.1.1 in the converter field." },
        { name: "See all representations", text: "PingThat shows decimal (3232235777), binary, hex, octal, and long-integer notation side by side." },
        { name: "Copy what you need", text: "Click the copy button next to any format — perfect for database storage, log parsing, or security research." },
        { name: "Reverse the conversion", text: "Paste any of the alternate formats back into the input to decode it to dotted IPv4." },
      ],
    },
    es: {
      name: "Cómo convertir una dirección IP a otros formatos",
      steps: [
        { name: "Escribe una dirección IP", text: "Introduce cualquier IPv4 como 192.168.1.1 en el campo del conversor." },
        { name: "Mira todas las representaciones", text: "PingThat muestra decimal (3232235777), binario, hex, octal y entero largo lado a lado." },
        { name: "Copia lo que necesites", text: "Haz clic en el botón de copiar junto a cualquier formato — ideal para bases de datos, logs o investigación." },
        { name: "Convierte al revés", text: "Pega cualquiera de los formatos alternativos para decodificarlo a IPv4 con puntos." },
      ],
    },
  },

  "password-strength": {
    en: {
      name: "How to Check Password Strength Privately",
      steps: [
        { name: "Type a password", text: "Enter a candidate password. PingThat runs zxcvbn entirely in your browser — the password never leaves your device." },
        { name: "Read the score", text: "See the 0–4 strength rating with an estimated crack time against online and offline attack scenarios." },
        { name: "Review the warnings", text: "PingThat flags common patterns (keyboard walks, dates, leet substitutions) and suggests concrete improvements." },
        { name: "Use a passphrase", text: "Apply the suggestions — four random words produce a much stronger password than a short mix of symbols." },
      ],
    },
    es: {
      name: "Cómo comprobar la fortaleza de una contraseña de forma privada",
      steps: [
        { name: "Escribe una contraseña", text: "Introduce una contraseña candidata. PingThat usa zxcvbn 100% en tu navegador — la contraseña nunca sale del dispositivo." },
        { name: "Lee la puntuación", text: "Mira la clasificación 0–4 con tiempo estimado de descifrado frente a ataques online y offline." },
        { name: "Revisa los avisos", text: "PingThat marca patrones comunes (teclados, fechas, sustituciones leet) y sugiere mejoras concretas." },
        { name: "Usa una passphrase", text: "Aplica las sugerencias — cuatro palabras aleatorias dan más fortaleza que una mezcla corta de símbolos." },
      ],
    },
  },

  "jwt-decoder": {
    en: {
      name: "How to Decode a JWT Token",
      steps: [
        { name: "Paste the token", text: "Paste any JWT into the input. PingThat decodes it entirely in your browser — tokens never leave your device." },
        { name: "Review the header and payload", text: "See the decoded header (alg, typ) and payload claims (iss, sub, exp, iat, custom fields) in a clean JSON viewer." },
        { name: "Check expiration", text: "PingThat highlights exp and iat timestamps in human-readable form so you can spot expired or not-yet-valid tokens." },
        { name: "Inspect the signature", text: "The signature section is shown raw — verification requires the signing key and is intentionally client-side only." },
      ],
    },
    es: {
      name: "Cómo decodificar un token JWT",
      steps: [
        { name: "Pega el token", text: "Pega cualquier JWT en la entrada. PingThat lo decodifica en tu navegador — los tokens nunca salen del dispositivo." },
        { name: "Revisa header y payload", text: "Mira el header decodificado (alg, typ) y los claims del payload (iss, sub, exp, iat, campos custom) en un visor JSON." },
        { name: "Comprueba la expiración", text: "PingThat muestra exp e iat en formato legible para detectar tokens caducados o aún no válidos." },
        { name: "Inspecciona la firma", text: "La sección de firma se muestra en crudo — verificarla requiere la clave, y solo se hace en cliente a propósito." },
      ],
    },
  },

  "dns-lookup": {
    en: {
      name: "How to Perform a DNS Lookup",
      steps: [
        { name: "Enter a domain name", text: "Type any domain like example.com into the lookup field." },
        { name: "Pick record types", text: "Select A, AAAA, MX, TXT, NS, CNAME, SOA, CAA, or run all of them in one query." },
        { name: "Review the results", text: "See TTL, record values, and the authoritative nameserver for each record — updated directly from public DNS." },
        { name: "Troubleshoot propagation", text: "Compare records across multiple public resolvers (Google, Cloudflare, Quad9) to spot propagation delays." },
      ],
    },
    es: {
      name: "Cómo realizar una consulta DNS",
      steps: [
        { name: "Introduce un dominio", text: "Escribe cualquier dominio como ejemplo.com en el campo de consulta." },
        { name: "Elige tipos de registro", text: "Selecciona A, AAAA, MX, TXT, NS, CNAME, SOA, CAA o ejecuta todos en una única consulta." },
        { name: "Revisa los resultados", text: "Mira TTL, valores de registro y nameserver autoritativo — actualizados directamente del DNS público." },
        { name: "Diagnostica propagación", text: "Compara registros en varios resolvers públicos (Google, Cloudflare, Quad9) para detectar retrasos." },
      ],
    },
  },

  "email-auth": {
    en: {
      name: "How to Check SPF, DKIM, and DMARC Records",
      steps: [
        { name: "Enter your domain", text: "Type the domain you want to audit (e.g. yourcompany.com) into the email-auth checker." },
        { name: "Review SPF", text: "PingThat shows the TXT record, parsed mechanisms, include chain, and flags if you exceed the 10-lookup SPF limit." },
        { name: "Check DKIM selectors", text: "Test common DKIM selectors (default, google, mailgun) and see the public key length and algorithm." },
        { name: "Inspect DMARC policy", text: "See your DMARC record with parsed tags — policy (none/quarantine/reject), percentage, reporting addresses — so you can tighten enforcement." },
      ],
    },
    es: {
      name: "Cómo comprobar registros SPF, DKIM y DMARC",
      steps: [
        { name: "Introduce tu dominio", text: "Escribe el dominio que quieras auditar (p.ej. tuempresa.com) en el verificador." },
        { name: "Revisa SPF", text: "PingThat muestra el TXT, mecanismos analizados, cadena de include y avisa si superas el límite de 10 lookups." },
        { name: "Comprueba selectores DKIM", text: "Prueba selectores comunes (default, google, mailgun) y mira la longitud de la clave pública y el algoritmo." },
        { name: "Inspecciona la política DMARC", text: "Mira tu DMARC con tags analizados — política (none/quarantine/reject), porcentaje, direcciones de informes." },
      ],
    },
  },

  "port-scan": {
    en: {
      name: "How to Scan Open Ports on a Host",
      steps: [
        { name: "Enter a hostname or IP", text: "Type the target host — your own domain, a server you administer, or any host you're authorized to test." },
        { name: "Pick the port set", text: "Choose common ports (HTTP, HTTPS, SSH, FTP, SMTP, databases) or enter custom ports." },
        { name: "Run the scan", text: "PingThat checks reachability from the public internet and reports open, closed, and filtered states." },
        { name: "Review and harden", text: "Close any ports you don't need, update firewall rules, and re-scan to confirm. Only scan hosts you own or have explicit permission to test." },
      ],
    },
    es: {
      name: "Cómo escanear puertos abiertos en un host",
      steps: [
        { name: "Introduce host o IP", text: "Escribe el host objetivo — tu propio dominio, un servidor que administres o cualquier host que tengas autorización para probar." },
        { name: "Elige el conjunto de puertos", text: "Selecciona puertos comunes (HTTP, HTTPS, SSH, FTP, SMTP, bases de datos) o introduce los tuyos." },
        { name: "Ejecuta el escaneo", text: "PingThat comprueba alcance desde internet público y muestra estados abierto, cerrado y filtrado." },
        { name: "Revisa y endurece", text: "Cierra puertos innecesarios, actualiza reglas de firewall y vuelve a escanear. Solo escanea hosts que te pertenezcan o tengas permiso." },
      ],
    },
  },

  "ssl-checker": {
    en: {
      name: "How to Check an SSL Certificate",
      steps: [
        { name: "Enter a domain", text: "Type the domain you want to audit (e.g. example.com) — omit https:// and any path." },
        { name: "Review the chain", text: "PingThat fetches the live certificate and shows issuer, subject, validity dates, key algorithm, and the full chain to the root." },
        { name: "Check SAN entries", text: "The Subject Alternative Names section lists every host the certificate is valid for." },
        { name: "Watch for expiry", text: "PingThat highlights the days until expiry so you can renew before it lapses — no outages for your users." },
      ],
    },
    es: {
      name: "Cómo comprobar un certificado SSL",
      steps: [
        { name: "Introduce un dominio", text: "Escribe el dominio a auditar (p.ej. ejemplo.com) — omite https:// y la ruta." },
        { name: "Revisa la cadena", text: "PingThat descarga el certificado en vivo y muestra emisor, sujeto, fechas, algoritmo de clave y cadena completa hasta la raíz." },
        { name: "Comprueba los SAN", text: "La sección Subject Alternative Names lista todos los hosts para los que el certificado es válido." },
        { name: "Vigila la expiración", text: "PingThat resalta los días hasta caducar para que renueves antes y tus usuarios no tengan caídas." },
      ],
    },
  },

  "is-it-down": {
    en: {
      name: "How to Check if a Website is Down",
      steps: [
        { name: "Enter the URL", text: "Type the full URL (or just the domain) of the site you think might be down." },
        { name: "Run the check", text: "PingThat makes a live HTTP request and reports the status code, response time, and any redirect chain." },
        { name: "Interpret the result", text: "A 200-299 means it's up, 3xx a redirect, 4xx/5xx an error. Network errors mean it's likely down globally." },
        { name: "Cross-reference", text: "If PingThat says up but you can't reach it, the issue is local (ISP, DNS, firewall). If down for PingThat too, it's global." },
      ],
    },
    es: {
      name: "Cómo comprobar si una web está caída",
      steps: [
        { name: "Introduce la URL", text: "Escribe la URL completa (o solo el dominio) del sitio que crees que puede estar caído." },
        { name: "Ejecuta la comprobación", text: "PingThat hace una petición HTTP en vivo y muestra código de estado, tiempo de respuesta y cualquier cadena de redirecciones." },
        { name: "Interpreta el resultado", text: "200-299 significa up, 3xx redirect, 4xx/5xx error. Errores de red indican caída global probable." },
        { name: "Contrasta", text: "Si PingThat ve up pero tú no llegas, el problema es local (ISP, DNS, firewall). Si PingThat también ve caída, es global." },
      ],
    },
  },

  "http-headers": {
    en: {
      name: "How to Inspect HTTP Response Headers",
      steps: [
        { name: "Enter a URL", text: "Type any URL — homepage, API endpoint, or static asset — you want to inspect." },
        { name: "Run the request", text: "PingThat issues a HEAD (or GET) and captures every response header exactly as the server sent it." },
        { name: "Audit security headers", text: "Check Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, Referrer-Policy, Permissions-Policy — missing ones are highlighted." },
        { name: "Review cache and cookies", text: "See Cache-Control, ETag, Set-Cookie, and CORS headers to debug caching and cross-origin behavior." },
      ],
    },
    es: {
      name: "Cómo inspeccionar headers HTTP de respuesta",
      steps: [
        { name: "Introduce una URL", text: "Escribe cualquier URL — home, endpoint de API o asset estático — que quieras inspeccionar." },
        { name: "Ejecuta la petición", text: "PingThat hace un HEAD (o GET) y captura cada header de respuesta tal como lo envía el servidor." },
        { name: "Audita headers de seguridad", text: "Revisa Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, Referrer-Policy, Permissions-Policy — se marcan los que faltan." },
        { name: "Revisa cache y cookies", text: "Mira Cache-Control, ETag, Set-Cookie y headers CORS para debuggear cache y comportamiento cross-origin." },
      ],
    },
  },

  "whois-lookup": {
    en: {
      name: "How to Look Up WHOIS Information for a Domain",
      steps: [
        { name: "Enter the domain", text: "Type the domain you want to research (e.g. example.com) into the WHOIS lookup field." },
        { name: "Review registration info", text: "See the registrar, creation and expiry dates, status codes, and name servers currently authoritative for the domain." },
        { name: "Inspect contact details", text: "Where public, the registrant, admin, and tech contacts appear — most TLDs now redact behind GDPR privacy proxies." },
        { name: "Check DNSSEC and status", text: "PingThat flags DNSSEC enabled/disabled and any clientHold / serverHold states that affect resolution." },
      ],
    },
    es: {
      name: "Cómo consultar la información WHOIS de un dominio",
      steps: [
        { name: "Introduce el dominio", text: "Escribe el dominio que quieras investigar (p.ej. ejemplo.com) en el campo de consulta WHOIS." },
        { name: "Revisa la información de registro", text: "Mira el registrar, fechas de creación y expiración, códigos de estado y nameservers autoritativos actualmente." },
        { name: "Inspecciona contactos", text: "Si son públicos, aparecen los contactos de registrante, admin y técnico — la mayoría de TLDs ahora los ocultan por GDPR." },
        { name: "Comprueba DNSSEC y estado", text: "PingThat marca DNSSEC activo/inactivo y estados clientHold / serverHold que afectan la resolución." },
      ],
    },
  },

  "redirect-checker": {
    en: {
      name: "How to Check a URL's Redirect Chain",
      steps: [
        { name: "Paste a URL", text: "Enter any URL — a shortlink, old page, marketing link — to trace where it lands." },
        { name: "Follow the chain", text: "PingThat follows each 301/302/307/308 step and lists every URL, status code, and cookies set along the way." },
        { name: "Spot long chains", text: "Anything longer than 2 hops wastes crawl budget and leaks link equity. Redirect directly to the final URL instead." },
        { name: "Verify final landing", text: "Check the final URL matches what you expect — no unintended staging environments or marketing params that leak." },
      ],
    },
    es: {
      name: "Cómo comprobar la cadena de redirecciones de una URL",
      steps: [
        { name: "Pega una URL", text: "Introduce cualquier URL — shortlink, página vieja, enlace de marketing — para rastrear dónde acaba." },
        { name: "Sigue la cadena", text: "PingThat sigue cada paso 301/302/307/308 y lista URL, código de estado y cookies establecidas." },
        { name: "Detecta cadenas largas", text: "Cualquier cadena de más de 2 saltos desperdicia crawl budget y pierde link equity. Redirige directamente al destino final." },
        { name: "Verifica el destino final", text: "Comprueba que la URL final es la esperada — sin staging accidental ni parámetros de marketing fugados." },
      ],
    },
  },

  "url-parser": {
    en: {
      name: "How to Parse a URL Into Its Components",
      steps: [
        { name: "Paste a URL", text: "Paste any URL into the parser — simple or complex, with query strings and fragments." },
        { name: "Review the components", text: "PingThat splits the URL into protocol, host, port, path, query parameters, and fragment — each on its own row." },
        { name: "Inspect query params", text: "Each query parameter is decoded and shown as key/value pairs so you can spot encoding issues or tracking params." },
        { name: "Copy any part", text: "Click any component to copy it to the clipboard — handy for building canonical URLs or debugging redirects." },
      ],
    },
    es: {
      name: "Cómo analizar una URL en sus componentes",
      steps: [
        { name: "Pega una URL", text: "Pega cualquier URL en el parser — simple o compleja, con query strings y fragmentos." },
        { name: "Revisa los componentes", text: "PingThat divide la URL en protocolo, host, puerto, ruta, parámetros query y fragmento — cada uno en su fila." },
        { name: "Inspecciona los query params", text: "Cada parámetro query se decodifica y muestra como clave/valor para detectar problemas de encoding o parámetros de tracking." },
        { name: "Copia cualquier parte", text: "Haz clic en cualquier componente para copiarlo — útil para URLs canónicas o debug de redirecciones." },
      ],
    },
  },

  "is-it-up": {
    en: {
      name: "How to Verify if a Service is Online",
      steps: [
        { name: "Enter the URL or host", text: "Type the URL or hostname of the service you want to verify is reachable." },
        { name: "Run the probe", text: "PingThat performs a live HTTP check and a TCP connectivity check against the target." },
        { name: "Review status and latency", text: "See the HTTP status code, response time in ms, and whether any redirects are in play before reaching a 200." },
        { name: "Debug if flaky", text: "Intermittent 5xx or timeouts usually point to upstream or capacity issues. Rerun a few times to characterize the pattern." },
      ],
    },
    es: {
      name: "Cómo verificar si un servicio está online",
      steps: [
        { name: "Introduce URL o host", text: "Escribe la URL o hostname del servicio que quieras comprobar que está accesible." },
        { name: "Ejecuta la prueba", text: "PingThat realiza una comprobación HTTP en vivo y un check de conectividad TCP contra el objetivo." },
        { name: "Revisa estado y latencia", text: "Mira el código HTTP, tiempo de respuesta en ms y si hay redirecciones antes de llegar a un 200." },
        { name: "Debuggea si falla", text: "5xx intermitentes o timeouts suelen indicar problemas upstream o de capacidad. Repite varias veces para caracterizar el patrón." },
      ],
    },
  },

  "caa-lookup": {
    en: {
      name: "How to Check a Domain's CAA Policy",
      steps: [
        { name: "Enter the domain", text: "Type the apex domain you want to audit (e.g. example.com). No www prefix needed — CAA policy applies at the zone level." },
        { name: "Read the policy", text: "PingThat walks up the DNS tree and shows every CAA record with its tag (issue, issuewild, iodef) and the critical bit when set." },
        { name: "Verify a specific CA", text: "Pick one of the common CAs or type any identifier (e.g. letsencrypt.org) to confirm whether that authority is allowed to issue." },
        { name: "Fix gaps", text: "If the domain has no CAA records, any trusted CA can issue certificates for it. Publish a policy listing only the CAs you actually use." },
      ],
    },
    es: {
      name: "Cómo comprobar la política CAA de un dominio",
      steps: [
        { name: "Introduce el dominio", text: "Escribe el dominio raíz que quieras auditar (p. ej. ejemplo.com). Sin www — la política CAA se aplica a nivel de zona." },
        { name: "Lee la política", text: "PingThat recorre el árbol DNS y muestra cada registro CAA con su etiqueta (issue, issuewild, iodef) y el bit crítico si está activo." },
        { name: "Verifica una CA concreta", text: "Elige una CA común o escribe cualquier identificador (p. ej. letsencrypt.org) para confirmar si esa autoridad está autorizada a emitir." },
        { name: "Corrige carencias", text: "Si el dominio no tiene CAA, cualquier CA de confianza puede emitir certificados. Publica una política con solo las CAs que realmente uses." },
      ],
    },
  },

  "ipv6-check": {
    en: {
      name: "How to Audit a Domain's IPv6 Readiness",
      steps: [
        { name: "Enter the domain", text: "Type the apex domain. PingThat audits the apex, www, nameservers, and mail servers in parallel." },
        { name: "Review the 0–4 score", text: "Each missing AAAA costs a point. Scores of 3–4 mean dual-stack works; 0–2 means mobile and IPv6-only users will struggle." },
        { name: "Spot infrastructure gaps", text: "The infrastructure card shows NS-with-AAAA and MX-with-AAAA ratios so you can see exactly which hosts still lack IPv6." },
        { name: "Fix missing records", text: "Ask your DNS provider to publish AAAA for apex and www. For mail, coordinate with your provider to add v6 listeners before publishing MX AAAA." },
      ],
    },
    es: {
      name: "Cómo auditar la preparación IPv6 de un dominio",
      steps: [
        { name: "Introduce el dominio", text: "Escribe el dominio raíz. PingThat audita apex, www, nameservers y servidores de correo en paralelo." },
        { name: "Revisa la puntuación 0–4", text: "Cada AAAA ausente resta un punto. 3–4 indica dual-stack funcional; 0–2 implica problemas con usuarios móviles o IPv6-only." },
        { name: "Detecta huecos de infraestructura", text: "La tarjeta de infraestructura muestra el ratio NS-con-AAAA y MX-con-AAAA para ver exactamente qué hosts siguen sin IPv6." },
        { name: "Corrige los registros ausentes", text: "Pide a tu proveedor DNS que publique AAAA para apex y www. Para correo, coordina con tu proveedor antes de publicar MX AAAA." },
      ],
    },
  },

  "dnssec-check": {
    en: {
      name: "How to Validate DNSSEC on a Domain",
      steps: [
        { name: "Enter the domain", text: "Type the apex domain. PingThat queries DNSKEY at the zone, DS at the parent, and asks Cloudflare 1.1.1.1 to validate." },
        { name: "Read the verdict", text: "Secure means DNSKEY+DS+AD flag all agree. Bogus means the zone is signed but validation fails — users on validating resolvers get SERVFAIL." },
        { name: "Inspect the algorithms", text: "Review the DS and DNSKEY tables to confirm modern signing algorithms (ECDSA P-256 or Ed25519). Avoid RSA/SHA-1." },
        { name: "Fix bogus signing", text: "Bogus DNSSEC takes your domain offline for validating users. Either roll keys, re-sign the zone, or temporarily ask the registrar to remove the DS record." },
      ],
    },
    es: {
      name: "Cómo validar DNSSEC en un dominio",
      steps: [
        { name: "Introduce el dominio", text: "Escribe el dominio raíz. PingThat consulta DNSKEY en la zona, DS en el padre y pide a Cloudflare 1.1.1.1 que valide." },
        { name: "Lee el veredicto", text: "Seguro significa DNSKEY+DS+flag AD coinciden. Bogus significa zona firmada pero la validación falla — los usuarios con resolver validador reciben SERVFAIL." },
        { name: "Inspecciona algoritmos", text: "Revisa las tablas DS y DNSKEY para confirmar algoritmos modernos (ECDSA P-256 o Ed25519). Evita RSA/SHA-1." },
        { name: "Arregla el signing roto", text: "DNSSEC Bogus tira tu dominio para usuarios validadores. Rota claves, re-firma la zona o pide temporalmente al registrador que retire el DS." },
      ],
    },
  },

  "reverse-dns": {
    en: {
      name: "How to Run a Reverse DNS (PTR) Lookup",
      steps: [
        { name: "Enter an IP address", text: "Type an IPv4 (a.b.c.d) or IPv6 address. PingThat accepts :: compression and brackets." },
        { name: "See the PTR record", text: "PingThat constructs the correct in-addr.arpa or ip6.arpa label and queries Cloudflare DoH for PTR." },
        { name: "Interpret 'no PTR'", text: "A missing PTR is common for residential and some cloud IPs. For a mail server it strongly hurts deliverability — ask your provider to set one." },
        { name: "Cross-check forward", text: "For mail, the PTR should resolve forward back to the same IP. Use the DNS Lookup tool to verify forward resolution matches." },
      ],
    },
    es: {
      name: "Cómo hacer un DNS inverso (PTR)",
      steps: [
        { name: "Introduce una IP", text: "Escribe una IPv4 (a.b.c.d) o IPv6. PingThat acepta compresión :: y corchetes." },
        { name: "Obtén el PTR", text: "PingThat construye el label correcto in-addr.arpa o ip6.arpa y consulta PTR vía Cloudflare DoH." },
        { name: "Interpreta 'sin PTR'", text: "PTR ausente es común en IPs residenciales y algunos rangos cloud. En servidores de correo afecta gravemente la entregabilidad — pide al proveedor que lo configure." },
        { name: "Verifica el forward", text: "En correo, el PTR debería resolver hacia adelante a la misma IP. Usa DNS Lookup para confirmar que la resolución forward coincide." },
      ],
    },
  },

  "resolver-compare": {
    en: {
      name: "How to Compare DNS Across Major Resolvers",
      steps: [
        { name: "Enter the domain", text: "Type the domain and pick a record type (A, AAAA, MX, NS, TXT, CNAME)." },
        { name: "Read the consistency verdict", text: "Green means every resolver returned the same answer set. Yellow means at least one differs — propagation, GeoDNS, or resolver caching issue." },
        { name: "Check per-resolver latency", text: "The colour-coded response time tells you which resolvers are fast or slow for this query from PingThat's CF edge." },
        { name: "Wait out the TTL", text: "If you just changed DNS and see divergence, note the TTL. Full global convergence waits for the longest TTL to expire across all resolver caches." },
      ],
    },
    es: {
      name: "Cómo comparar DNS entre resolvers mayores",
      steps: [
        { name: "Introduce el dominio", text: "Escribe el dominio y elige un tipo de registro (A, AAAA, MX, NS, TXT, CNAME)." },
        { name: "Lee el veredicto de consistencia", text: "Verde: todos los resolvers devuelven la misma respuesta. Amarillo: al menos uno difiere — propagación, GeoDNS o cache del resolver." },
        { name: "Comprueba latencia por resolver", text: "El tiempo de respuesta con código de color indica qué resolvers son rápidos o lentos para esta consulta desde el edge CF de PingThat." },
        { name: "Espera el TTL", text: "Si acabas de cambiar DNS y ves divergencia, mira el TTL. La convergencia global espera a que caduque el TTL mayor en todas las cachés." },
      ],
    },
  },

  "site-speed": {
    en: {
      name: "How to Check Real-User Core Web Vitals",
      steps: [
        { name: "Enter the URL or origin", text: "Type a full URL or the origin. PingThat tries URL-level first, falling back to origin-level when URL data is too sparse." },
        { name: "Pick the form factor", text: "Toggle Mobile or Desktop. Mobile is usually where Core Web Vitals fail first — mobile CPUs are slower and connections spottier." },
        { name: "Read the five metrics", text: "LCP, INP, and CLS are the ranking signals. FCP and TTFB are supporting diagnostics. Each is rated Good / Needs improvement / Poor at p75." },
        { name: "Fix the worst metric first", text: "If INP is poor, cut long tasks and third-party JS. If LCP is poor, preload hero assets. If CLS is poor, reserve space for images and ads." },
      ],
    },
    es: {
      name: "Cómo comprobar Core Web Vitals con usuarios reales",
      steps: [
        { name: "Introduce URL u origen", text: "Escribe una URL completa o el origen. PingThat intenta primero nivel URL; si hay pocos datos usa origen." },
        { name: "Elige el dispositivo", text: "Alterna Móvil o Escritorio. En móvil es donde más suelen fallar los Core Web Vitals — CPUs más lentas y redes peores." },
        { name: "Lee las cinco métricas", text: "LCP, INP y CLS son las señales de ranking. FCP y TTFB son diagnóstico de apoyo. Cada una se valora Bueno / Mejorable / Deficiente al p75." },
        { name: "Arregla la peor métrica primero", text: "Si INP es mala, corta tareas largas y JS de terceros. Si LCP es mala, pre-carga recursos hero. Si CLS es mala, reserva espacio para imágenes y anuncios." },
      ],
    },
  },
};

export function getHowTo(toolId: string, lang: Lang): ToolHowTo | undefined {
  return howtoSteps[toolId]?.[lang];
}
