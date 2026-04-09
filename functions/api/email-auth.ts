import { isValidDomain, isBlockedHost, jsonResponse, errorResponse, parseBody, isBodyTooLarge } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

const DKIM_SELECTORS = ["google", "default", "selector1", "selector2", "k1", "s1", "s2", "mail", "dkim"];

async function queryDns(name: string, type: string): Promise<string[]> {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) throw new Error(`DNS query failed: ${res.status}`);
  const data = await res.json() as any;
  const typeCode = type === "TXT" ? 16 : 0;
  return (data.Answer || [])
    .filter((a: any) => a.type === typeCode)
    .map((a: any) => (a.data || "").replace(/^"|"$/g, "").replace(/"\s*"/g, ""));
}

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.domain !== "string") return errorResponse(e.missingDomain);

  const domain = body.domain.trim().toLowerCase();
  if (!isValidDomain(domain)) return errorResponse(e.invalidDomain);
  if (isBlockedHost(domain)) return errorResponse(e.blockedDomain);

  try {
    // Query SPF
    const txtRecords = await queryDns(domain, "TXT");
    const spfRecord = txtRecords.find((r) => r.startsWith("v=spf1")) || null;
    const spfAssessment = spfRecord ? "pass" : "fail";

    // Query DMARC
    const dmarcRecords = await queryDns(`_dmarc.${domain}`, "TXT");
    const dmarcRecord = dmarcRecords.find((r) => r.startsWith("v=DMARC1")) || null;
    let dmarcPolicy: string | null = null;
    let dmarcAssessment: "pass" | "warning" | "fail" = "fail";
    if (dmarcRecord) {
      const policyMatch = dmarcRecord.match(/;\s*p=(\w+)/);
      dmarcPolicy = policyMatch ? policyMatch[1] : null;
      if (dmarcPolicy === "reject" || dmarcPolicy === "quarantine") {
        dmarcAssessment = "pass";
      } else if (dmarcPolicy === "none") {
        dmarcAssessment = "warning";
      } else {
        dmarcAssessment = "warning";
      }
    }

    // Query DKIM (try common selectors in parallel)
    let dkimSelectors: { selector: string; record: string }[] = [];
    let dkimAssessment: "pass" | "warning" | "fail" = "fail";
    try {
      const dkimResults = await Promise.all(
        DKIM_SELECTORS.map(async (selector) => {
          const records = await queryDns(`${selector}._domainkey.${domain}`, "TXT");
          const dkimRecord = records.find((r) => r.includes("v=DKIM1") || r.includes("k=rsa") || r.includes("p="));
          return dkimRecord ? { selector, record: dkimRecord } : null;
        })
      );
      dkimSelectors = dkimResults.filter((r): r is { selector: string; record: string } => r !== null);
      if (dkimSelectors.length > 1) {
        dkimAssessment = "pass";
      } else if (dkimSelectors.length === 1) {
        dkimAssessment = "warning";
      }
    } catch {
      dkimAssessment = "fail";
    }

    return jsonResponse({
      domain,
      spf: { found: !!spfRecord, record: spfRecord, assessment: spfAssessment },
      dmarc: { found: !!dmarcRecord, record: dmarcRecord, policy: dmarcPolicy, assessment: dmarcAssessment },
      dkim: { found: dkimSelectors.length > 0, selectors: dkimSelectors, assessment: dkimAssessment },
    });
  } catch (err: any) {
    let errMsg = e.emailAuthFailed;
    if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
      errMsg = e.requestTimedOut;
    } else if (err instanceof TypeError) {
      errMsg = e.dnsOrNetwork;
    }
    return jsonResponse({ domain, error: errMsg }, 500);
  }
}
