import type { Lang } from "./index";

const common = {
  en: {
    // Buttons
    copy: "Copy",
    copyIp: "Copy IP",
    copyReport: "Copy Report",
    copied: "Copied!",
    // NotifyToast (post-action feedback) — copy success + error + close
    dismiss: "Dismiss",
    copyFailed: "Copy failed",
    downloaded: "Downloaded",
    downloadFailed: "Download failed",
    send: "Send",
    runAgain: "Run Again",
    runTestAgain: "Run Test Again",
    loadExample: "Load Example",
    generateStrong: "Generate Strong",
    show: "Show",
    hide: "Hide",
    cancel: "Cancel",
    cancelled: "Cancelled",
    // Cmd+K palette (stage-3 #4)
    paletteLabel: "Command palette",
    paletteOpen: "Open command palette",
    palettePlaceholder: "Jump to a tool…",
    paletteEmpty: "No tools match",
    paletteNavigate: "navigate",
    paletteGo: "open",
    paletteClose: "close",

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
    noDataCollectedPrivate: "Browser-side \u00b7 queries to public APIs",
    buyMeACoffee: "Buy me a coffee",
    private100: "Browser-side",
    feedbackPlaceholder: "Bug, idea, or feedback...",
    noDataCollectedFull: "Free. No signup. Most tools run in your browser; some query public APIs.",
    searchTools: "Search tools...",
    networkToolsUppercase: "NETWORK TOOLS FOR DEVELOPERS",
    related: "Related:",
    noDataDisclaimer: "Free. No signup. Browser tools (subnet, JWT, password strength) run locally; lookup tools query public APIs (Cloudflare DoH, RDAP, certificate logs). Full per-tool breakdown at /methodology/.",

    // Landing
    heroEyebrow: "Network Tools",
    heroHeadingPrefix: "Ping, check, ",
    heroHeadingEm: "analyze",
    heroText: "Network diagnostics and developer tools. Some run entirely in your browser (subnet math, JWT decoding, password strength); others query public APIs (Cloudflare DoH, RDAP, certificate logs) when they need real internet data. No accounts. See /methodology/ for the per-tool breakdown.",
    bottomCtaLabel: "More tools coming soon",
    bottomCtaText: "DNS lookup, port scanner, SSL checker, HTTP headers, and more.",
    footerTagline: "PingThat \u2014 Network tools for developers",
    footerPrivacy: "Browser-side · public-API queries · AdSense after consent",

    // Identity strip \u2014 Stanford Web Credibility signals (T-02 maintenance,
    // T-04 visible email, T-06 last-verified). Compatible with the warm-dark
    // redesign: when the v2 footer ships, these strings move into the new
    // identity-strip layout unchanged.
    footerSince: "since 2025",
    footerMaintainedBy: "maintained by Marco B. \u2014 solo dev",
    footerSupportEmail: "support@pingthat.dev",
    footerSupportEmailSub: "typically replies within 24h",
    // {{month}} replaced at build time in Layout.astro frontmatter (Bloque 1b).
    footerLastVerified: "Last verified {{month}} \u2014 all 23 tools passing",
    footerMethodology: "Methodology",
    // Per-tool stamp \u2014 short variant of footerLastVerified, sits below the
    // sticky header on every tool page (Stanford T-06 \u2014 visitor sees the
    // maintenance signal before the input field, not only after scrolling).
    toolLastVerified: "Last verified {{month}} \u2014 runs in your browser",
    // SourcesBlock \u2014 primary RFCs/standards per page (Bloque 1b Phase 2).
    // Only rendered when src/data/sources.ts has entries for the slug.
    sourcesHeading: "Sources",
    sourcesNote: "These are the IETF RFCs, NIST publications, and W3C standards the tool implements or queries. Locate them on the IETF Datatracker (datatracker.ietf.org) or the official standards body.",
  },
  es: {
    // Buttons
    copy: "Copiar",
    copyIp: "Copiar IP",
    copyReport: "Copiar Informe",
    copied: "\u00a1Copiado!",
    dismiss: "Cerrar",
    copyFailed: "Error al copiar",
    downloaded: "Descargado",
    downloadFailed: "Error al descargar",
    send: "Enviar",
    runAgain: "Repetir",
    runTestAgain: "Repetir Test",
    loadExample: "Cargar Ejemplo",
    generateStrong: "Generar Segura",
    show: "Mostrar",
    hide: "Ocultar",
    cancel: "Cancelar",
    cancelled: "Cancelado",
    // Cmd+K palette (stage-3 #4)
    paletteLabel: "Paleta de comandos",
    paletteOpen: "Abrir la paleta de comandos",
    palettePlaceholder: "Salta a una herramienta…",
    paletteEmpty: "Ninguna herramienta coincide",
    paletteNavigate: "navegar",
    paletteGo: "abrir",
    paletteClose: "cerrar",

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
    noDataCollectedPrivate: "En el navegador \u00b7 consultas a APIs p\u00fablicas",
    buyMeACoffee: "Inv\u00edtame a un caf\u00e9",
    private100: "En el navegador",
    feedbackPlaceholder: "Bug, idea o sugerencia...",
    noDataCollectedFull: "Gratis. Sin registro. La mayoría de tools corren en tu navegador; algunas consultan APIs públicas.",
    searchTools: "Buscar herramientas...",
    networkToolsUppercase: "HERRAMIENTAS DE RED PARA DESARROLLADORES",
    related: "Relacionado:",
    noDataDisclaimer: "Gratis. Sin registro. Las tools de navegador (subred, JWT, fuerza de contrase\u00f1a) corren localmente; las de consulta usan APIs p\u00fablicas (Cloudflare DoH, RDAP, registros de certs). Detalle por herramienta en /es/methodology/.",

    // Landing
    heroEyebrow: "Herramientas de Red",
    heroHeadingPrefix: "Analiza, comprueba, ",
    heroHeadingEm: "diagnostica",
    heroText: "Herramientas de diagn\u00f3stico de red y desarrollo. Algunas se ejecutan en tu navegador (c\u00e1lculo de subred, decodificaci\u00f3n JWT, fuerza de contrase\u00f1a); otras consultan APIs p\u00fablicas (Cloudflare DoH, RDAP, registros de certificados) cuando necesitan datos reales de internet. Sin cuentas. Detalle por herramienta en /es/methodology/.",
    bottomCtaLabel: "M\u00e1s herramientas pr\u00f3ximamente",
    bottomCtaText: "B\u00fasqueda DNS, esc\u00e1ner de puertos, comprobador SSL, cabeceras HTTP y m\u00e1s.",
    footerTagline: "PingThat \u2014 Herramientas de red para desarrolladores",
    footerPrivacy: "En el navegador · consultas a APIs públicas · AdSense con consentimiento",

    // Identity strip \u2014 Stanford Web Credibility (T-02 mantenimiento,
    // T-04 email visible, T-06 \u00faltima verificaci\u00f3n). Compatible con el
    // redise\u00f1o warm-dark futuro.
    footerSince: "desde 2025",
    footerMaintainedBy: "mantenido por Marco B. \u2014 solo dev",
    footerSupportEmail: "support@pingthat.dev",
    footerSupportEmailSub: "respuesta en menos de 24h",
    footerLastVerified: "\u00daltima verificaci\u00f3n {{month}} \u2014 las 23 herramientas pasando",
    footerMethodology: "Metodolog\u00eda",
    toolLastVerified: "\u00daltima verificaci\u00f3n {{month}} \u2014 corre en tu navegador",
    sourcesHeading: "Fuentes",
    sourcesNote: "Son los RFCs del IETF, las publicaciones del NIST y los est\u00e1ndares del W3C que la herramienta implementa o consulta. Local\u00edzalos en el IETF Datatracker (datatracker.ietf.org) o en el organismo correspondiente.",
  },
};

export type CommonStrings = typeof common.en;
export function getCommon(lang: Lang): CommonStrings { return common[lang] as CommonStrings; }
