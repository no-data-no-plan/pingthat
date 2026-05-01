/**
 * Client-side JWT signature verification using Web Crypto.
 *
 * Privacy: keys/secrets never leave the browser — matches the JWT decoder's
 * "your token never leaves your browser" guarantee. No network roundtrips.
 *
 * Supports HS256, RS256, ES256 (the three most common JWT algorithms).
 * Explicitly rejects `alg=none` even if the caller supplies a key.
 */

export type JwtAlg = "HS256" | "RS256" | "ES256";

export type VerifyReason =
  | "malformed-token"
  | "unsupported-alg"
  | "alg-none-rejected"
  | "alg-mismatch"
  | "empty-key"
  | "invalid-key-format"
  | "signature-mismatch";

export type VerifyResult =
  | { ok: true; alg: JwtAlg }
  | { ok: false; reason: VerifyReason; detail?: string };

const SUPPORTED_ALGS: JwtAlg[] = ["HS256", "RS256", "ES256"];

function base64UrlToBytes(s: string): Uint8Array<ArrayBuffer> {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad === 1) throw new Error("invalid-base64url");
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function utf8(s: string): Uint8Array<ArrayBuffer> {
  const src = new TextEncoder().encode(s);
  const out = new Uint8Array(new ArrayBuffer(src.length));
  out.set(src);
  return out;
}

function pemToSpki(pem: string): Uint8Array<ArrayBuffer> {
  const cleaned = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  if (!cleaned) throw new Error("empty-pem");
  const bin = atob(cleaned);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function looksLikePem(s: string): boolean {
  return /-----BEGIN [A-Z ]*PUBLIC KEY-----/.test(s);
}

function isAlg(value: unknown): value is JwtAlg {
  return typeof value === "string" && (SUPPORTED_ALGS as string[]).includes(value);
}

interface ParsedJwt {
  alg: string;
  signingInput: Uint8Array<ArrayBuffer>;
  signature: Uint8Array<ArrayBuffer>;
}

function parseJwt(token: string): ParsedJwt | null {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  if (!h || !p) return null;
  let header: { alg?: unknown };
  try {
    const headerStr = new TextDecoder().decode(base64UrlToBytes(h));
    header = JSON.parse(headerStr);
  } catch {
    return null;
  }
  if (typeof header.alg !== "string") return null;
  let signature: Uint8Array<ArrayBuffer>;
  try {
    signature = base64UrlToBytes(s);
  } catch {
    return null;
  }
  return {
    alg: header.alg,
    signingInput: utf8(`${h}.${p}`),
    signature,
  };
}

export async function verifyJwt(
  token: string,
  key: string,
  expectedAlg?: JwtAlg,
): Promise<VerifyResult> {
  const parsed = parseJwt(token);
  if (!parsed) return { ok: false, reason: "malformed-token" };

  const algLower = parsed.alg.toLowerCase();
  if (algLower === "none") return { ok: false, reason: "alg-none-rejected" };

  if (!isAlg(parsed.alg)) {
    return { ok: false, reason: "unsupported-alg", detail: parsed.alg };
  }

  if (expectedAlg && expectedAlg !== parsed.alg) {
    return {
      ok: false,
      reason: "alg-mismatch",
      detail: `token=${parsed.alg} expected=${expectedAlg}`,
    };
  }

  if (!key.trim()) return { ok: false, reason: "empty-key" };

  try {
    const cryptoKey = await importKey(parsed.alg, key);
    const valid = await verifySignature(parsed.alg, cryptoKey, parsed.signature, parsed.signingInput);
    return valid ? { ok: true, alg: parsed.alg } : { ok: false, reason: "signature-mismatch" };
  } catch (e) {
    return {
      ok: false,
      reason: "invalid-key-format",
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function importKey(alg: JwtAlg, key: string): Promise<CryptoKey> {
  if (alg === "HS256") {
    return crypto.subtle.importKey(
      "raw",
      utf8(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
  }
  if (!looksLikePem(key)) {
    throw new Error("expected PEM-encoded public key (-----BEGIN PUBLIC KEY-----)");
  }
  const spki = pemToSpki(key);
  if (alg === "RS256") {
    return crypto.subtle.importKey(
      "spki",
      spki,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
  }
  return crypto.subtle.importKey(
    "spki",
    spki,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
}

async function verifySignature(
  alg: JwtAlg,
  key: CryptoKey,
  signature: Uint8Array<ArrayBuffer>,
  data: Uint8Array<ArrayBuffer>,
): Promise<boolean> {
  if (alg === "HS256") {
    return crypto.subtle.verify("HMAC", key, signature, data);
  }
  if (alg === "RS256") {
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
  }
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, signature, data);
}
