import type { Lang } from "./index";

// ─── Per-page SEO and content translations ──────────────────────────────────

export const pageI18n: Record<
  string,
  Record<Lang, {
    title: string;
    description: string;
    seoHeading: string;
    seoText: string;
    seoBlockHeading: string;
    seoBlockText: string;
    seoFeatures: string[];
  }>
> = {
  "my-ip": {
    en: {
      title: "What Is My IP",
      description: "See your public IPv4 and IPv6 address, geolocation, ISP, and ASN details in real time. Free, instant lookup with no tracking or signup.",
      seoHeading: "About this tool",
      seoText: "Instantly see your public IP address along with your approximate location, ISP, timezone, and connection details. We fetch your IP from public APIs and display it locally \u2014 no data is stored or logged.",
      seoBlockHeading: "How does IP detection work?",
      seoBlockText: "When you visit any website, your public IP address is visible to the server. This tool uses third-party APIs (ipapi.co and ipify.org) to retrieve your IP and associated geolocation data. The results are displayed in your browser and never stored.",
      seoFeatures: [
        "Public IPv4 address detection",
        "Approximate geolocation (city, region, country)",
        "ISP and organization identification",
        "Timezone detection",
        "Browser and connection info",
      ],
    },
    es: {
      title: "Cu\u00e1l Es Mi IP",
      description: "Consulta tu direcci\u00f3n IPv4 e IPv6 p\u00fablica, geolocalizaci\u00f3n, ISP y ASN en tiempo real. Gratis, instant\u00e1neo, sin rastreo ni registro.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Consulta instant\u00e1neamente tu direcci\u00f3n IP p\u00fablica junto con tu ubicaci\u00f3n aproximada, ISP, zona horaria y detalles de conexi\u00f3n. Obtenemos tu IP de APIs p\u00fablicas y la mostramos localmente \u2014 no se almacena ni registra ning\u00fan dato.",
      seoBlockHeading: "\u00bfC\u00f3mo funciona la detecci\u00f3n de IP?",
      seoBlockText: "Cuando visitas cualquier sitio web, tu direcci\u00f3n IP p\u00fablica es visible para el servidor. Esta herramienta utiliza APIs de terceros (ipapi.co e ipify.org) para obtener tu IP y los datos de geolocalizaci\u00f3n asociados. Los resultados se muestran en tu navegador y nunca se almacenan.",
      seoFeatures: [
        "Detecci\u00f3n de direcci\u00f3n IPv4 p\u00fablica",
        "Geolocalizaci\u00f3n aproximada (ciudad, regi\u00f3n, pa\u00eds)",
        "Identificaci\u00f3n de ISP y organizaci\u00f3n",
        "Detecci\u00f3n de zona horaria",
        "Informaci\u00f3n del navegador y conexi\u00f3n",
      ],
    },
  },

  "privacy-check": {
    en: {
      title: "Browser Privacy Check",
      description: "Check your browser's privacy settings, tracking protection, cookies, and fingerprint exposure. Free, instant, runs 100% client-side.",
      seoHeading: "About this tool",
      seoText: "This tool checks what information your browser exposes to websites. It tests Do Not Track, cookies, WebRTC leaks, canvas and audio fingerprinting, WebGL vendor, and hardware details. Everything runs locally in your browser.",
      seoBlockHeading: "Understanding browser fingerprinting",
      seoBlockText: "Websites can identify you without cookies by combining unique browser characteristics into a 'fingerprint'. Canvas rendering, WebGL vendor strings, installed fonts, screen resolution, and hardware specs all contribute to a unique identifier.",
      seoFeatures: [
        "Do Not Track and cookie settings",
        "WebRTC leak detection",
        "Canvas and audio fingerprint analysis",
        "WebGL renderer identification",
        "Hardware and platform exposure",
        "Exportable privacy report",
      ],
    },
    es: {
      title: "Comprobaci\u00f3n de Privacidad del Navegador",
      description: "Comprueba la privacidad del navegador: protecci\u00f3n contra rastreo, cookies y huella digital. Gratis, instant\u00e1neo y 100% en el cliente.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Esta herramienta comprueba qu\u00e9 informaci\u00f3n expone tu navegador a los sitios web. Analiza Do Not Track, cookies, fugas WebRTC, huella de canvas y audio, fabricante WebGL y detalles de hardware. Todo se ejecuta localmente en tu navegador.",
      seoBlockHeading: "Entendiendo la huella digital del navegador",
      seoBlockText: "Los sitios web pueden identificarte sin cookies combinando caracter\u00edsticas \u00fanicas del navegador en una 'huella digital'. El renderizado del canvas, las cadenas de fabricante WebGL, las fuentes instaladas, la resoluci\u00f3n de pantalla y las especificaciones de hardware contribuyen a un identificador \u00fanico.",
      seoFeatures: [
        "Configuraci\u00f3n de Do Not Track y cookies",
        "Detecci\u00f3n de fugas WebRTC",
        "An\u00e1lisis de huella de canvas y audio",
        "Identificaci\u00f3n del renderizador WebGL",
        "Exposici\u00f3n de hardware y plataforma",
        "Informe de privacidad exportable",
      ],
    },
  },

  "webrtc-leak-test": {
    en: {
      title: "WebRTC Leak Test",
      description: "Check if WebRTC is leaking your real IP behind a VPN. Detects local and public IPs exposed through ICE candidates. Free, runs in your browser.",
      seoHeading: "About this tool",
      seoText: "This tool creates a WebRTC peer connection and inspects ICE candidates to determine if your local (private) IP addresses are being leaked. Particularly important for VPN users who want to ensure their real IP is hidden.",
      seoBlockHeading: "Why WebRTC leaks matter",
      seoBlockText: "WebRTC can bypass VPN tunnels by using STUN servers to discover your real network interfaces. Even with a VPN active, websites may see your local IP (e.g., 192.168.x.x or 10.x.x.x), revealing your network configuration.",
      seoFeatures: [
        "STUN server ICE candidate analysis",
        "IPv4 and IPv6 detection",
        "Local vs public IP classification",
        "mDNS candidate detection",
        "Re-runnable on demand",
      ],
    },
    es: {
      title: "Test de Fugas WebRTC",
      description: "Comprueba si WebRTC est\u00e1 filtrando tu direcci\u00f3n IP real. Detecta IPs locales y p\u00fablicas expuestas a trav\u00e9s de candidatos ICE.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Esta herramienta crea una conexi\u00f3n peer WebRTC e inspecciona los candidatos ICE para determinar si tus direcciones IP locales (privadas) est\u00e1n siendo filtradas. Especialmente importante para usuarios de VPN que quieren asegurar que su IP real est\u00e1 oculta.",
      seoBlockHeading: "Por qu\u00e9 importan las fugas WebRTC",
      seoBlockText: "WebRTC puede eludir los t\u00faneles VPN usando servidores STUN para descubrir tus interfaces de red reales. Incluso con una VPN activa, los sitios web pueden ver tu IP local (p. ej., 192.168.x.x o 10.x.x.x), revelando tu configuraci\u00f3n de red.",
      seoFeatures: [
        "An\u00e1lisis de candidatos ICE del servidor STUN",
        "Detecci\u00f3n de IPv4 e IPv6",
        "Clasificaci\u00f3n de IP local vs p\u00fablica",
        "Detecci\u00f3n de candidatos mDNS",
        "Ejecutable bajo demanda",
      ],
    },
  },

  "subnet-calculator": {
    en: {
      title: "Subnet Calculator",
      description: "Calculate network address, broadcast address, host range, subnet mask, and wildcard from any CIDR block. Free IPv4 subnet planner in browser.",
      seoHeading: "About this tool",
      seoText: "Enter an IP address and CIDR prefix length to instantly calculate network details including network address, broadcast address, host range, subnet mask, wildcard mask, and IP class. Includes a common subnet cheatsheet.",
      seoBlockHeading: "Understanding CIDR notation",
      seoBlockText: "CIDR (Classless Inter-Domain Routing) notation combines an IP address with a prefix length (e.g., 192.168.1.0/24). The prefix length indicates how many bits of the address identify the network, with the remaining bits available for host addresses.",
      seoFeatures: [
        "Network and broadcast address calculation",
        "First and last usable host",
        "Total usable hosts count",
        "Subnet mask and wildcard mask",
        "IP class detection (A/B/C/D/E)",
        "Private vs public address identification",
        "Binary representation",
        "Common subnet cheatsheet",
      ],
    },
    es: {
      title: "Calculadora de Subredes",
      description: "Calcula direcci\u00f3n de red, broadcast, rango de hosts, m\u00e1scara y wildcard desde cualquier CIDR. Planificador IPv4 gratuito en tu navegador.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Introduce una direcci\u00f3n IP y la longitud del prefijo CIDR para calcular instant\u00e1neamente los detalles de red, incluyendo direcci\u00f3n de red, direcci\u00f3n de broadcast, rango de hosts, m\u00e1scara de subred, m\u00e1scara wildcard y clase IP. Incluye una tabla de referencia de subredes comunes.",
      seoBlockHeading: "Entendiendo la notaci\u00f3n CIDR",
      seoBlockText: "La notaci\u00f3n CIDR (Classless Inter-Domain Routing) combina una direcci\u00f3n IP con una longitud de prefijo (p. ej., 192.168.1.0/24). La longitud del prefijo indica cu\u00e1ntos bits de la direcci\u00f3n identifican la red, y los bits restantes est\u00e1n disponibles para direcciones de host.",
      seoFeatures: [
        "C\u00e1lculo de direcci\u00f3n de red y broadcast",
        "Primer y \u00faltimo host utilizable",
        "Recuento total de hosts utilizables",
        "M\u00e1scara de subred y m\u00e1scara wildcard",
        "Detecci\u00f3n de clase IP (A/B/C/D/E)",
        "Identificaci\u00f3n de direcci\u00f3n privada vs p\u00fablica",
        "Representaci\u00f3n binaria",
        "Tabla de referencia de subredes comunes",
      ],
    },
  },

  "ip-converter": {
    en: {
      title: "IP Address Converter",
      description: "Convert IPv4 addresses between decimal, binary, hexadecimal, octal, and integer formats. Free and instant — runs 100% in your browser.",
      seoHeading: "About this tool",
      seoText: "Convert any IPv4 address between decimal dotted notation, binary, hexadecimal, integer, and octal formats. Auto-detects the input format and shows all conversions instantly. Also displays the IPv4-mapped IPv6 representation.",
      seoBlockHeading: "IP address formats explained",
      seoBlockText: "IPv4 addresses can be represented in multiple formats. Decimal dotted (192.168.1.1) is the most common. Binary shows the actual bits. Hexadecimal is used in some network configurations. Integer format is a single 32-bit number. Octal was historically used in some Unix systems.",
      seoFeatures: [
        "Auto-detect input format",
        "Decimal dotted notation",
        "Binary representation",
        "Hexadecimal (dotted and flat)",
        "32-bit integer format",
        "Octal representation",
        "IPv4-mapped IPv6 display",
        "Copy individual values",
      ],
    },
    es: {
      title: "Conversor de Direcciones IP",
      description: "Convierte direcciones IPv4 entre formatos decimal, binario, hexadecimal, octal y entero. Conversor gratuito — 100% en tu navegador.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Convierte cualquier direcci\u00f3n IPv4 entre notaci\u00f3n decimal con puntos, binario, hexadecimal, entero y octal. Detecta autom\u00e1ticamente el formato de entrada y muestra todas las conversiones instant\u00e1neamente. Tambi\u00e9n muestra la representaci\u00f3n IPv4-mapped IPv6.",
      seoBlockHeading: "Formatos de direcci\u00f3n IP explicados",
      seoBlockText: "Las direcciones IPv4 pueden representarse en m\u00faltiples formatos. Decimal con puntos (192.168.1.1) es el m\u00e1s com\u00fan. Binario muestra los bits reales. Hexadecimal se usa en algunas configuraciones de red. El formato entero es un \u00fanico n\u00famero de 32 bits. Octal se usaba hist\u00f3ricamente en algunos sistemas Unix.",
      seoFeatures: [
        "Detecci\u00f3n autom\u00e1tica del formato de entrada",
        "Notaci\u00f3n decimal con puntos",
        "Representaci\u00f3n binaria",
        "Hexadecimal (con puntos y plano)",
        "Formato entero de 32 bits",
        "Representaci\u00f3n octal",
        "Visualizaci\u00f3n de IPv4-mapped IPv6",
        "Copiar valores individuales",
      ],
    },
  },

  "password-strength": {
    en: {
      title: "Password Strength Checker",
      description: "Analyze password entropy, crack time estimation, and strength rating. 100% client-side, your password never leaves your browser.",
      seoHeading: "About this tool",
      seoText: "Check how strong your password is with entropy analysis, crack time estimation at different attack speeds, composition breakdown, and common password detection. Your password is never sent anywhere \u2014 all analysis happens in your browser.",
      seoBlockHeading: "How password strength is measured",
      seoBlockText: "Password strength is primarily determined by entropy \u2014 the number of bits of randomness. Higher entropy means more possible combinations an attacker must try. Entropy depends on password length and the character set used (lowercase, uppercase, digits, special characters).",
      seoFeatures: [
        "Entropy calculation in bits",
        "Crack time for different attack speeds",
        "Common password detection (top 100)",
        "Repeated and sequential character checks",
        "Character composition breakdown",
        "Strong password generator",
        "Privacy-first: nothing leaves your browser",
      ],
    },
    es: {
      title: "Comprobador de Fortaleza de Contrase\u00f1as",
      description: "Analiza entrop\u00eda de contrase\u00f1as, tiempo de descifrado y fortaleza. 100% en el cliente — tu contrase\u00f1a nunca sale de tu navegador.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Comprueba la fortaleza de tu contrase\u00f1a con an\u00e1lisis de entrop\u00eda, estimaci\u00f3n de tiempo de descifrado a diferentes velocidades de ataque, desglose de composici\u00f3n y detecci\u00f3n de contrase\u00f1as comunes. Tu contrase\u00f1a nunca se env\u00eda a ning\u00fan sitio \u2014 todo el an\u00e1lisis ocurre en tu navegador.",
      seoBlockHeading: "C\u00f3mo se mide la fortaleza de una contrase\u00f1a",
      seoBlockText: "La fortaleza de una contrase\u00f1a se determina principalmente por la entrop\u00eda \u2014 el n\u00famero de bits de aleatoriedad. Mayor entrop\u00eda significa m\u00e1s combinaciones posibles que un atacante debe probar. La entrop\u00eda depende de la longitud de la contrase\u00f1a y del conjunto de caracteres utilizado (min\u00fasculas, may\u00fasculas, d\u00edgitos, caracteres especiales).",
      seoFeatures: [
        "C\u00e1lculo de entrop\u00eda en bits",
        "Tiempo de descifrado para diferentes velocidades de ataque",
        "Detecci\u00f3n de contrase\u00f1as comunes (top 100)",
        "Comprobaci\u00f3n de caracteres repetidos y secuenciales",
        "Desglose de composici\u00f3n de caracteres",
        "Generador de contrase\u00f1as fuertes",
        "Privacidad ante todo: nada sale de tu navegador",
      ],
    },
  },

  "jwt-decoder": {
    en: {
      title: "JWT Decoder",
      description: "Decode and inspect JSON Web Tokens \u2014 header, payload, and signature. 100% client-side, your token never leaves your browser.",
      seoHeading: "About this tool",
      seoText: "Paste a JWT token to instantly decode and inspect its header, payload, and signature. Timestamps (exp, iat, nbf) are converted to human-readable dates. Expired tokens are flagged. Your token is never sent anywhere.",
      seoBlockHeading: "Understanding JSON Web Tokens",
      seoBlockText: "A JWT consists of three Base64URL-encoded parts separated by dots: header (algorithm and type), payload (claims like subject, expiration, and custom data), and signature (cryptographic verification). JWTs are widely used for authentication and API authorization.",
      seoFeatures: [
        "Header decoding (algorithm, type)",
        "Payload inspection with formatted JSON",
        "Human-readable timestamps",
        "Expiration detection",
        "Color-coded sections (header, payload, signature)",
        "Copy individual sections",
        "Example token for testing",
        "Privacy-first: nothing leaves your browser",
      ],
    },
    es: {
      title: "Decodificador JWT",
      description: "Decodifica e inspecciona JSON Web Tokens \u2014 cabecera, payload y firma. 100% en el cliente, tu token nunca sale de tu navegador.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Pega un token JWT para decodificarlo e inspeccionar instant\u00e1neamente su cabecera, payload y firma. Las marcas de tiempo (exp, iat, nbf) se convierten a fechas legibles. Los tokens expirados se\u00f1alizan. Tu token nunca se env\u00eda a ning\u00fan sitio.",
      seoBlockHeading: "Entendiendo los JSON Web Tokens",
      seoBlockText: "Un JWT consiste en tres partes codificadas en Base64URL separadas por puntos: cabecera (algoritmo y tipo), payload (claims como sujeto, expiraci\u00f3n y datos personalizados) y firma (verificaci\u00f3n criptogr\u00e1fica). Los JWT se usan ampliamente para autenticaci\u00f3n y autorizaci\u00f3n de APIs.",
      seoFeatures: [
        "Decodificaci\u00f3n de la cabecera (algoritmo, tipo)",
        "Inspecci\u00f3n del payload con JSON formateado",
        "Marcas de tiempo legibles",
        "Detecci\u00f3n de expiraci\u00f3n",
        "Secciones con c\u00f3digo de colores (cabecera, payload, firma)",
        "Copiar secciones individuales",
        "Token de ejemplo para pruebas",
        "Privacidad ante todo: nada sale de tu navegador",
      ],
    },
  },
  "email-auth": {
    en: {
      title: "Email Auth Checker - SPF, DKIM & DMARC",
      description: "Check SPF, DKIM, and DMARC records for any domain. Verify email authentication, troubleshoot deliverability, and audit your domain's email security.",
      seoHeading: "About this tool",
      seoText: "Enter a domain to check its email authentication records. SPF, DKIM, and DMARC work together to prevent email spoofing and phishing. This tool queries DNS to verify all three are properly configured.",
      seoBlockHeading: "Why email authentication matters",
      seoBlockText: "Email authentication (SPF, DKIM, DMARC) prevents attackers from sending forged emails on behalf of your domain. Without these records, your domain is vulnerable to phishing and spoofing attacks, and your legitimate emails are more likely to land in spam folders.",
      seoFeatures: [
        "SPF record detection and validation",
        "DMARC policy analysis (none, quarantine, reject)",
        "DKIM selector discovery (9 common selectors)",
        "Color-coded pass/warning/fail assessment",
        "Full record text display",
        "Powered by Cloudflare DNS-over-HTTPS",
      ],
    },
    es: {
      title: "Verificador de Email Auth - SPF, DKIM y DMARC",
      description: "Verifica registros SPF, DKIM y DMARC de cualquier dominio. Comprueba la configuracion de autenticacion de email. Gratis, instantaneo.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Introduce un dominio para verificar sus registros de autenticacion de email. SPF, DKIM y DMARC trabajan juntos para prevenir la suplantacion de identidad en el email. Esta herramienta consulta DNS para verificar que los tres estan correctamente configurados.",
      seoBlockHeading: "Por que importa la autenticacion de email",
      seoBlockText: "La autenticacion de email (SPF, DKIM, DMARC) previene que atacantes envien emails falsificados en nombre de tu dominio. Sin estos registros, tu dominio es vulnerable a ataques de phishing y suplantacion, y tus emails legitimos tienen mas probabilidades de caer en la carpeta de spam.",
      seoFeatures: [
        "Deteccion y validacion de registro SPF",
        "Analisis de politica DMARC (none, quarantine, reject)",
        "Descubrimiento de selectores DKIM (9 selectores comunes)",
        "Evaluacion con codigo de colores (correcto/advertencia/fallo)",
        "Texto completo del registro",
        "Potenciado por Cloudflare DNS-over-HTTPS",
      ],
    },
  },
  "port-scan": {
    en: {
      title: "Port Scanner Online Free",
      description: "Scan common ports on any host: HTTP, HTTPS, SSH, FTP, SMTP, databases and more. Check which services are reachable from the public internet.",
      seoHeading: "About this tool",
      seoText: "Enter a domain or hostname to scan common service ports. The tool attempts HTTP/HTTPS connections to each port and reports whether it is open, closed, or filtered. You can also specify custom ports.",
      seoBlockHeading: "How port scanning works",
      seoBlockText: "Port scanning probes a host to discover which network services are running. Open ports accept connections, closed ports actively refuse them, and filtered ports give no response (typically blocked by a firewall). This tool uses HTTP-based probes from a Cloudflare edge server.",
      seoFeatures: [
        "17 common ports scanned by default",
        "Custom port selection (up to 20 ports)",
        "Open / closed / filtered status detection",
        "Well-known service identification (HTTP, SSH, FTP, MySQL, etc.)",
        "Color-coded results table",
        "Powered by Cloudflare Workers",
      ],
    },
    es: {
      title: "Escaner de Puertos Online Gratis",
      description: "Escanea puertos comunes de cualquier host. Comprueba que servicios son accesibles -- HTTP, HTTPS, SSH, FTP y mas. Gratis, instantaneo.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Introduce un dominio o nombre de host para escanear puertos de servicio comunes. La herramienta intenta conexiones HTTP/HTTPS a cada puerto y reporta si esta abierto, cerrado o filtrado. Tambien puedes especificar puertos personalizados.",
      seoBlockHeading: "Como funciona el escaneo de puertos",
      seoBlockText: "El escaneo de puertos sondea un host para descubrir que servicios de red estan activos. Los puertos abiertos aceptan conexiones, los cerrados las rechazan activamente y los filtrados no dan respuesta (normalmente bloqueados por un firewall). Esta herramienta usa sondas HTTP desde un servidor edge de Cloudflare.",
      seoFeatures: [
        "17 puertos comunes escaneados por defecto",
        "Seleccion de puertos personalizados (hasta 20 puertos)",
        "Deteccion de estado abierto / cerrado / filtrado",
        "Identificacion de servicios conocidos (HTTP, SSH, FTP, MySQL, etc.)",
        "Tabla de resultados con codigo de colores",
        "Potenciado por Cloudflare Workers",
      ],
    },
  },
  "dns-lookup": {
    en: { title: "DNS Lookup Online Free", description: "Query DNS records for any domain. A, AAAA, MX, CNAME, TXT, NS, SOA. Uses Cloudflare DNS. Free, instant.", seoHeading: "About this tool", seoText: "Enter a domain to query DNS records using Cloudflare's DNS-over-HTTPS. See A, AAAA, MX, CNAME, TXT, NS, and SOA records with TTL values.", seoBlockHeading: "How DNS lookup works", seoBlockText: "DNS translates domain names to IP addresses. This tool queries Cloudflare's public DNS resolver (1.1.1.1) via DNS-over-HTTPS for fast, private results.", seoFeatures: ["A, AAAA, MX, CNAME, TXT, NS, SOA records", "TTL display", "Powered by Cloudflare DNS-over-HTTPS", "No server needed \u2014 queries from your browser", "Fast and private"] },
    es: { title: "B\u00fasqueda DNS Online Gratis", description: "Consulta registros DNS de cualquier dominio. A, AAAA, MX, CNAME, TXT, NS, SOA. Usa Cloudflare DNS. Gratis, instant\u00e1neo.", seoHeading: "Sobre esta herramienta", seoText: "Introduce un dominio para consultar registros DNS usando DNS-over-HTTPS de Cloudflare. Ve registros A, AAAA, MX, CNAME, TXT, NS y SOA con valores TTL.", seoBlockHeading: "C\u00f3mo funciona la b\u00fasqueda DNS", seoBlockText: "DNS traduce nombres de dominio a direcciones IP. Esta herramienta consulta el resolver DNS p\u00fablico de Cloudflare (1.1.1.1) via DNS-over-HTTPS para resultados r\u00e1pidos y privados.", seoFeatures: ["Registros A, AAAA, MX, CNAME, TXT, NS, SOA", "Visualizaci\u00f3n de TTL", "Potenciado por Cloudflare DNS-over-HTTPS", "Sin servidor \u2014 consultas desde tu navegador", "R\u00e1pido y privado"] },
  },
  "ssl-checker": {
    en: { title: "SSL Certificate Checker Online Free", description: "Check SSL/TLS status, HSTS headers, and certificate details for any domain. Free, instant.", seoHeading: "About this tool", seoText: "Enter a domain to check its SSL/TLS certificate status. See HTTPS connectivity, HSTS configuration, server info, and certificate transparency logs.", seoBlockHeading: "Why check SSL certificates?", seoBlockText: "SSL/TLS certificates encrypt traffic between browsers and servers. An expired or misconfigured certificate can cause security warnings and lost trust.", seoFeatures: ["HTTPS connectivity check", "HSTS header detection", "Certificate transparency logs", "Response time measurement", "Server identification"] },
    es: { title: "Verificador de Certificado SSL Online Gratis", description: "Verifica el estado SSL/TLS, cabeceras HSTS y detalles del certificado de cualquier dominio. Gratis, instant\u00e1neo.", seoHeading: "Sobre esta herramienta", seoText: "Introduce un dominio para verificar el estado de su certificado SSL/TLS. Ve conectividad HTTPS, configuraci\u00f3n HSTS, info del servidor y logs de transparencia de certificados.", seoBlockHeading: "\u00bfPor qu\u00e9 verificar certificados SSL?", seoBlockText: "Los certificados SSL/TLS cifran el tr\u00e1fico entre navegadores y servidores. Un certificado expirado o mal configurado puede causar advertencias de seguridad y p\u00e9rdida de confianza.", seoFeatures: ["Verificaci\u00f3n de conectividad HTTPS", "Detecci\u00f3n de cabecera HSTS", "Logs de transparencia de certificados", "Medici\u00f3n de tiempo de respuesta", "Identificaci\u00f3n del servidor"] },
  },
  "is-it-down": {
    en: { title: "Is It Down? Website Down Checker", description: "Check if a website is down for everyone or just you. Instant status check. Free.", seoHeading: "About this tool", seoText: "Enter a URL to check if a website is currently reachable. Get instant feedback on whether the site is up or down, with response time and status code.", seoBlockHeading: "How does this work?", seoBlockText: "We send a request to the website from our server and report whether it responds. If it responds with a status code below 500, it's considered up.", seoFeatures: ["Instant up/down check", "Response time measurement", "HTTP status code display", "Works for any public URL"] },
    es: { title: "\u00bfEst\u00e1 Ca\u00edda? Verificador de Sitios Web", description: "Comprueba si un sitio web est\u00e1 ca\u00eddo para todos o solo para ti. Verificaci\u00f3n instant\u00e1nea. Gratis.", seoHeading: "Sobre esta herramienta", seoText: "Introduce una URL para comprobar si un sitio web est\u00e1 actualmente accesible. Obt\u00e9n respuesta instant\u00e1nea sobre si el sitio funciona o est\u00e1 ca\u00eddo, con tiempo de respuesta y c\u00f3digo de estado.", seoBlockHeading: "\u00bfC\u00f3mo funciona?", seoBlockText: "Enviamos una solicitud al sitio web desde nuestro servidor y reportamos si responde. Si responde con un c\u00f3digo de estado inferior a 500, se considera activo.", seoFeatures: ["Verificaci\u00f3n instant\u00e1nea activo/ca\u00eddo", "Medici\u00f3n de tiempo de respuesta", "C\u00f3digo de estado HTTP", "Funciona para cualquier URL p\u00fablica"] },
  },
  "is-it-up": {
    en: { title: "Website Status Checker \u2014 Uptime & Response Time", description: "Check website status, response time, server info. Detailed uptime report. Free.", seoHeading: "About this tool", seoText: "Enter a URL to get a detailed status report including response time, HTTP status, server software, and content type. Ideal for monitoring website health.", seoBlockHeading: "Understanding website status", seoBlockText: "Website status checking involves sending HTTP requests and analyzing the response. Response time under 300ms is fast, under 1 second is moderate, over that is slow.", seoFeatures: ["Response time with rating (fast/moderate/slow)", "HTTP status code and text", "Server software detection", "Content-Type header", "Detailed status report"] },
    es: { title: "Verificador de Estado Web \u2014 Uptime y Tiempo de Respuesta", description: "Verifica estado del sitio web, tiempo de respuesta, info del servidor. Informe detallado. Gratis.", seoHeading: "Sobre esta herramienta", seoText: "Introduce una URL para obtener un informe detallado de estado incluyendo tiempo de respuesta, estado HTTP, software del servidor y tipo de contenido.", seoBlockHeading: "Entendiendo el estado de un sitio web", seoBlockText: "La verificaci\u00f3n de estado implica enviar solicitudes HTTP y analizar la respuesta. Un tiempo de respuesta inferior a 300ms es r\u00e1pido, inferior a 1s es moderado, superior es lento.", seoFeatures: ["Tiempo de respuesta con calificaci\u00f3n (r\u00e1pido/moderado/lento)", "C\u00f3digo de estado HTTP", "Detecci\u00f3n de software del servidor", "Cabecera Content-Type", "Informe de estado detallado"] },
  },
  "http-headers": {
    en: { title: "HTTP Header Checker Online Free", description: "Inspect HTTP response headers and check security headers for any URL. Free, instant.", seoHeading: "About this tool", seoText: "Enter a URL to inspect all HTTP response headers. Get a security score based on HSTS, CSP, X-Frame-Options, and other security headers.", seoBlockHeading: "Why check HTTP headers?", seoBlockText: "HTTP headers control caching, security, content type, and more. Security headers like CSP and HSTS protect against XSS, clickjacking, and downgrade attacks.", seoFeatures: ["All response headers displayed", "Security header analysis with score", "HSTS, CSP, X-Frame-Options check", "Referrer-Policy, Permissions-Policy check", "Copy individual header values"] },
    es: { title: "Verificador de Cabeceras HTTP Online Gratis", description: "Inspecciona cabeceras HTTP de respuesta y verifica cabeceras de seguridad de cualquier URL. Gratis, instant\u00e1neo.", seoHeading: "Sobre esta herramienta", seoText: "Introduce una URL para inspeccionar todas las cabeceras HTTP de respuesta. Obt\u00e9n una puntuaci\u00f3n de seguridad basada en HSTS, CSP, X-Frame-Options y otras cabeceras de seguridad.", seoBlockHeading: "\u00bfPor qu\u00e9 verificar cabeceras HTTP?", seoBlockText: "Las cabeceras HTTP controlan cach\u00e9, seguridad, tipo de contenido y m\u00e1s. Las cabeceras de seguridad como CSP y HSTS protegen contra XSS, clickjacking y ataques de downgrade.", seoFeatures: ["Todas las cabeceras de respuesta mostradas", "An\u00e1lisis de cabeceras de seguridad con puntuaci\u00f3n", "Verificaci\u00f3n de HSTS, CSP, X-Frame-Options", "Verificaci\u00f3n de Referrer-Policy, Permissions-Policy", "Copiar valores individuales de cabeceras"] },
  },
  "whois-lookup": {
    en: { title: "WHOIS Lookup Online Free", description: "Look up domain registration details, registrar, nameservers, and expiration dates. Free WHOIS via RDAP.", seoHeading: "About this tool", seoText: "Enter a domain to look up registration details via RDAP. See registrar, creation/expiration dates, nameservers, and domain statuses.", seoBlockHeading: "How WHOIS/RDAP works", seoBlockText: "RDAP (Registration Data Access Protocol) is the modern replacement for WHOIS. It provides domain registration data in a structured JSON format.", seoFeatures: ["Registrar identification", "Created, updated, expiration dates", "Nameserver listing", "Domain status codes", "Powered by RDAP"] },
    es: { title: "B\u00fasqueda WHOIS Online Gratis", description: "Consulta detalles de registro de dominio, registrador, nameservers y fechas de expiraci\u00f3n. WHOIS gratuito v\u00eda RDAP.", seoHeading: "Sobre esta herramienta", seoText: "Introduce un dominio para consultar detalles de registro v\u00eda RDAP. Ve registrador, fechas de creaci\u00f3n/expiraci\u00f3n, nameservers y estados del dominio.", seoBlockHeading: "C\u00f3mo funciona WHOIS/RDAP", seoBlockText: "RDAP (Registration Data Access Protocol) es el reemplazo moderno de WHOIS. Proporciona datos de registro de dominio en formato JSON estructurado.", seoFeatures: ["Identificaci\u00f3n del registrador", "Fechas de creaci\u00f3n, actualizaci\u00f3n y expiraci\u00f3n", "Listado de nameservers", "C\u00f3digos de estado del dominio", "Potenciado por RDAP"] },
  },
  "redirect-checker": {
    en: { title: "Redirect Checker Online Free", description: "Trace the full redirect chain of any URL. See every 301, 302 redirect with status codes. Free.", seoHeading: "About this tool", seoText: "Enter a URL to trace its complete redirect chain. See every hop with status codes, target URLs, and the final destination. Useful for debugging SEO redirects.", seoBlockHeading: "Understanding URL redirects", seoBlockText: "HTTP redirects (301, 302, 307, 308) tell browsers to request a different URL. Redirect chains can impact SEO and page load time.", seoFeatures: ["Full redirect chain visualization", "Status codes for each hop", "Final destination URL", "Supports 301, 302, 307, 308 redirects", "Up to 10 redirect hops"] },
    es: { title: "Verificador de Redirecciones Online Gratis", description: "Traza la cadena completa de redirecciones de cualquier URL. Ve cada 301, 302 con c\u00f3digos de estado. Gratis.", seoHeading: "Sobre esta herramienta", seoText: "Introduce una URL para trazar su cadena completa de redirecciones. Ve cada salto con c\u00f3digos de estado, URLs destino y el destino final. \u00datil para depurar redirecciones SEO.", seoBlockHeading: "Entendiendo las redirecciones URL", seoBlockText: "Las redirecciones HTTP (301, 302, 307, 308) indican al navegador que solicite una URL diferente. Las cadenas de redirecci\u00f3n pueden impactar el SEO y el tiempo de carga.", seoFeatures: ["Visualizaci\u00f3n completa de cadena de redirecciones", "C\u00f3digos de estado para cada salto", "URL de destino final", "Soporta redirecciones 301, 302, 307, 308", "Hasta 10 saltos de redirecci\u00f3n"] },
  },
  "dnssec-check": {
    en: { title: "DNSSEC Validator Online Free", description: "Validate DNSSEC signing, DS chain of trust, and resolver validation for any domain. Free, instant.", seoHeading: "About this tool", seoText: "Enter a domain to check DNSSEC. The tool fetches DNSKEY records at the zone, DS records at the parent, and asks Cloudflare 1.1.1.1 whether the chain validates (AD flag). Detects the three states that actually matter in production: Secure, Bogus (broken signing), and Insecure.", seoBlockHeading: "Why DNSSEC matters", seoBlockText: "DNSSEC cryptographically signs DNS records so resolvers can detect tampering and cache poisoning. The critical failure mode is not missing DNSSEC \u2014 it is broken DNSSEC (Bogus), which takes your domain offline for every user whose resolver validates. This tool surfaces that state explicitly instead of just showing DNSKEY presence.", seoFeatures: ["DNSKEY records at the apex", "DS records at the parent zone", "Resolver validation (AD flag)", "Bogus (broken signing) detection", "Algorithm names for DS/DNSKEY entries"] },
    es: { title: "Validador DNSSEC Online Gratis", description: "Valida la firma DNSSEC, la cadena de confianza DS y la validaci\u00f3n del resolver para cualquier dominio. Gratis, instant\u00e1neo.", seoHeading: "Sobre esta herramienta", seoText: "Introduce un dominio para comprobar DNSSEC. La herramienta consulta los registros DNSKEY de la zona, los DS en el padre y pregunta a Cloudflare 1.1.1.1 si la cadena valida (flag AD). Detecta los tres estados que realmente importan en producci\u00f3n: Seguro, Roto (firma inv\u00e1lida) e Inseguro.", seoBlockHeading: "Por qu\u00e9 importa DNSSEC", seoBlockText: "DNSSEC firma criptogr\u00e1ficamente los registros DNS para que los resolvers detecten manipulaciones y envenenamiento de cach\u00e9. El fallo cr\u00edtico no es la falta de DNSSEC \u2014 es DNSSEC roto (Bogus), que tira tu dominio para cada usuario con resolver validador. Esta herramienta muestra ese estado expl\u00edcitamente en vez de limitarse a detectar DNSKEY.", seoFeatures: ["Registros DNSKEY del apex", "Registros DS en la zona padre", "Validaci\u00f3n del resolver (flag AD)", "Detecci\u00f3n de Bogus (firma rota)", "Nombres de algoritmo para DS/DNSKEY"] },
  },
  "ipv6-check": {
    en: { title: "IPv6 Readiness Checker Online Free", description: "Check if a domain is IPv6-ready. Tests AAAA records for apex, www, nameservers, and mail. Free, instant.", seoHeading: "About this tool", seoText: "Enter a domain to audit its IPv6 readiness. The tool checks AAAA records for the apex and www hosts, verifies that nameservers and mail servers are reachable over IPv6, and produces a 0\u20134 score so you can see at a glance where the gaps are.", seoBlockHeading: "Why IPv6 readiness matters", seoBlockText: "Mobile networks, datacentres, and many enterprise ISPs are IPv6-only or IPv6-first. If your nameservers or mail servers lack AAAA records, those users depend on NAT64 or DNS64 which is slower and can silently break mail delivery and DNS lookups. IPv6 parity is about reach and performance, not ideology.", seoFeatures: ["Apex and www AAAA check", "Nameserver AAAA coverage", "Mail server AAAA coverage", "0\u20134 readiness score", "Powered by Cloudflare DNS-over-HTTPS"] },
    es: { title: "Verificador de IPv6 Online Gratis", description: "Comprueba si un dominio est\u00e1 listo para IPv6. Analiza AAAA del apex, www, nameservers y correo. Gratis, instant\u00e1neo.", seoHeading: "Sobre esta herramienta", seoText: "Introduce un dominio para auditar su preparaci\u00f3n para IPv6. La herramienta comprueba los registros AAAA del apex y de www, verifica que los nameservers y servidores de correo son accesibles por IPv6, y devuelve una puntuaci\u00f3n de 0 a 4 para ver de un vistazo d\u00f3nde hay huecos.", seoBlockHeading: "Por qu\u00e9 importa la preparaci\u00f3n para IPv6", seoBlockText: "Las redes m\u00f3viles, los centros de datos y muchos ISPs empresariales son IPv6-only o IPv6-first. Si tus nameservers o servidores de correo no tienen AAAA, esos usuarios dependen de NAT64 o DNS64, que es m\u00e1s lento y puede romper silenciosamente el correo y las b\u00fasquedas DNS. La paridad IPv6 es cuesti\u00f3n de alcance y rendimiento, no de ideolog\u00eda.", seoFeatures: ["Comprobaci\u00f3n AAAA de apex y www", "Cobertura AAAA de nameservers", "Cobertura AAAA de servidores de correo", "Puntuaci\u00f3n de preparaci\u00f3n 0\u20134", "Potenciado por Cloudflare DNS-over-HTTPS"] },
  },
  "caa-lookup": {
    en: { title: "CAA Record Checker Online Free", description: "Check CAA records for any domain. See which Certificate Authorities can issue SSL certificates. Free, instant.", seoHeading: "About this tool", seoText: "Enter a domain to check its CAA (Certification Authority Authorization) records. CAA restricts which CAs can issue certificates for your domain, blocking rogue issuance. The tool walks up the DNS tree to show inherited policies and flags the critical bit when set.", seoBlockHeading: "Why CAA records matter", seoBlockText: "CAA records tell Certificate Authorities whether they are allowed to issue certificates for your domain. Without them, any trusted CA can issue certificates for your domain, even to attackers. Setting a CAA policy is a simple, powerful mitigation against misissuance.", seoFeatures: ["CAA record retrieval and parsing", "Walks up DNS tree for inherited policies", "Supports issue, issuewild, iodef, contactemail, contactphone", "Flags the critical bit (128)", "Powered by Cloudflare DNS-over-HTTPS"] },
    es: { title: "Verificador de Registros CAA Online Gratis", description: "Comprueba los registros CAA de cualquier dominio. Ve qu\u00e9 CAs pueden emitir certificados SSL. Gratis, instant\u00e1neo.", seoHeading: "Sobre esta herramienta", seoText: "Introduce un dominio para comprobar sus registros CAA (Certification Authority Authorization). CAA restringe qu\u00e9 CAs pueden emitir certificados para tu dominio, bloqueando emisiones no autorizadas. La herramienta recorre el \u00e1rbol DNS para mostrar pol\u00edticas heredadas y marca el bit cr\u00edtico cuando est\u00e1 activo.", seoBlockHeading: "Por qu\u00e9 importan los registros CAA", seoBlockText: "Los registros CAA indican a las Autoridades Certificadoras si est\u00e1n autorizadas a emitir certificados para tu dominio. Sin ellos, cualquier CA de confianza puede emitir certificados para tu dominio, incluso a atacantes. Configurar una pol\u00edtica CAA es una mitigaci\u00f3n simple y potente contra la emisi\u00f3n indebida.", seoFeatures: ["Recuperaci\u00f3n y parseo de registros CAA", "Recorre el \u00e1rbol DNS buscando pol\u00edticas heredadas", "Soporta issue, issuewild, iodef, contactemail, contactphone", "Marca el bit cr\u00edtico (128)", "Potenciado por Cloudflare DNS-over-HTTPS"] },
  },
  "url-parser": {
    en: { title: "URL Parser Online Free", description: "Parse and break down any URL into its components: protocol, host, path, query parameters, hash. Free.", seoHeading: "About this tool", seoText: "Paste any URL to instantly see its components: protocol, hostname, port, pathname, query string parameters, and hash fragment.", seoBlockHeading: "URL anatomy", seoBlockText: "A URL consists of protocol, host, port, path, query string, and fragment. Understanding URL structure is essential for web development and debugging.", seoFeatures: ["Protocol, host, port detection", "Path breakdown", "Query parameter extraction", "Hash fragment display", "Copy individual components"] },
    es: { title: "Analizador de URL Online Gratis", description: "Analiza y descompone cualquier URL en sus componentes: protocolo, host, ruta, par\u00e1metros, hash. Gratis.", seoHeading: "Sobre esta herramienta", seoText: "Pega cualquier URL para ver instant\u00e1neamente sus componentes: protocolo, hostname, puerto, ruta, par\u00e1metros de consulta y fragmento hash.", seoBlockHeading: "Anatom\u00eda de una URL", seoBlockText: "Una URL consiste en protocolo, host, puerto, ruta, cadena de consulta y fragmento. Entender la estructura de URLs es esencial para desarrollo web y depuraci\u00f3n.", seoFeatures: ["Detecci\u00f3n de protocolo, host, puerto", "Desglose de ruta", "Extracci\u00f3n de par\u00e1metros de consulta", "Visualizaci\u00f3n de fragmento hash", "Copiar componentes individuales"] },
  },
};


// ─── Tool names (for Sidebar and Landing) ───────────────────────────────────

export const toolNamesI18n: Record<string, Record<Lang, string>> = {
  "my-ip": { en: "What Is My IP", es: "Cu\u00e1l Es Mi IP" },
  "privacy-check": { en: "Browser Privacy Check", es: "Privacidad del Navegador" },
  "webrtc-leak-test": { en: "WebRTC Leak Test", es: "Test de Fugas WebRTC" },
  "subnet-calculator": { en: "Subnet Calculator", es: "Calculadora de Subredes" },
  "ip-converter": { en: "IP Address Converter", es: "Conversor de IP" },
  "password-strength": { en: "Password Strength Checker", es: "Fortaleza de Contrase\u00f1as" },
  "jwt-decoder": { en: "JWT Decoder", es: "Decodificador JWT" },
  "email-auth": { en: "Email Auth", es: "Auth de Email" },
  "port-scan": { en: "Port Scanner", es: "Escaner de Puertos" },
  "dns-lookup": { en: "DNS Lookup", es: "B\u00fasqueda DNS" },
  "ssl-checker": { en: "SSL Checker", es: "Verificador SSL" },
  "is-it-down": { en: "Is It Down?", es: "\u00bfEst\u00e1 Ca\u00edda?" },
  "is-it-up": { en: "Website Status", es: "Estado del Sitio" },
  "http-headers": { en: "HTTP Headers", es: "Cabeceras HTTP" },
  "whois-lookup": { en: "WHOIS Lookup", es: "B\u00fasqueda WHOIS" },
  "redirect-checker": { en: "Redirect Checker", es: "Verificador de Redirecciones" },
  "caa-lookup": { en: "CAA Checker", es: "Verificador CAA" },
  "ipv6-check": { en: "IPv6 Readiness", es: "Preparaci\u00f3n IPv6" },
  "dnssec-check": { en: "DNSSEC Check", es: "Verificador DNSSEC" },
  "url-parser": { en: "URL Parser", es: "Analizador de URL" },
};

export const toolDescriptionsI18n: Record<string, Record<Lang, string>> = {
  "my-ip": {
    en: "See your public IP address, location, ISP, and network details",
    es: "Consulta tu direcci\u00f3n IP p\u00fablica, ubicaci\u00f3n, ISP y detalles de red",
  },
  "privacy-check": {
    en: "Check your browser's privacy settings, tracking protection, and fingerprint exposure",
    es: "Comprueba la configuraci\u00f3n de privacidad, protecci\u00f3n contra rastreo y exposici\u00f3n de huella digital",
  },
  "webrtc-leak-test": {
    en: "Check if WebRTC is leaking your real IP address",
    es: "Comprueba si WebRTC est\u00e1 filtrando tu direcci\u00f3n IP real",
  },
  "subnet-calculator": {
    en: "Calculate network address, broadcast, host range from CIDR notation",
    es: "Calcula direcci\u00f3n de red, broadcast y rango de hosts a partir de notaci\u00f3n CIDR",
  },
  "ip-converter": {
    en: "Convert IP addresses between decimal, binary, hexadecimal, and octal",
    es: "Convierte direcciones IP entre decimal, binario, hexadecimal y octal",
  },
  "password-strength": {
    en: "Analyze password entropy, crack time estimation, and strength rating",
    es: "Analiza la entrop\u00eda, tiempo de descifrado estimado y clasificaci\u00f3n de fortaleza",
  },
  "jwt-decoder": {
    en: "Decode and inspect JSON Web Tokens \u2014 header, payload, and signature",
    es: "Decodifica e inspecciona JSON Web Tokens \u2014 cabecera, payload y firma",
  },
  "email-auth": { en: "Check SPF, DKIM, and DMARC records for any domain", es: "Verifica registros SPF, DKIM y DMARC de cualquier dominio" },
  "port-scan": { en: "Scan common ports on any host to check which services are reachable", es: "Escanea puertos comunes de cualquier host para comprobar que servicios son accesibles" },
  "dns-lookup": { en: "Query DNS records for any domain \u2014 A, AAAA, MX, CNAME, TXT, NS, SOA", es: "Consulta registros DNS de cualquier dominio \u2014 A, AAAA, MX, CNAME, TXT, NS, SOA" },
  "ssl-checker": { en: "Check SSL/TLS certificate status, HSTS, and certificate transparency logs", es: "Verifica estado de certificado SSL/TLS, HSTS y logs de transparencia" },
  "is-it-down": { en: "Check if a website is down for everyone or just you", es: "Comprueba si un sitio web est\u00e1 ca\u00eddo para todos o solo para ti" },
  "is-it-up": { en: "Check website uptime, response time, and server status", es: "Verifica uptime del sitio web, tiempo de respuesta y estado del servidor" },
  "http-headers": { en: "Inspect HTTP response headers and security header analysis", es: "Inspecciona cabeceras HTTP de respuesta y an\u00e1lisis de seguridad" },
  "whois-lookup": { en: "Look up domain registration details, registrar, and nameservers via RDAP", es: "Consulta detalles de registro de dominio, registrador y nameservers via RDAP" },
  "redirect-checker": { en: "Trace the full redirect chain of any URL with status codes", es: "Traza la cadena completa de redirecciones de cualquier URL con c\u00f3digos de estado" },
  "caa-lookup": { en: "Check which Certificate Authorities can issue SSL certificates for a domain", es: "Comprueba qu\u00e9 Autoridades Certificadoras pueden emitir certificados SSL para un dominio" },
  "ipv6-check": { en: "Check if a domain has IPv6 (AAAA) records for apex, www, nameservers, and mail", es: "Comprueba si un dominio tiene registros IPv6 (AAAA) para apex, www, nameservers y correo" },
  "dnssec-check": { en: "Validate DNSSEC signing, DS chain, and resolver validation for a domain", es: "Valida la firma DNSSEC, la cadena DS y la validaci\u00f3n del resolver para un dominio" },
  "url-parser": { en: "Parse and break down URLs into protocol, host, path, query params, and hash", es: "Analiza y descompone URLs en protocolo, host, ruta, par\u00e1metros y hash" },
};

export const groupLabelsI18n: Record<string, Record<Lang, string>> = {
  Network: { en: "Network", es: "Red" },
  Security: { en: "Security", es: "Seguridad" },
  Calculators: { en: "Calculators", es: "Calculadoras" },
};
