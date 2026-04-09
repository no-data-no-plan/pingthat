/**
 * Server-side i18n for API error messages.
 * Supports 'en' and 'es' via ?lang= query parameter.
 */

type SupportedLang = 'en' | 'es';

export function getLang(url: URL): SupportedLang {
  const param = url.searchParams.get('lang');
  return param === 'es' ? 'es' : 'en';
}

export interface ApiErrors {
  // Shared validation errors
  bodyTooLarge: string;
  missingUrl: string;
  missingDomain: string;
  invalidOrBlockedUrl: string;
  invalidDomain: string;
  blockedDomain: string;

  // Network errors (shared across handlers)
  requestTimedOut: string;
  dnsOrNetwork: string;

  // check-site
  connectionFailed: string;
  unreachable: string;
  timedOut: string;

  // http-headers
  couldNotFetchHeaders: string;

  // ssl-checker
  httpsConnectionFailed: string;

  // redirect-checker
  redirectCheckFailed: string;
  redirectToBlockedHost: string;

  // whois-lookup
  whoisLookupFailed: string;
  domainNotFoundInRdap: string;
  rdapError: (status: number) => string;
  responseTooLarge: string;
  invalidRdapResponse: string;

  // email-auth
  emailAuthFailed: string;

  // port-scan
  portScanFailed: string;
  invalidPorts: string;

  // _shared fetchWithManualRedirects
  tooManyRedirects: string;
  invalidRedirectTarget: string;
  redirectToNonHttp: string;
}

const errors: Record<SupportedLang, ApiErrors> = {
  en: {
    bodyTooLarge: 'Request body too large',
    missingUrl: 'Missing url',
    missingDomain: 'Missing domain',
    invalidOrBlockedUrl: 'Invalid or blocked URL',
    invalidDomain: 'Invalid domain',
    blockedDomain: 'Blocked domain',

    requestTimedOut: 'Request timed out',
    dnsOrNetwork: 'Could not reach target (DNS or network)',

    connectionFailed: 'Connection failed',
    unreachable: 'Unreachable',
    timedOut: 'Timed out',

    couldNotFetchHeaders: 'Could not fetch headers',

    httpsConnectionFailed: 'HTTPS connection failed',

    redirectCheckFailed: 'Redirect check failed',
    redirectToBlockedHost: 'Redirect to blocked host',

    emailAuthFailed: 'Email authentication check failed',

    portScanFailed: 'Port scan failed',
    invalidPorts: 'Invalid ports: provide 1-20 ports, each between 1 and 65535',

    whoisLookupFailed: 'WHOIS lookup failed',
    domainNotFoundInRdap: 'Domain not found in RDAP',
    rdapError: (status: number) => `RDAP error: ${status}`,
    responseTooLarge: 'Response too large',
    invalidRdapResponse: 'Invalid RDAP response',

    tooManyRedirects: 'Too many redirects',
    invalidRedirectTarget: 'Invalid redirect target',
    redirectToNonHttp: 'Redirect to non-HTTP protocol',
  },
  es: {
    bodyTooLarge: 'Cuerpo de la solicitud demasiado grande',
    missingUrl: 'Falta la URL',
    missingDomain: 'Falta el dominio',
    invalidOrBlockedUrl: 'URL no valida o bloqueada',
    invalidDomain: 'Dominio no valido',
    blockedDomain: 'Dominio bloqueado',

    requestTimedOut: 'La solicitud ha expirado',
    dnsOrNetwork: 'No se pudo conectar al destino (DNS o red)',

    connectionFailed: 'Conexion fallida',
    unreachable: 'Inalcanzable',
    timedOut: 'Tiempo agotado',

    couldNotFetchHeaders: 'No se pudieron obtener las cabeceras',

    httpsConnectionFailed: 'Conexion HTTPS fallida',

    redirectCheckFailed: 'Comprobacion de redireccion fallida',
    redirectToBlockedHost: 'Redireccion a host bloqueado',

    emailAuthFailed: 'La verificacion de autenticacion de email fallo',

    portScanFailed: 'El escaneo de puertos fallo',
    invalidPorts: 'Puertos no validos: proporciona entre 1 y 20 puertos, cada uno entre 1 y 65535',

    whoisLookupFailed: 'Consulta WHOIS fallida',
    domainNotFoundInRdap: 'Dominio no encontrado en RDAP',
    rdapError: (status: number) => `Error RDAP: ${status}`,
    responseTooLarge: 'Respuesta demasiado grande',
    invalidRdapResponse: 'Respuesta RDAP no valida',

    tooManyRedirects: 'Demasiadas redirecciones',
    invalidRedirectTarget: 'Destino de redireccion no valido',
    redirectToNonHttp: 'Redireccion a protocolo no HTTP',
  },
};

export function getApiErrors(lang: SupportedLang): ApiErrors {
  return errors[lang];
}
