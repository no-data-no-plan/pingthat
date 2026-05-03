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
    signatureNote: "Use the Verify Signature panel below to check this against a key. Decoding alone does not prove a token is authentic.",
    copy: "Copy",
    copied: "Copied!",
    verifyTitle: "Verify Signature",
    verifyTip: "Paste the secret (HS256) or public key in PEM format (RS256/ES256). Verification runs locally with the Web Crypto API \u2014 your key never leaves your browser.",
    verifyKeyLabelHs: "Shared secret",
    verifyKeyLabelPem: "Public key (PEM)",
    verifyKeyLabelGeneric: "Secret or public key",
    verifyKeyPlaceholderHs: "your-shared-secret",
    verifyKeyPlaceholderPem: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----",
    verifyAutoNote: "Verifies as you type. Your key never leaves your browser.",
    verifyValid: "Signature valid",
    verifyValidNote: "The token was signed with this key and the payload has not been tampered with.",
    verifyInvalidSignature: "Signature does not match",
    verifyInvalidKeyFormat: "Could not import key \u2014 check the format",
    verifyEmptyKey: "Enter the secret or public key to verify",
    verifyNoTokenYet: "Paste a JWT above to enable signature verification.",
    verifyKeyHintHs: "Paste the shared secret used to sign this token.",
    verifyKeyHintPem: "Paste the PEM-encoded public key (-----BEGIN PUBLIC KEY-----).",
    verifyAlgNone: "Token uses alg=none and was rejected",
    verifyAlgUnsupported: "Algorithm not supported",
    verifyAlgMismatch: "Algorithm mismatch",
    verifyMalformed: "Token is malformed",
    verifyChecking: "Verifying\u2026",
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
    signatureNote: "Usa el panel \u00abVerificar Firma\u00bb m\u00e1s abajo para comprobarla con una clave. Decodificar no prueba que el token sea aut\u00e9ntico.",
    copy: "Copiar",
    copied: "\u00a1Copiado!",
    verifyTitle: "Verificar Firma",
    verifyTip: "Pega el secreto (HS256) o la clave p\u00fablica en formato PEM (RS256/ES256). La verificaci\u00f3n se hace localmente con Web Crypto \u2014 tu clave nunca sale de tu navegador.",
    verifyKeyLabelHs: "Secreto compartido",
    verifyKeyLabelPem: "Clave p\u00fablica (PEM)",
    verifyKeyLabelGeneric: "Secreto o clave p\u00fablica",
    verifyKeyPlaceholderHs: "tu-secreto-compartido",
    verifyKeyPlaceholderPem: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----",
    verifyAutoNote: "Se verifica mientras escribes. Tu clave nunca sale de tu navegador.",
    verifyValid: "Firma v\u00e1lida",
    verifyValidNote: "El token fue firmado con esta clave y el payload no ha sido manipulado.",
    verifyInvalidSignature: "La firma no coincide",
    verifyInvalidKeyFormat: "No se pudo importar la clave \u2014 revisa el formato",
    verifyEmptyKey: "Introduce el secreto o la clave p\u00fablica para verificar",
    verifyNoTokenYet: "Pega un JWT arriba para activar la verificaci\u00f3n de firma.",
    verifyKeyHintHs: "Pega el secreto compartido con el que se firm\u00f3 este token.",
    verifyKeyHintPem: "Pega la clave p\u00fablica en PEM (-----BEGIN PUBLIC KEY-----).",
    verifyAlgNone: "El token usa alg=none y fue rechazado",
    verifyAlgUnsupported: "Algoritmo no soportado",
    verifyAlgMismatch: "El algoritmo no coincide",
    verifyMalformed: "El token est\u00e1 malformado",
    verifyChecking: "Verificando\u2026",
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
    unifiedHint: "Accepts 192.168.1.0/24 (full CIDR) or just 192.168.1.0",
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
    unifiedHint: "Acepta 192.168.1.0/24 (CIDR completo) o solo 192.168.1.0",
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


// ─── CaaLookup ──────────────────────────────────────────────────────────────

export const caaLookupI18n = {
  en: {
    domainLabel: "Domain Name",
    placeholder: "example.com",
    lookup: "Check CAA",
    looking: "Checking...",
    results: "CAA Records",
    colTag: "Tag",
    colValue: "Value",
    colFlags: "Flags",
    lookupFailed: "CAA lookup failed. Check the domain and try again.",
    invalidDomain: "Invalid domain format. Enter a domain like example.com.",
    policyFoundTitle: "CAA policy in place",
    noPolicyTitle: "No CAA policy found",
    noPolicyExplanation: "Any public CA can issue certificates for this domain. Add CAA records to restrict which CAs are allowed.",
    inheritedFrom: "Policy inherited from",
    critical: "Critical",
    anyCa: "(any CA — empty value denies issuance)",
    caCheckTitle: "Check a specific CA",
    caCheckHint: "Pick a CA or enter its CAA identifier (e.g. letsencrypt.org) to verify whether it is allowed to issue certificates under this policy.",
    caCheckPlaceholder: "letsencrypt.org",
    allowed: "Allowed",
    notAllowed: "Not allowed",
    reasonAllowedAll: "This CA matches an issue record and may also issue wildcard certificates.",
    reasonAllowedNonWildcard: "This CA is allowed for standard certificates.",
    reasonNoIssueRecords: "No issue tag records exist, so no CA may issue certificates under this policy.",
    reasonNotListed: "This CA is not listed in any issue record for this domain.",
    wildcardBlocked: "Wildcard certificates are blocked for this CA (issuewild does not include it).",
  },
  es: {
    domainLabel: "Nombre de Dominio",
    placeholder: "ejemplo.com",
    lookup: "Comprobar CAA",
    looking: "Comprobando...",
    results: "Registros CAA",
    colTag: "Etiqueta",
    colValue: "Valor",
    colFlags: "Flags",
    lookupFailed: "La consulta CAA fall\u00f3. Comprueba el dominio e int\u00e9ntalo de nuevo.",
    invalidDomain: "Formato de dominio no v\u00e1lido. Introduce un dominio como ejemplo.com.",
    policyFoundTitle: "Pol\u00edtica CAA configurada",
    noPolicyTitle: "No se encontr\u00f3 pol\u00edtica CAA",
    noPolicyExplanation: "Cualquier CA p\u00fablica puede emitir certificados para este dominio. A\u00f1ade registros CAA para restringir qu\u00e9 CAs est\u00e1n autorizadas.",
    inheritedFrom: "Pol\u00edtica heredada de",
    critical: "Cr\u00edtico",
    anyCa: "(cualquier CA \u2014 valor vac\u00edo deniega la emisi\u00f3n)",
    caCheckTitle: "Comprobar una CA concreta",
    caCheckHint: "Selecciona una CA o introduce su identificador CAA (p.ej. letsencrypt.org) para verificar si est\u00e1 autorizada a emitir certificados bajo esta pol\u00edtica.",
    caCheckPlaceholder: "letsencrypt.org",
    allowed: "Autorizada",
    notAllowed: "No autorizada",
    reasonAllowedAll: "Esta CA coincide con un registro issue y tambi\u00e9n puede emitir certificados wildcard.",
    reasonAllowedNonWildcard: "Esta CA est\u00e1 autorizada para certificados est\u00e1ndar.",
    reasonNoIssueRecords: "No hay registros issue, por lo que ninguna CA puede emitir certificados bajo esta pol\u00edtica.",
    reasonNotListed: "Esta CA no aparece en ning\u00fan registro issue de este dominio.",
    wildcardBlocked: "Los certificados wildcard est\u00e1n bloqueados para esta CA (issuewild no la incluye).",
  },
} as const;
export function getCaaLookup(lang: Lang) { return caaLookupI18n[lang]; }


// ─── Ipv6Check ──────────────────────────────────────────────────────────────

export const ipv6CheckI18n = {
  en: {
    domainLabel: "Domain Name",
    placeholder: "example.com",
    check: "Check IPv6",
    checking: "Checking...",
    lookupFailed: "IPv6 check failed. Check the domain and try again.",
    invalidDomain: "Invalid domain format. Enter a domain like example.com.",
    scoreExplanation: "Apex AAAA, www AAAA, nameserver AAAA, mail AAAA coverage.",
    hostResolution: "Host resolution",
    infrastructure: "Infrastructure",
    nameservers: "Nameservers with AAAA",
    mailServers: "Mail servers with AAAA",
    colHost: "Host",
    noAaaa: "No AAAA record",
    noMail: "No MX records",
    ratingFullReady: "Fully IPv6-ready",
    ratingGood: "IPv6-ready",
    ratingPartial: "Partial IPv6",
    ratingMinimal: "Minimal IPv6",
    ratingNone: "No IPv6",
  },
  es: {
    domainLabel: "Nombre de Dominio",
    placeholder: "ejemplo.com",
    check: "Comprobar IPv6",
    checking: "Comprobando...",
    lookupFailed: "La comprobaci\u00f3n IPv6 fall\u00f3. Verifica el dominio e int\u00e9ntalo de nuevo.",
    invalidDomain: "Formato de dominio no v\u00e1lido. Introduce un dominio como ejemplo.com.",
    scoreExplanation: "AAAA del apex, AAAA del www, AAAA de los nameservers, AAAA de los MX.",
    hostResolution: "Resoluci\u00f3n del host",
    infrastructure: "Infraestructura",
    nameservers: "Nameservers con AAAA",
    mailServers: "Servidores de correo con AAAA",
    colHost: "Host",
    noAaaa: "Sin registro AAAA",
    noMail: "Sin registros MX",
    ratingFullReady: "Totalmente listo para IPv6",
    ratingGood: "Listo para IPv6",
    ratingPartial: "IPv6 parcial",
    ratingMinimal: "IPv6 m\u00ednimo",
    ratingNone: "Sin IPv6",
  },
} as const;
export function getIpv6Check(lang: Lang) { return ipv6CheckI18n[lang]; }


// ─── DnssecCheck ─────────────────────────────────────────────────────────────

export const dnssecCheckI18n = {
  en: {
    domainLabel: "Domain Name",
    placeholder: "example.com",
    check: "Check DNSSEC",
    checking: "Checking...",
    lookupFailed: "DNSSEC check failed. Check the domain and try again.",
    invalidDomain: "Invalid domain format. Enter a domain like example.com.",
    statusSecure: "Secure (DNSSEC validated)",
    statusBogus: "Bogus (broken DNSSEC)",
    statusPartial: "Partially signed",
    statusInsecure: "Unsigned (DNSSEC not enabled)",
    explainSecure: "The domain is signed and the chain of trust to the DNS root validates. Responses are authenticated.",
    explainBogus: "The zone has DNSKEY records but validation fails. Users with validating resolvers will see SERVFAIL instead of your records.",
    explainPartial: "The zone is signed (DNSKEY present) but the parent zone has no DS record. The chain of trust is not published.",
    explainInsecure: "The zone is not signed. There is no cryptographic protection against DNS tampering in transit.",
    checksTitle: "Signals",
    dnskeyLabel: "DNSKEY records",
    dnskeyHint: "Public keys published at the zone apex",
    dsLabel: "DS records",
    dsHint: "Delegation Signer at the parent zone (TLD) linking to DNSKEY",
    validationLabel: "Resolver validation",
    validationHint: "Cloudflare 1.1.1.1 AD flag on an A-record query",
    dsRecordsTitle: "DS records",
    dnskeysTitle: "DNSKEY records",
    colKeyTag: "Key Tag",
    colAlgorithm: "Algorithm",
    colDigest: "Digest",
    colFlags: "Flags",
    colKeyType: "Key Type",
    ksk: "KSK (Key Signing Key)",
    zsk: "ZSK (Zone Signing Key)",
    none: "None",
    validated: "\u2713 Validated",
    notValidated: "\u2014",
    bogus: "\u2717 Bogus",
  },
  es: {
    domainLabel: "Nombre de Dominio",
    placeholder: "ejemplo.com",
    check: "Comprobar DNSSEC",
    checking: "Comprobando...",
    lookupFailed: "La comprobaci\u00f3n DNSSEC fall\u00f3. Verifica el dominio e int\u00e9ntalo de nuevo.",
    invalidDomain: "Formato de dominio no v\u00e1lido. Introduce un dominio como ejemplo.com.",
    statusSecure: "Seguro (DNSSEC validado)",
    statusBogus: "Roto (DNSSEC inv\u00e1lido)",
    statusPartial: "Firmado parcialmente",
    statusInsecure: "Sin firmar (DNSSEC no activo)",
    explainSecure: "El dominio est\u00e1 firmado y la cadena de confianza hasta la ra\u00edz DNS valida. Las respuestas est\u00e1n autenticadas.",
    explainBogus: "La zona tiene registros DNSKEY pero la validaci\u00f3n falla. Los usuarios con resolvers validadores ver\u00e1n SERVFAIL en vez de tus registros.",
    explainPartial: "La zona est\u00e1 firmada (hay DNSKEY) pero la zona padre no tiene DS. La cadena de confianza no est\u00e1 publicada.",
    explainInsecure: "La zona no est\u00e1 firmada. No hay protecci\u00f3n criptogr\u00e1fica contra manipulaci\u00f3n DNS en tr\u00e1nsito.",
    checksTitle: "Se\u00f1ales",
    dnskeyLabel: "Registros DNSKEY",
    dnskeyHint: "Claves p\u00fablicas publicadas en el apex de la zona",
    dsLabel: "Registros DS",
    dsHint: "Delegation Signer en la zona padre (TLD) que enlaza con DNSKEY",
    validationLabel: "Validaci\u00f3n del resolver",
    validationHint: "Flag AD de Cloudflare 1.1.1.1 sobre una consulta A",
    dsRecordsTitle: "Registros DS",
    dnssecsTitle: "Registros DNSKEY",
    dnskeysTitle: "Registros DNSKEY",
    colKeyTag: "Key Tag",
    colAlgorithm: "Algoritmo",
    colDigest: "Digest",
    colFlags: "Flags",
    colKeyType: "Tipo de Clave",
    ksk: "KSK (Key Signing Key)",
    zsk: "ZSK (Zone Signing Key)",
    none: "Ninguno",
    validated: "\u2713 Validado",
    notValidated: "\u2014",
    bogus: "\u2717 Roto",
  },
} as const;
export function getDnssecCheck(lang: Lang) { return dnssecCheckI18n[lang]; }


// ─── ReverseDns ──────────────────────────────────────────────────────────────

export const reverseDnsI18n = {
  en: {
    ipLabel: "IP Address",
    placeholder: "1.1.1.1 or 2606:4700:4700::1111",
    hint: "IPv4 (a.b.c.d) or IPv6 (hex groups, :: allowed)",
    lookup: "Lookup PTR",
    looking: "Looking up...",
    lookupFailed: "Reverse DNS lookup failed.",
    invalidIp: "Invalid IP address. Enter an IPv4 or IPv6 address.",
    resolving: "Resolving",
    ptrFound: "PTR records",
    noPtr: "No PTR record",
    noPtrHint: "The IP owner has not published a reverse DNS record. This is common for residential IPs and some cloud ranges; it can affect mail deliverability.",
  },
  es: {
    ipLabel: "Direcci\u00f3n IP",
    placeholder: "1.1.1.1 o 2606:4700:4700::1111",
    hint: "IPv4 (a.b.c.d) o IPv6 (grupos hex, se admite ::)",
    lookup: "Buscar PTR",
    looking: "Buscando...",
    lookupFailed: "La b\u00fasqueda DNS inversa fall\u00f3.",
    invalidIp: "Direcci\u00f3n IP no v\u00e1lida. Introduce una IPv4 o IPv6.",
    resolving: "Resolviendo",
    ptrFound: "Registros PTR",
    noPtr: "Sin registro PTR",
    noPtrHint: "El propietario de la IP no ha publicado registro DNS inverso. Es com\u00fan en IPs residenciales y algunos rangos cloud; puede afectar la entregabilidad de correo.",
  },
} as const;
export function getReverseDns(lang: Lang) { return reverseDnsI18n[lang]; }


// ─── SiteSpeed ───────────────────────────────────────────────────────────────

export const siteSpeedI18n = {
  en: {
    urlLabel: "URL",
    placeholder: "https://example.com",
    formFactor: "Form factor",
    mobile: "Mobile",
    desktop: "Desktop",
    check: "Check site speed",
    checking: "Checking...",
    checkFailed: "Site speed lookup failed. Try again.",
    configMissing: "This tool is not yet configured. Add a Chrome UX Report API key.",
    notEnoughDataTitle: "Not enough real-user data",
    notEnoughDataExplanation: "The Chrome UX Report only includes origins with sufficient Chrome traffic. Low-traffic sites have no aggregated data; try running PageSpeed Insights for a synthetic measurement.",
    scope: "Scope",
    coreWebVitals: "Core Web Vitals",
    otherMetrics: "Other metrics",
    ratingGood: "Good",
    ratingNeedsImprovement: "Needs improvement",
    ratingPoor: "Poor",
    ratingNoData: "No data",
    footnote: "Source: Chrome User Experience Report (real-user 75th percentile across 28 days).",
  },
  es: {
    urlLabel: "URL",
    placeholder: "https://ejemplo.com",
    formFactor: "Dispositivo",
    mobile: "M\u00f3vil",
    desktop: "Escritorio",
    check: "Comprobar velocidad",
    checking: "Comprobando...",
    checkFailed: "La consulta de velocidad fall\u00f3. Int\u00e9ntalo de nuevo.",
    configMissing: "Esta herramienta a\u00fan no est\u00e1 configurada. A\u00f1ade una API key de Chrome UX Report.",
    notEnoughDataTitle: "Datos de usuarios reales insuficientes",
    notEnoughDataExplanation: "El Chrome UX Report solo incluye or\u00edgenes con suficiente tr\u00e1fico de Chrome. Los sitios de poco tr\u00e1fico no tienen datos agregados; prueba PageSpeed Insights para una medida sint\u00e9tica.",
    scope: "\u00c1mbito",
    coreWebVitals: "Core Web Vitals",
    otherMetrics: "Otras m\u00e9tricas",
    ratingGood: "Bueno",
    ratingNeedsImprovement: "Mejorable",
    ratingPoor: "Deficiente",
    ratingNoData: "Sin datos",
    footnote: "Fuente: Chrome User Experience Report (percentil 75 de usuarios reales durante 28 d\u00edas).",
  },
} as const;
export function getSiteSpeed(lang: Lang) { return siteSpeedI18n[lang]; }


// ─── ResolverCompare ─────────────────────────────────────────────────────────

export const resolverCompareI18n = {
  en: {
    domainLabel: "Domain Name",
    placeholder: "example.com",
    recordType: "Record Type",
    compare: "Compare resolvers",
    comparing: "Comparing...",
    lookupFailed: "Resolver comparison failed.",
    consistent: "All resolvers agree",
    inconsistent: "Divergent answers",
    consistentHint: "Every resolver returned the same answer set. DNS has converged globally.",
    inconsistentHint: "Resolvers returned {n} different answer sets. This can happen during propagation, with GeoDNS, or if a resolver is caching a stale record.",
    resolverResults: "Per-resolver results",
    record: "record",
    records: "records",
  },
  es: {
    domainLabel: "Nombre de Dominio",
    placeholder: "ejemplo.com",
    recordType: "Tipo de Registro",
    compare: "Comparar resolvers",
    comparing: "Comparando...",
    lookupFailed: "La comparaci\u00f3n de resolvers fall\u00f3.",
    consistent: "Todos los resolvers coinciden",
    inconsistent: "Respuestas divergentes",
    consistentHint: "Todos los resolvers devuelven la misma respuesta. El DNS ha convergido globalmente.",
    inconsistentHint: "Los resolvers devolvieron {n} conjuntos de respuestas diferentes. Puede ocurrir durante la propagaci\u00f3n, con GeoDNS, o si un resolver cachea un registro obsoleto.",
    resolverResults: "Resultados por resolver",
    record: "registro",
    records: "registros",
  },
} as const;
export function getResolverCompare(lang: Lang) { return resolverCompareI18n[lang]; }


// ─── SslChecker ─────────────────────────────────────────────────────────────

export const sslCheckerI18n = {
  en: {
    domainLabel: "Domain", placeholder: "example.com", check: "Check SSL", checking: "Checking...",
    checkFailed: "SSL check failed. Try again.", sslStatus: "SSL/TLS Status",
    secure: "HTTPS Secure", insecure: "HTTPS Failed", notSet: "Not set (recommended)",
    certificates: "Certificates", issuer: "Issuer", validFrom: "Valid from", validUntil: "Valid until",
    activeCertificate: "Active certificate",
    certHistory: "Recent certificates",
    sans: "Subject Alternative Names",
    more: "more",
    expired: "Expired",
    expiresToday: "Expires today",
    expires1Day: "Expires in 1 day",
    expiresInDays: "Expires in {days} days",
    unknownExpiry: "Expiry unknown",
    hstsEnabled: "HSTS enabled",
    preloadEligible: "Preload-eligible",
    preloadNeeds: "(needs max-age \u2265 1y + includeSubDomains + preload)",
    yes: "Yes",
    no: "No",
  },
  es: {
    domainLabel: "Dominio", placeholder: "ejemplo.com", check: "Verificar SSL", checking: "Verificando...",
    checkFailed: "La verificaci\u00f3n SSL fall\u00f3. Int\u00e9ntalo de nuevo.", sslStatus: "Estado SSL/TLS",
    secure: "HTTPS Seguro", insecure: "HTTPS Fall\u00f3", notSet: "No configurado (recomendado)",
    certificates: "Certificados", issuer: "Emisor", validFrom: "V\u00e1lido desde", validUntil: "V\u00e1lido hasta",
    activeCertificate: "Certificado activo",
    certHistory: "Certificados recientes",
    sans: "Nombres alternativos del sujeto",
    more: "m\u00e1s",
    expired: "Caducado",
    expiresToday: "Caduca hoy",
    expires1Day: "Caduca en 1 d\u00eda",
    expiresInDays: "Caduca en {days} d\u00edas",
    unknownExpiry: "Caducidad desconocida",
    hstsEnabled: "HSTS activo",
    preloadEligible: "Elegible para preload",
    preloadNeeds: "(necesita max-age \u2265 1a\u00f1o + includeSubDomains + preload)",
    yes: "S\u00ed",
    no: "No",
  },
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


// ─── PortScan ───────────────────────────────────────────────────────────────

export const portScanI18n = {
  en: {
    hostLabel: "Host",
    placeholder: "example.com",
    customPortsLabel: "Custom ports (optional)",
    customPortsPlaceholder: "80, 443, 8080, 3000...",
    customPortsHint: "Leave empty to scan 17 common ports. Max 5 custom ports, range 1-65535.",
    scan: "Scan Ports",
    scanning: "Scanning...",
    results: "Port Scan Results",
    statusOpen: "Open",
    statusClosed: "Closed",
    statusFiltered: "Filtered",
    statusUnverifiable: "Unverifiable",
    colPort: "Port",
    colService: "Service",
    colStatus: "Status",
    scanFailed: "Port scan failed. Try again.",
    invalidPorts: "Invalid ports. Enter comma-separated numbers between 1 and 65535 (max 5).",
    disclaimer: "This tool uses an HTTP/HTTPS probe from a Cloudflare Worker, not a raw TCP scan. HTTP ports (80, 443, 8080, 8443, etc.) are reliably reported as Open, Closed, or Filtered. Non-HTTP services (SSH, FTP, SMTP, databases...) cannot be validated via HTTP and are reported as Unverifiable when the edge accepts a connection. Filtered means the connection timed out.",
  },
  es: {
    hostLabel: "Host",
    placeholder: "ejemplo.com",
    customPortsLabel: "Puertos personalizados (opcional)",
    customPortsPlaceholder: "80, 443, 8080, 3000...",
    customPortsHint: "Deja vacio para escanear 17 puertos comunes. Max 5 puertos custom, rango 1-65535.",
    scan: "Escanear Puertos",
    scanning: "Escaneando...",
    results: "Resultados del Escaneo de Puertos",
    statusOpen: "Abierto",
    statusClosed: "Cerrado",
    statusFiltered: "Filtrado",
    statusUnverifiable: "No verificable",
    colPort: "Puerto",
    colService: "Servicio",
    colStatus: "Estado",
    scanFailed: "El escaneo de puertos fallo. Intentalo de nuevo.",
    invalidPorts: "Puertos no validos. Introduce numeros separados por comas entre 1 y 65535 (max 5).",
    disclaimer: "Esta herramienta usa una sonda HTTP/HTTPS desde un Cloudflare Worker, no un escaneo TCP real. Los puertos HTTP (80, 443, 8080, 8443, etc.) se reportan con fiabilidad como Abierto, Cerrado o Filtrado. Los servicios no-HTTP (SSH, FTP, SMTP, bases de datos...) no pueden validarse via HTTP y se reportan como No verificable cuando el edge acepta la conexion. Filtrado significa que la conexion expiro.",
  },
} as const;
export function getPortScan(lang: Lang) { return portScanI18n[lang]; }
