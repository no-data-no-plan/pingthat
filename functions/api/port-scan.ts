import { isValidDomain, isBlockedHost, jsonResponse, errorResponse, parseBody, isBodyTooLarge } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

const SERVICES: Record<number, string> = {
  21: "FTP", 22: "SSH", 25: "SMTP", 53: "DNS", 80: "HTTP", 110: "POP3",
  143: "IMAP", 443: "HTTPS", 465: "SMTPS", 587: "Submission", 993: "IMAPS",
  995: "POP3S", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL", 8080: "HTTP-Alt", 8443: "HTTPS-Alt",
};

const DEFAULT_PORTS = [21, 22, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 3306, 3389, 5432, 8080, 8443];

async function checkPort(host: string, port: number): Promise<{ port: number; status: "open" | "closed" | "filtered"; service: string }> {
  const protocol = [443, 8443].includes(port) ? "https" : "http";
  const service = SERVICES[port] || "unknown";
  try {
    await fetch(`${protocol}://${host}:${port}/`, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
      redirect: "manual",
    });
    return { port, status: "open", service };
  } catch (e: any) {
    if (e?.name === "AbortError" || e?.name === "TimeoutError") {
      return { port, status: "filtered", service };
    }
    // Connection refused = port is closed but host is reachable
    if (e?.cause?.code === "ECONNREFUSED" || e?.message?.includes("ECONNREFUSED")) {
      return { port, status: "closed", service };
    }
    return { port, status: "filtered", service };
  }
}

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.host !== "string") return errorResponse(e.missingDomain);

  const host = body.host.trim().toLowerCase();
  if (!isValidDomain(host)) return errorResponse(e.invalidDomain);
  if (isBlockedHost(host)) return errorResponse(e.blockedDomain);

  // Validate optional custom ports array
  let ports = DEFAULT_PORTS;
  if (body.ports !== undefined) {
    if (!Array.isArray(body.ports)) return errorResponse(e.invalidPorts);
    if (body.ports.length === 0 || body.ports.length > 20) return errorResponse(e.invalidPorts);
    for (const p of body.ports) {
      if (typeof p !== "number" || !Number.isInteger(p) || p < 1 || p > 65535) {
        return errorResponse(e.invalidPorts);
      }
    }
    ports = body.ports as number[];
  }

  try {
    const settled = await Promise.allSettled(
      ports.map((port) => checkPort(host, port))
    );

    const results = settled.map((s, i) => {
      if (s.status === "fulfilled") return s.value;
      return { port: ports[i], status: "filtered" as const, service: SERVICES[ports[i]] || "unknown" };
    });

    // Sort by port number
    results.sort((a, b) => a.port - b.port);

    return jsonResponse({ host, results });
  } catch (err: any) {
    let errMsg = e.portScanFailed;
    if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
      errMsg = e.requestTimedOut;
    } else if (err instanceof TypeError) {
      errMsg = e.dnsOrNetwork;
    }
    return jsonResponse({ host, error: errMsg }, 500);
  }
}
