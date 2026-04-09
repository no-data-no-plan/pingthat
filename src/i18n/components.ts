import type { Lang } from "./index";

// ─── MyIp ────────────────────────────────────────────────────────────────────

export const myIpI18n = {
  en: {
    detectingIp: "Detecting your IP address...",
    couldNotDetect: "Could not detect your IP address. Check your connection or try again.",
    yourPublicIp: "Your Public IP",
    publicIpTip: "Your public IP is the address websites see when you connect. It's different from your private/local IP used inside your home network.",
    copyIp: "Copy IP",
    copied: "Copied!",
    location: "Location",
    ispOrganization: "ISP / Organization",
    ispTip: "Your Internet Service Provider -- the company that provides your internet connection (e.g. Comcast, Vodafone).",
    timezone: "Timezone",
    asn: "ASN",
    yourConnection: "Your Connection",
    language: "Language",
    status: "Status",
    online: "Online",
    offline: "Offline",
    platform: "Platform",
    browser: "Browser",
    unknown: "Unknown",
  },
  es: {
    detectingIp: "Detectando tu direcci\u00f3n IP...",
    couldNotDetect: "No se pudo detectar tu direcci\u00f3n IP. Comprueba tu conexi\u00f3n o int\u00e9ntalo de nuevo.",
    yourPublicIp: "Tu IP P\u00fablica",
    publicIpTip: "Tu IP p\u00fablica es la direcci\u00f3n que ven los sitios web al conectarte. Es diferente de tu IP privada/local usada dentro de tu red dom\u00e9stica.",
    copyIp: "Copiar IP",
    copied: "\u00a1Copiado!",
    location: "Ubicaci\u00f3n",
    ispOrganization: "ISP / Organizaci\u00f3n",
    ispTip: "Tu proveedor de servicios de Internet -- la empresa que proporciona tu conexi\u00f3n a Internet (p. ej. Movistar, Vodafone).",
    timezone: "Zona horaria",
    asn: "ASN",
    yourConnection: "Tu Conexi\u00f3n",
    language: "Idioma",
    status: "Estado",
    online: "En l\u00ednea",
    offline: "Sin conexi\u00f3n",
    platform: "Plataforma",
    browser: "Navegador",
    unknown: "Desconocido",
  },
} as const;

export function getMyIp(lang: Lang) { return myIpI18n[lang]; }


// ─── IpConverter ─────────────────────────────────────────────────────────────

export const ipConverterI18n = {
  en: {
    input: "Input",
    detected: "Detected",
    placeholder: "192.168.1.1 or binary, hex, integer...",
    inputHint: "Enter an IP in any format: decimal dotted, binary, hex (0xC0A80101 or C0.A8.01.01), or integer.",
    conversions: "Conversions",
    copy: "Copy",
    copied: "Copied!",
    noIp: "Enter a valid IP address to see conversions.",
    decimal: "Decimal",
    binary: "Binary",
    hexadecimal: "Hexadecimal",
    integer: "Integer",
    octal: "Octal",
    ipv4MappedIpv6: "IPv4-Mapped IPv6",
    decimalTip: "Standard dotted-decimal notation (0-255 per octet). The most common way to write IPv4 addresses.",
    binaryTip: "Each octet as 8 bits. This is how routers actually process IP addresses.",
    hexTip: "Base-16 representation. Commonly used in low-level networking and packet analysis.",
    integerTip: "The IP as a single 32-bit number. Some APIs and databases store IPs this way for efficient lookups.",
    octalTip: "Base-8 representation. Rarely used directly, but some systems interpret leading-zero octets as octal.",
    ipv6Tip: "An IPv6 address that embeds this IPv4 address, used for dual-stack compatibility.",
  },
  es: {
    input: "Entrada",
    detected: "Detectado",
    placeholder: "192.168.1.1 o binario, hex, entero...",
    inputHint: "Introduce una IP en cualquier formato: decimal con puntos, binario, hex (0xC0A80101 o C0.A8.01.01) o entero.",
    conversions: "Conversiones",
    copy: "Copiar",
    copied: "\u00a1Copiado!",
    noIp: "Introduce una direcci\u00f3n IP v\u00e1lida para ver las conversiones.",
    decimal: "Decimal",
    binary: "Binario",
    hexadecimal: "Hexadecimal",
    integer: "Entero",
    octal: "Octal",
    ipv4MappedIpv6: "IPv4-Mapped IPv6",
    decimalTip: "Notaci\u00f3n decimal con puntos est\u00e1ndar (0-255 por octeto). La forma m\u00e1s habitual de escribir direcciones IPv4.",
    binaryTip: "Cada octeto como 8 bits. As\u00ed es como los routers procesan realmente las direcciones IP.",
    hexTip: "Representaci\u00f3n en base 16. Usada habitualmente en redes de bajo nivel y an\u00e1lisis de paquetes.",
    integerTip: "La IP como un \u00fanico n\u00famero de 32 bits. Algunas APIs y bases de datos almacenan IPs as\u00ed para b\u00fasquedas eficientes.",
    octalTip: "Representaci\u00f3n en base 8. Raramente usada directamente, pero algunos sistemas interpretan octetos con ceros iniciales como octal.",
    ipv6Tip: "Una direcci\u00f3n IPv6 que contiene esta direcci\u00f3n IPv4, usada para compatibilidad dual-stack.",
  },
} as const;

export function getIpConverter(lang: Lang) { return ipConverterI18n[lang]; }


// ─── JwtDecoder ──────────────────────────────────────────────────────────────

export const jwtDecoderI18n = {
  en: {
    privacyNotice: "Your token never leaves your browser. All decoding is done locally.",
    jwtToken: "JWT Token",
    loadExample: "Load Example",
    placeholder: "Paste your JWT token here...",
    invalidFormat: "Invalid JWT format. Expected 3 parts separated by dots.",
    decodeFailed: "Failed to decode JWT. Check the format.",
    tokenExpired: "This token is expired.",
    header: "Header",
    headerTip: "Contains the signing algorithm (e.g. HS256, RS256) and token type. Tells the server how to verify the signature.",
    payload: "Payload",
    payloadTip: "Contains claims -- data like subject (sub), expiration (exp), and issued-at (iat). Not encrypted, only base64-encoded.",
    expired: "Expired",
    signature: "Signature",
    signatureTip: "Created by signing header + payload with a secret key. Verifying it proves the token hasn't been tampered with.",
    signatureNote: "This tool does NOT verify the token's signature. Signature verification requires the secret key (for HMAC) or public key (for RSA/ECDSA), which you do not have. Do not trust a JWT's claims based solely on successful decoding.",
    copy: "Copy",
    copied: "Copied!",
  },
  es: {
    privacyNotice: "Tu token nunca sale de tu navegador. Toda la decodificaci\u00f3n se realiza localmente.",
    jwtToken: "Token JWT",
    loadExample: "Cargar Ejemplo",
    placeholder: "Pega aqu\u00ed tu token JWT...",
    invalidFormat: "Formato JWT no v\u00e1lido. Se esperan 3 partes separadas por puntos.",
    decodeFailed: "No se pudo decodificar el JWT. Comprueba el formato.",
    tokenExpired: "Este token ha expirado.",
    header: "Cabecera",
    headerTip: "Contiene el algoritmo de firma (p. ej. HS256, RS256) y el tipo de token. Indica al servidor c\u00f3mo verificar la firma.",
    payload: "Payload",
    payloadTip: "Contiene claims -- datos como sujeto (sub), expiraci\u00f3n (exp) y fecha de emisi\u00f3n (iat). No est\u00e1 cifrado, solo codificado en base64.",
    expired: "Expirado",
    signature: "Firma",
    signatureTip: "Creada firmando cabecera + payload con una clave secreta. Verificarla demuestra que el token no ha sido manipulado.",
    signatureNote: "Esta herramienta NO verifica la firma del token. La verificaci\u00f3n requiere la clave secreta (HMAC) o p\u00fablica (RSA/ECDSA), que no tienes. No conf\u00edes en las claims de un JWT bas\u00e1ndote solo en su decodificaci\u00f3n.",
    copy: "Copiar",
    copied: "\u00a1Copiado!",
  },
} as const;

export function getJwtDecoder(lang: Lang) { return jwtDecoderI18n[lang]; }


// ─── PasswordStrength ────────────────────────────────────────────────────────

export const passwordStrengthI18n = {
  en: {
    privacyNotice: "Your password never leaves your browser. All analysis is done locally.",
    enterPassword: "Enter Password",
    generateStrong: "Generate Strong",
    generateTip: "Uses crypto.getRandomValues for cryptographically secure randomness -- not Math.random.",
    copy: "Copy",
    copied: "Copied!",
    show: "Show",
    hide: "Hide",
    placeholderPassword: "Type or paste a password...",
    strength: "Strength",
    entropy: "Entropy",
    entropyTip: "A measure of randomness. More bits = harder to guess. 40 bits is weak, 60+ is strong, 80+ is very strong.",
    length: "Length",
    composition: "Composition",
    special: "Special",
    checks: "Checks",
    commonPassword: "Common password?",
    repeatedChars: "Repeated characters?",
    sequentialChars: "Sequential characters?",
    estimatedCrackTime: "Estimated Crack Time",
    crackTimeTip: "1K/s = online attack (rate-limited login). 1B/s = offline GPU attack on stolen password hashes. Real-world speeds vary.",
    tipsToImprove: "Tips to Improve",
    // Strength labels
    veryWeak: "Very Weak",
    weak: "Weak",
    fair: "Fair",
    strong: "Strong",
    veryStrong: "Very Strong",
    // Tips
    tipCommon: "This is a commonly used password. Choose something unique.",
    tipLength: "Use at least 12 characters for better security.",
    tipUppercase: "Add uppercase letters.",
    tipLowercase: "Add lowercase letters.",
    tipDigits: "Add numbers.",
    tipSpecial: "Add special characters (!@#$%...).",
    tipRepeated: "Avoid repeated characters (aaa, 111).",
    tipSequential: "Avoid sequential characters (abc, 123).",
    // Crack time units
    instant: "Instant",
    instantCommon: "Instant (common)",
    lessThan1Second: "< 1 second",
    second: "second",
    seconds: "seconds",
    minute: "minute",
    minutes: "minutes",
    hour: "hour",
    hours: "hours",
    day: "day",
    days: "days",
    year: "year",
    years: "years",
    centuriesPlus: "Centuries+",
    kYears: "K years",
    mYears: "M years",
    bits: "bits",
    yes: "Yes",
    no: "No",
  },
  es: {
    privacyNotice: "Tu contrase\u00f1a nunca sale de tu navegador. Todo el an\u00e1lisis se realiza localmente.",
    enterPassword: "Introduce Contrase\u00f1a",
    generateStrong: "Generar Segura",
    generateTip: "Usa crypto.getRandomValues para aleatoriedad criptogr\u00e1ficamente segura -- no Math.random.",
    copy: "Copiar",
    copied: "\u00a1Copiado!",
    show: "Mostrar",
    hide: "Ocultar",
    placeholderPassword: "Escribe o pega una contrase\u00f1a...",
    strength: "Fortaleza",
    entropy: "Entrop\u00eda",
    entropyTip: "Una medida de aleatoriedad. M\u00e1s bits = m\u00e1s dif\u00edcil de adivinar. 40 bits es d\u00e9bil, 60+ es fuerte, 80+ es muy fuerte.",
    length: "Longitud",
    composition: "Composici\u00f3n",
    special: "Especiales",
    checks: "Comprobaciones",
    commonPassword: "\u00bfContrase\u00f1a com\u00fan?",
    repeatedChars: "\u00bfCaracteres repetidos?",
    sequentialChars: "\u00bfCaracteres secuenciales?",
    estimatedCrackTime: "Tiempo Estimado de Descifrado",
    crackTimeTip: "1K/s = ataque online (login con l\u00edmite de intentos). 1B/s = ataque offline con GPU sobre hashes robados. Las velocidades reales var\u00edan.",
    tipsToImprove: "Consejos para Mejorar",
    // Strength labels
    veryWeak: "Muy D\u00e9bil",
    weak: "D\u00e9bil",
    fair: "Aceptable",
    strong: "Fuerte",
    veryStrong: "Muy Fuerte",
    // Tips
    tipCommon: "Esta es una contrase\u00f1a de uso com\u00fan. Elige algo \u00fanico.",
    tipLength: "Usa al menos 12 caracteres para mayor seguridad.",
    tipUppercase: "A\u00f1ade letras may\u00fasculas.",
    tipLowercase: "A\u00f1ade letras min\u00fasculas.",
    tipDigits: "A\u00f1ade n\u00fameros.",
    tipSpecial: "A\u00f1ade caracteres especiales (!@#$%...).",
    tipRepeated: "Evita caracteres repetidos (aaa, 111).",
    tipSequential: "Evita caracteres secuenciales (abc, 123).",
    // Crack time units
    instant: "Instant\u00e1neo",
    instantCommon: "Instant\u00e1neo (com\u00fan)",
    lessThan1Second: "< 1 segundo",
    second: "segundo",
    seconds: "segundos",
    minute: "minuto",
    minutes: "minutos",
    hour: "hora",
    hours: "horas",
    day: "d\u00eda",
    days: "d\u00edas",
    year: "a\u00f1o",
    years: "a\u00f1os",
    centuriesPlus: "Siglos+",
    kYears: "mil a\u00f1os",
    mYears: "M a\u00f1os",
    bits: "bits",
    yes: "Sí",
    no: "No",
  },
} as const;

export function getPasswordStrength(lang: Lang) { return passwordStrengthI18n[lang]; }


// ─── PrivacyCheck ────────────────────────────────────────────────────────────

export const privacyCheckI18n = {
  en: {
    runningChecks: "Running privacy checks...",
    privacyReport: "Privacy Report",
    copyReport: "Copy Report",
    copied: "Copied!",
    safe: "Private",
    exposed: "Detectable",
    note: "Info",
    canvasTip: "Websites draw hidden graphics and read the pixel data. Tiny rendering differences between devices create a unique ID.",
    webrtcTip: "WebRTC can reveal your real local IP even behind a VPN, letting sites identify your network.",
    dntTip: "A browser signal asking sites not to track you. Most websites ignore it entirely.",
    clipboardTitle: "Browser Privacy Report - PingThat.dev",
    // Check labels
    doNotTrack: "Do Not Track",
    cookiesEnabled: "Cookies Enabled",
    webrtcLeak: "WebRTC Leak",
    canvasFingerprint: "Canvas Fingerprint",
    audioFingerprint: "Audio Fingerprint",
    webglVendor: "WebGL Vendor",
    timezone: "Timezone",
    screenResolution: "Screen Resolution",
    language: "Language",
    hardwareConcurrency: "Hardware Concurrency",
    deviceMemory: "Device Memory",
    touchSupport: "Touch Support",
    platform: "Platform",
    // Check values
    enabled: "Enabled",
    disabled: "Disabled",
    yes: "Yes",
    no: "No",
    noLeakDetected: "No leak detected",
    notSupported: "Not supported",
    detectable: "Detectable",
    notAvailable: "Not available",
    hidden: "Hidden",
    cores: "cores",
    points: "points",
    unknown: "Unknown",
  },
  es: {
    runningChecks: "Ejecutando comprobaciones de privacidad...",
    privacyReport: "Informe de Privacidad",
    copyReport: "Copiar Informe",
    copied: "\u00a1Copiado!",
    safe: "Privado",
    exposed: "Detectable",
    note: "Info",
    canvasTip: "Los sitios web dibujan gr\u00e1ficos ocultos y leen los datos de p\u00edxeles. Peque\u00f1as diferencias de renderizado entre dispositivos crean un ID \u00fanico.",
    webrtcTip: "WebRTC puede revelar tu IP local real incluso detr\u00e1s de una VPN, permitiendo a los sitios identificar tu red.",
    dntTip: "Una se\u00f1al del navegador que pide a los sitios que no te rastreen. La mayor\u00eda de los sitios web la ignoran por completo.",
    clipboardTitle: "Informe de Privacidad del Navegador - PingThat.dev",
    // Check labels
    doNotTrack: "Do Not Track",
    cookiesEnabled: "Cookies Activadas",
    webrtcLeak: "Fuga WebRTC",
    canvasFingerprint: "Huella Canvas",
    audioFingerprint: "Huella de Audio",
    webglVendor: "Fabricante WebGL",
    timezone: "Zona Horaria",
    screenResolution: "Resoluci\u00f3n de Pantalla",
    language: "Idioma",
    hardwareConcurrency: "N\u00facleos del Procesador",
    deviceMemory: "Memoria del Dispositivo",
    touchSupport: "Soporte T\u00e1ctil",
    platform: "Plataforma",
    // Check values
    enabled: "Activado",
    disabled: "Desactivado",
    yes: "S\u00ed",
    no: "No",
    noLeakDetected: "Sin fuga detectada",
    notSupported: "No soportado",
    detectable: "Detectable",
    notAvailable: "No disponible",
    hidden: "Oculto",
    cores: "n\u00facleos",
    points: "puntos",
    unknown: "Desconocido",
  },
} as const;

export function getPrivacyCheck(lang: Lang) { return privacyCheckI18n[lang]; }


// ─── SubnetCalculator ────────────────────────────────────────────────────────

export const subnetCalculatorI18n = {
  en: {
    input: "Input",
    ipAddress: "IP Address",
    cidrTip: "Classless Inter-Domain Routing -- a compact notation for IP ranges. /24 = 256 addresses, /16 = 65,536 addresses.",
    networkAddress: "Network Address",
    networkTip: "The first address in the subnet. It identifies the network itself and cannot be assigned to a host.",
    broadcastAddress: "Broadcast Address",
    broadcastTip: "The last address in the subnet. Packets sent here are delivered to all hosts on the network.",
    firstHost: "First Host",
    lastHost: "Last Host",
    totalHosts: "Total Hosts",
    subnetMask: "Subnet Mask",
    wildcardMask: "Wildcard Mask",
    wildcardTip: "The inverse of the subnet mask. Used in ACLs and routing configs to specify which bits can vary.",
    cidrNotation: "CIDR Notation",
    ipClass: "IP Class",
    privateAddress: "Private Address?",
    yesPrivate: "Yes (Private)",
    noPublic: "No (Public)",
    binaryRepresentation: "Binary Representation",
    ip: "IP",
    mask: "Mask",
    enterValidIp: "Enter a valid IPv4 address to calculate subnet details.",
    commonSubnets: "Common Subnets",
    cidr: "CIDR",
    usableHosts: "Usable Hosts",
  },
  es: {
    input: "Entrada",
    ipAddress: "Direcci\u00f3n IP",
    cidrTip: "Classless Inter-Domain Routing -- una notaci\u00f3n compacta para rangos de IP. /24 = 256 direcciones, /16 = 65.536 direcciones.",
    networkAddress: "Direcci\u00f3n de Red",
    networkTip: "La primera direcci\u00f3n de la subred. Identifica la red en s\u00ed y no se puede asignar a un host.",
    broadcastAddress: "Direcci\u00f3n de Broadcast",
    broadcastTip: "La \u00faltima direcci\u00f3n de la subred. Los paquetes enviados aqu\u00ed se entregan a todos los hosts de la red.",
    firstHost: "Primer Host",
    lastHost: "\u00daltimo Host",
    totalHosts: "Hosts Totales",
    subnetMask: "M\u00e1scara de Subred",
    wildcardMask: "M\u00e1scara Wildcard",
    wildcardTip: "La inversa de la m\u00e1scara de subred. Se usa en ACLs y configuraci\u00f3n de enrutamiento para especificar qu\u00e9 bits pueden variar.",
    cidrNotation: "Notaci\u00f3n CIDR",
    ipClass: "Clase IP",
    privateAddress: "\u00bfDirecci\u00f3n Privada?",
    yesPrivate: "S\u00ed (Privada)",
    noPublic: "No (P\u00fablica)",
    binaryRepresentation: "Representaci\u00f3n Binaria",
    ip: "IP",
    mask: "M\u00e1scara",
    enterValidIp: "Introduce una direcci\u00f3n IPv4 v\u00e1lida para calcular los detalles de la subred.",
    commonSubnets: "Subredes Comunes",
    cidr: "CIDR",
    usableHosts: "Hosts Utilizables",
  },
} as const;

export function getSubnetCalculator(lang: Lang) { return subnetCalculatorI18n[lang]; }


// ─── WebrtcLeakTest ──────────────────────────────────────────────────────────

export const webrtcLeakTestI18n = {
  en: {
    runningTest: "Running WebRTC leak test...",
    notSupported: "WebRTC is not supported in your browser.",
    errorMessage: "Failed to run WebRTC test. Your browser may block this.",
    leakDetected: "Leak Detected!",
    leakDescription: "WebRTC is exposing your local/private IP address. If you're using a VPN, your real IP may be visible.",
    noLeak: "No Leak Detected",
    noLeakDescription: "WebRTC is not exposing any private IP addresses.",
    noIpsFound: "No IPs were found in ICE candidates.",
    ipsFound: "IPs Found",
    runAgain: "Run Again",
    runTestAgain: "Run Test Again",
    local: "Local",
    public: "Public",
    localTip: "A private/local IP address from your LAN. Exposing this through WebRTC can reveal your real network even behind a VPN.",
    publicTip: "Your public-facing IP address. This is normally visible to websites you visit.",
    whatIsWebrtcLeak: "What is a WebRTC leak?",
    explanation1: "WebRTC (Web Real-Time Communication) enables peer-to-peer connections in browsers for video calls, file sharing, and more. During connection setup, it uses STUN/TURN servers",
    stunTip: "STUN servers help your browser discover its public IP by reflecting your connection info back to you. This is needed for peer-to-peer connections.",
    explanation1End: "to discover your network addresses.",
    explanation2Prefix: "A ",
    explanation2Bold: "WebRTC leak",
    explanation2Suffix: " occurs when your browser reveals your local (private) IP address through ICE candidates, even when you're behind a VPN. This can expose your real network identity.",
    preventPrefix: "To prevent leaks:",
    preventText: " Use a browser extension that blocks WebRTC, disable WebRTC in browser settings (Firefox: ",
    preventCode: "media.peerconnection.enabled = false",
    preventEnd: "), or use a VPN with built-in WebRTC protection.",
  },
  es: {
    runningTest: "Ejecutando test de fugas WebRTC...",
    notSupported: "WebRTC no est\u00e1 soportado en tu navegador.",
    errorMessage: "No se pudo ejecutar el test WebRTC. Es posible que tu navegador lo bloquee.",
    leakDetected: "\u00a1Fuga Detectada!",
    leakDescription: "WebRTC est\u00e1 exponiendo tu direcci\u00f3n IP local/privada. Si usas una VPN, tu IP real podr\u00eda ser visible.",
    noLeak: "Sin Fugas Detectadas",
    noLeakDescription: "WebRTC no est\u00e1 exponiendo ninguna direcci\u00f3n IP privada.",
    noIpsFound: "No se encontraron IPs en los candidatos ICE.",
    ipsFound: "IPs Encontradas",
    runAgain: "Repetir",
    runTestAgain: "Repetir Test",
    local: "Local",
    public: "P\u00fablica",
    localTip: "Una direcci\u00f3n IP privada/local de tu LAN. Exponerla a trav\u00e9s de WebRTC puede revelar tu red real incluso detr\u00e1s de una VPN.",
    publicTip: "Tu direcci\u00f3n IP p\u00fablica. Normalmente es visible para los sitios web que visitas.",
    whatIsWebrtcLeak: "\u00bfQu\u00e9 es una fuga WebRTC?",
    explanation1: "WebRTC (Web Real-Time Communication) permite conexiones peer-to-peer en navegadores para videollamadas, compartir archivos y m\u00e1s. Durante el establecimiento de la conexi\u00f3n, utiliza servidores STUN/TURN",
    stunTip: "Los servidores STUN ayudan a tu navegador a descubrir su IP p\u00fablica reflejando la informaci\u00f3n de tu conexi\u00f3n. Esto es necesario para las conexiones peer-to-peer.",
    explanation1End: "para descubrir tus direcciones de red.",
    explanation2Prefix: "Una ",
    explanation2Bold: "fuga WebRTC",
    explanation2Suffix: " ocurre cuando tu navegador revela tu direcci\u00f3n IP local (privada) a trav\u00e9s de candidatos ICE, incluso estando detr\u00e1s de una VPN. Esto puede exponer tu identidad de red real.",
    preventPrefix: "Para prevenir fugas:",
    preventText: " Usa una extensi\u00f3n de navegador que bloquee WebRTC, desactiva WebRTC en los ajustes del navegador (Firefox: ",
    preventCode: "media.peerconnection.enabled = false",
    preventEnd: "), o usa una VPN con protecci\u00f3n WebRTC integrada.",
  },
} as const;

export function getWebrtcLeakTest(lang: Lang) { return webrtcLeakTestI18n[lang]; }


// ─── DnsLookup ──────────────────────────────────────────────────────────────

export const dnsLookupI18n = {
  en: { domainLabel: "Domain Name", placeholder: "example.com", recordType: "Record Type", lookup: "Lookup", looking: "Looking up...", results: "DNS Records", type: "Type", value: "Value", noRecords: "No DNS records found for this type.", lookupFailed: "DNS lookup failed. Check the domain and try again.", invalidDomain: "Invalid domain format. Enter a domain like example.com." },
  es: { domainLabel: "Nombre de Dominio", placeholder: "ejemplo.com", recordType: "Tipo de Registro", lookup: "Buscar", looking: "Buscando...", results: "Registros DNS", type: "Tipo", value: "Valor", noRecords: "No se encontraron registros DNS para este tipo.", lookupFailed: "La b\u00fasqueda DNS fall\u00f3. Comprueba el dominio e int\u00e9ntalo de nuevo.", invalidDomain: "Formato de dominio no v\u00e1lido. Introduce un dominio como ejemplo.com." },
} as const;
export function getDnsLookup(lang: Lang) { return dnsLookupI18n[lang]; }


// ─── SslChecker ─────────────────────────────────────────────────────────────

export const sslCheckerI18n = {
  en: { domainLabel: "Domain", placeholder: "example.com", check: "Check SSL", checking: "Checking...", checkFailed: "SSL check failed. Try again.", sslStatus: "SSL/TLS Status", secure: "HTTPS Secure", insecure: "HTTPS Failed", notSet: "Not set (recommended)", certificates: "Certificates", issuer: "Issuer", validFrom: "Valid from", validUntil: "Valid until" },
  es: { domainLabel: "Dominio", placeholder: "ejemplo.com", check: "Verificar SSL", checking: "Verificando...", checkFailed: "La verificaci\u00f3n SSL fall\u00f3. Int\u00e9ntalo de nuevo.", sslStatus: "Estado SSL/TLS", secure: "HTTPS Seguro", insecure: "HTTPS Fall\u00f3", notSet: "No configurado (recomendado)", certificates: "Certificados", issuer: "Emisor", validFrom: "V\u00e1lido desde", validUntil: "V\u00e1lido hasta" },
} as const;
export function getSslChecker(lang: Lang) { return sslCheckerI18n[lang]; }


// ─── IsItDown ───────────────────────────────────────────────────────────────

export const isItDownI18n = {
  en: { urlLabel: "Website URL", placeholder: "example.com", check: "Check", checking: "Checking...", checkFailed: "Check failed. Try again.", itsUp: "It's Up!", itsDown: "It's Down!", siteResponding: "The website is responding normally.", siteNotResponding: "The website is not responding.", status: "Status" },
  es: { urlLabel: "URL del Sitio Web", placeholder: "ejemplo.com", check: "Verificar", checking: "Verificando...", checkFailed: "La verificaci\u00f3n fall\u00f3. Int\u00e9ntalo de nuevo.", itsUp: "\u00a1Est\u00e1 Activa!", itsDown: "\u00a1Est\u00e1 Ca\u00edda!", siteResponding: "El sitio web est\u00e1 respondiendo normalmente.", siteNotResponding: "El sitio web no est\u00e1 respondiendo.", status: "Estado" },
} as const;
export function getIsItDown(lang: Lang) { return isItDownI18n[lang]; }


// ─── IsItUp ─────────────────────────────────────────────────────────────────

export const isItUpI18n = {
  en: { urlLabel: "Website URL", placeholder: "example.com", check: "Check Status", checking: "Checking...", checkFailed: "Check failed. Try again.", statusReport: "Status Report", online: "Online", offline: "Offline", responseTime: "Response Time", httpStatus: "HTTP Status", fast: "Fast", moderate: "Moderate", slow: "Slow" },
  es: { urlLabel: "URL del Sitio Web", placeholder: "ejemplo.com", check: "Verificar Estado", checking: "Verificando...", checkFailed: "La verificaci\u00f3n fall\u00f3. Int\u00e9ntalo de nuevo.", statusReport: "Informe de Estado", online: "En L\u00ednea", offline: "Sin Conexi\u00f3n", responseTime: "Tiempo de Respuesta", httpStatus: "Estado HTTP", fast: "R\u00e1pido", moderate: "Moderado", slow: "Lento" },
} as const;
export function getIsItUp(lang: Lang) { return isItUpI18n[lang]; }


// ─── HttpHeaders ────────────────────────────────────────────────────────────

export const httpHeadersI18n = {
  en: { urlLabel: "Website URL", placeholder: "example.com", check: "Check Headers", checking: "Checking...", checkFailed: "Check failed. Try again.", securityScore: "Security Score", allHeaders: "All Headers", copy: "Copy" },
  es: { urlLabel: "URL del Sitio Web", placeholder: "ejemplo.com", check: "Verificar Cabeceras", checking: "Verificando...", checkFailed: "La verificaci\u00f3n fall\u00f3. Int\u00e9ntalo de nuevo.", securityScore: "Puntuaci\u00f3n de Seguridad", allHeaders: "Todas las Cabeceras", copy: "Copiar" },
} as const;
export function getHttpHeaders(lang: Lang) { return httpHeadersI18n[lang]; }


// ─── WhoisLookup ────────────────────────────────────────────────────────────

export const whoisLookupI18n = {
  en: { domainLabel: "Domain Name", placeholder: "example.com", lookup: "Lookup", looking: "Looking up...", lookupFailed: "WHOIS lookup failed. Try again.", domainInfo: "Domain Information", registrar: "Registrar", created: "Created", updated: "Updated", expires: "Expires", nameservers: "Nameservers", statuses: "Statuses", notFound: "Domain not found." },
  es: { domainLabel: "Nombre de Dominio", placeholder: "ejemplo.com", lookup: "Buscar", looking: "Buscando...", lookupFailed: "La b\u00fasqueda WHOIS fall\u00f3. Int\u00e9ntalo de nuevo.", domainInfo: "Informaci\u00f3n del Dominio", registrar: "Registrador", created: "Creado", updated: "Actualizado", expires: "Expira", nameservers: "Nameservers", statuses: "Estados", notFound: "Dominio no encontrado." },
} as const;
export function getWhoisLookup(lang: Lang) { return whoisLookupI18n[lang]; }


// ─── RedirectChecker ────────────────────────────────────────────────────────

export const redirectCheckerI18n = {
  en: { urlLabel: "URL to Check", placeholder: "example.com", check: "Check Redirects", checking: "Checking...", checkFailed: "Redirect check failed. Try again.", redirectChain: "Redirect Chain", redirect: "redirect", redirects: "redirects", finalUrl: "Final URL" },
  es: { urlLabel: "URL a Verificar", placeholder: "ejemplo.com", check: "Verificar Redirecciones", checking: "Verificando...", checkFailed: "La verificaci\u00f3n de redirecciones fall\u00f3. Int\u00e9ntalo de nuevo.", redirectChain: "Cadena de Redirecciones", redirect: "redirecci\u00f3n", redirects: "redirecciones", finalUrl: "URL Final" },
} as const;
export function getRedirectChecker(lang: Lang) { return redirectCheckerI18n[lang]; }


// ─── UrlParser ──────────────────────────────────────────────────────────────

export const urlParserI18n = {
  en: { urlLabel: "URL", placeholder: "https://example.com/path?key=value#section", parsedUrl: "Parsed URL", queryParams: "Query Parameters", invalidUrl: "Invalid URL. Enter a complete URL starting with http:// or https://.", defaultPort: "(default)", none: "(none)", copy: "Copy", sample: "Sample", clear: "Clear" },
  es: { urlLabel: "URL", placeholder: "https://ejemplo.com/ruta?clave=valor#seccion", parsedUrl: "URL Analizada", queryParams: "Par\u00e1metros de Consulta", invalidUrl: "URL inv\u00e1lida. Introduce una URL completa que empiece con http:// o https://.", defaultPort: "(por defecto)", none: "(ninguno)", copy: "Copiar", sample: "Ejemplo", clear: "Limpiar" },
} as const;
export function getUrlParser(lang: Lang) { return urlParserI18n[lang]; }


// ─── EmailAuth ─────────────────────────────────────────────────────────────

export const emailAuthI18n = {
  en: {
    domainLabel: "Domain",
    placeholder: "example.com",
    check: "Check Email Auth",
    checking: "Checking...",
    results: "Email Authentication Results",
    spfTitle: "SPF (Sender Policy Framework)",
    dmarcTitle: "DMARC (Domain-based Message Authentication)",
    dkimTitle: "DKIM (DomainKeys Identified Mail)",
    recordFound: "Record found",
    recordMissing: "No record found",
    policy: "Policy",
    selectors: "Selectors found",
    assessPass: "Pass",
    assessWarning: "Warning",
    assessFail: "Fail",
    tipSpf: "SPF specifies which mail servers are authorized to send email on behalf of your domain. Without it, anyone can forge emails from your domain.",
    tipDmarc: "DMARC tells receiving servers what to do when SPF or DKIM checks fail. A policy of 'reject' or 'quarantine' provides strong protection against spoofing.",
    tipDkim: "DKIM adds a cryptographic signature to outgoing emails, allowing receivers to verify the message was not altered in transit.",
    checkFailed: "Email authentication check failed. Try again.",
    invalidDomain: "Invalid domain format. Enter a domain like example.com.",
  },
  es: {
    domainLabel: "Dominio",
    placeholder: "ejemplo.com",
    check: "Verificar Email Auth",
    checking: "Verificando...",
    results: "Resultados de Autenticacion de Email",
    spfTitle: "SPF (Sender Policy Framework)",
    dmarcTitle: "DMARC (Autenticacion de Mensajes Basada en Dominio)",
    dkimTitle: "DKIM (DomainKeys Identified Mail)",
    recordFound: "Registro encontrado",
    recordMissing: "Sin registro encontrado",
    policy: "Politica",
    selectors: "Selectores encontrados",
    assessPass: "Correcto",
    assessWarning: "Advertencia",
    assessFail: "Fallo",
    tipSpf: "SPF especifica que servidores de correo estan autorizados a enviar email en nombre de tu dominio. Sin el, cualquiera puede falsificar emails desde tu dominio.",
    tipDmarc: "DMARC indica a los servidores receptores que hacer cuando las verificaciones SPF o DKIM fallan. Una politica de 'reject' o 'quarantine' proporciona proteccion fuerte contra suplantacion.",
    tipDkim: "DKIM agrega una firma criptografica a los emails salientes, permitiendo a los receptores verificar que el mensaje no fue alterado en transito.",
    checkFailed: "La verificacion de autenticacion de email fallo. Intentalo de nuevo.",
    invalidDomain: "Formato de dominio no valido. Introduce un dominio como ejemplo.com.",
  },
} as const;
export function getEmailAuth(lang: Lang) { return emailAuthI18n[lang]; }
