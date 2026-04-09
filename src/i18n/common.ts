import type { Lang } from "./index";

const common = {
  en: {
    // Buttons
    copy: "Copy",
    copyIp: "Copy IP",
    copyReport: "Copy Report",
    copied: "Copied!",
    send: "Send",
    runAgain: "Run Again",
    runTestAgain: "Run Test Again",
    loadExample: "Load Example",
    generateStrong: "Generate Strong",
    show: "Show",
    hide: "Hide",

    // Errors
    requestTimeout: "Request timed out. Please try again.",
    serverError: "Server error. Please try again later.",

    // Status
    yes: "Yes",
    no: "No",
    safe: "Safe",
    exposed: "Exposed",
    note: "Note",
    online: "Online",
    offline: "Offline",
    unknown: "Unknown",
    expired: "Expired",

    // Layout
    networkTools: "Network Tools",
    networkToolsForDevs: "PingThat \u2014 Network tools for developers",
    noDataCollectedPrivate: "No data collected \u00b7 100% private",
    buyMeACoffee: "Buy me a coffee",
    private100: "100% private",
    feedbackPlaceholder: "Bug, idea, or feedback...",
    noDataCollectedFull: "100% free. No signup. No data collected.",
    searchTools: "Search tools...",
    networkToolsUppercase: "NETWORK TOOLS FOR DEVELOPERS",
    related: "Related:",
    noDataDisclaimer: "100% free. No signup. No data collected anywhere.",

    // Landing
    heroEyebrow: "Network Tools",
    heroHeadingPrefix: "Ping, check, ",
    heroHeadingEm: "analyze",
    heroText: "Network diagnostics and developer tools that run entirely in your browser. No data collected, no accounts, no tracking. Your information stays on your device.",
    bottomCtaLabel: "More tools coming soon",
    bottomCtaText: "DNS lookup, port scanner, SSL checker, HTTP headers, and more.",
    footerTagline: "PingThat \u2014 Network tools for developers",
    footerPrivacy: "No data collected. 100% private.",
  },
  es: {
    // Buttons
    copy: "Copiar",
    copyIp: "Copiar IP",
    copyReport: "Copiar Informe",
    copied: "\u00a1Copiado!",
    send: "Enviar",
    runAgain: "Repetir",
    runTestAgain: "Repetir Test",
    loadExample: "Cargar Ejemplo",
    generateStrong: "Generar Segura",
    show: "Mostrar",
    hide: "Ocultar",

    // Errors
    requestTimeout: "La petici\u00f3n ha tardado demasiado. Int\u00e9ntalo de nuevo.",
    serverError: "Error del servidor. Int\u00e9ntalo m\u00e1s tarde.",

    // Status
    yes: "S\u00ed",
    no: "No",
    safe: "Seguro",
    exposed: "Expuesto",
    note: "Nota",
    online: "En l\u00ednea",
    offline: "Sin conexi\u00f3n",
    unknown: "Desconocido",
    expired: "Expirado",

    // Layout
    networkTools: "Herramientas de Red",
    networkToolsForDevs: "PingThat \u2014 Herramientas de red para desarrolladores",
    noDataCollectedPrivate: "Sin recogida de datos \u00b7 100% privado",
    buyMeACoffee: "Inv\u00edtame a un caf\u00e9",
    private100: "100% privado",
    feedbackPlaceholder: "Bug, idea o sugerencia...",
    noDataCollectedFull: "100% gratis. Sin registro. Sin recogida de datos.",
    searchTools: "Buscar herramientas...",
    networkToolsUppercase: "HERRAMIENTAS DE RED PARA DESARROLLADORES",
    related: "Relacionado:",
    noDataDisclaimer: "100% gratis. Sin registro. Tus datos no se recogen ni env\u00edan a ning\u00fan sitio.",

    // Landing
    heroEyebrow: "Herramientas de Red",
    heroHeadingPrefix: "Analiza, comprueba, ",
    heroHeadingEm: "diagnostica",
    heroText: "Herramientas de diagn\u00f3stico de red y desarrollo que se ejecutan \u00edntegramente en tu navegador. Sin recogida de datos, sin cuentas, sin rastreo. Tu informaci\u00f3n permanece en tu dispositivo.",
    bottomCtaLabel: "M\u00e1s herramientas pr\u00f3ximamente",
    bottomCtaText: "B\u00fasqueda DNS, esc\u00e1ner de puertos, comprobador SSL, cabeceras HTTP y m\u00e1s.",
    footerTagline: "PingThat \u2014 Herramientas de red para desarrolladores",
    footerPrivacy: "Sin recogida de datos. 100% privado.",
  },
};

export type CommonStrings = typeof common.en;
export function getCommon(lang: Lang): CommonStrings { return common[lang] as CommonStrings; }
