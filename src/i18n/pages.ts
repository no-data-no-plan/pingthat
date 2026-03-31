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
      description: "See your public IP address, location, ISP, and network details. Free, instant, no tracking.",
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
      description: "Consulta tu direcci\u00f3n IP p\u00fablica, ubicaci\u00f3n, ISP y detalles de red. Gratis, instant\u00e1neo, sin rastreo.",
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
      description: "Check your browser's privacy settings, tracking protection, and fingerprint exposure. Free, instant, 100% client-side.",
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
      description: "Comprueba la configuraci\u00f3n de privacidad de tu navegador, protecci\u00f3n contra rastreo y exposici\u00f3n de huella digital. Gratis, instant\u00e1neo, 100% en el cliente.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Esta herramienta comprueba qu\u00e9 informaci\u00f3n expone tu navegador a los sitios web. Analiza Do Not Track, cookies, fugas WebRTC, huella de canvas y audio, vendedor WebGL y detalles de hardware. Todo se ejecuta localmente en tu navegador.",
      seoBlockHeading: "Entendiendo la huella digital del navegador",
      seoBlockText: "Los sitios web pueden identificarte sin cookies combinando caracter\u00edsticas \u00fanicas del navegador en una 'huella digital'. El renderizado del canvas, las cadenas de vendedor WebGL, las fuentes instaladas, la resoluci\u00f3n de pantalla y las especificaciones de hardware contribuyen a un identificador \u00fanico.",
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
      description: "Check if WebRTC is leaking your real IP address. Detect local and public IPs exposed through ICE candidates.",
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
      description: "Calculate network address, broadcast address, host range, and more from CIDR notation. Free online subnet calculator.",
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
      description: "Calcula la direcci\u00f3n de red, direcci\u00f3n de broadcast, rango de hosts y m\u00e1s a partir de la notaci\u00f3n CIDR. Calculadora de subredes online gratuita.",
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
      description: "Convert IP addresses between decimal, binary, hexadecimal, octal, and integer formats. Free online IP converter.",
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
      description: "Convierte direcciones IP entre formatos decimal, binario, hexadecimal, octal y entero. Conversor de IP online gratuito.",
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
      description: "Analiza la entrop\u00eda de contrase\u00f1as, estimaci\u00f3n de tiempo de descifrado y clasificaci\u00f3n de fortaleza. 100% en el cliente, tu contrase\u00f1a nunca sale de tu navegador.",
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
      description: "Decodifica e inspecciona JSON Web Tokens \u2014 header, payload y firma. 100% en el cliente, tu token nunca sale de tu navegador.",
      seoHeading: "Sobre esta herramienta",
      seoText: "Pega un token JWT para decodificarlo e inspeccionar instant\u00e1neamente su header, payload y firma. Las marcas de tiempo (exp, iat, nbf) se convierten a fechas legibles. Los tokens expirados se se\u00f1alizan. Tu token nunca se env\u00eda a ning\u00fan sitio.",
      seoBlockHeading: "Entendiendo los JSON Web Tokens",
      seoBlockText: "Un JWT consiste en tres partes codificadas en Base64URL separadas por puntos: header (algoritmo y tipo), payload (claims como sujeto, expiraci\u00f3n y datos personalizados) y firma (verificaci\u00f3n criptogr\u00e1fica). Los JWT se usan ampliamente para autenticaci\u00f3n y autorizaci\u00f3n de APIs.",
      seoFeatures: [
        "Decodificaci\u00f3n del header (algoritmo, tipo)",
        "Inspecci\u00f3n del payload con JSON formateado",
        "Marcas de tiempo legibles",
        "Detecci\u00f3n de expiraci\u00f3n",
        "Secciones con c\u00f3digo de colores (header, payload, firma)",
        "Copiar secciones individuales",
        "Token de ejemplo para pruebas",
        "Privacidad ante todo: nada sale de tu navegador",
      ],
    },
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
    es: "Decodifica e inspecciona JSON Web Tokens \u2014 header, payload y firma",
  },
};

export const groupLabelsI18n: Record<string, Record<Lang, string>> = {
  Network: { en: "Network", es: "Red" },
  Calculators: { en: "Calculators", es: "Calculadoras" },
};
