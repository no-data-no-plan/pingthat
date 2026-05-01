import { describe, it, expect, beforeAll } from "vitest";
import { verifyJwt } from "./jwt-verify";

function utf8(s: string): Uint8Array<ArrayBuffer> {
  const src = new TextEncoder().encode(s);
  const out = new Uint8Array(new ArrayBuffer(src.length));
  out.set(src);
  return out;
}

function b64u(bytes: Uint8Array<ArrayBuffer>): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function spkiToPem(spki: ArrayBuffer): string {
  const bytes = new Uint8Array(spki);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join("\n")}\n-----END PUBLIC KEY-----`;
}

async function makeJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  sign: (signingInput: Uint8Array<ArrayBuffer>) => Promise<Uint8Array<ArrayBuffer>>,
): Promise<string> {
  const h = b64u(utf8(JSON.stringify(header)));
  const p = b64u(utf8(JSON.stringify(payload)));
  const signingInput = `${h}.${p}`;
  const sig = await sign(utf8(signingInput));
  return `${signingInput}.${b64u(sig)}`;
}

async function signHs256(secret: string, data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const out = new Uint8Array(new ArrayBuffer(sig.byteLength));
  out.set(new Uint8Array(sig));
  return out;
}

describe("verifyJwt — HS256", () => {
  const secret = "super-secret-shared-key";
  let goodToken: string;

  beforeAll(async () => {
    goodToken = await makeJwt(
      { alg: "HS256", typ: "JWT" },
      { sub: "1234", name: "John Doe" },
      (d) => signHs256(secret, d),
    );
  });

  it("verifies a valid HS256 token", async () => {
    const r = await verifyJwt(goodToken, secret);
    expect(r).toEqual({ ok: true, alg: "HS256" });
  });

  it("rejects when the secret is wrong", async () => {
    const r = await verifyJwt(goodToken, "wrong-secret");
    expect(r).toEqual({ ok: false, reason: "signature-mismatch" });
  });

  it("rejects an empty key", async () => {
    const r = await verifyJwt(goodToken, "   ");
    expect(r).toEqual({ ok: false, reason: "empty-key" });
  });

  it("rejects when the body has been tampered with", async () => {
    const [h, , s] = goodToken.split(".");
    const tampered = `${h}.${b64u(utf8(JSON.stringify({ sub: "evil" })))}.${s}`;
    const r = await verifyJwt(tampered, secret);
    expect(r).toEqual({ ok: false, reason: "signature-mismatch" });
  });
});

describe("verifyJwt — RS256", () => {
  let goodToken: string;
  let publicPem: string;

  beforeAll(async () => {
    const pair = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"],
    );
    publicPem = spkiToPem(await crypto.subtle.exportKey("spki", pair.publicKey));
    goodToken = await makeJwt(
      { alg: "RS256", typ: "JWT" },
      { sub: "1234" },
      async (d) =>
        new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, d)),
    );
  });

  it("verifies a valid RS256 token with the matching public key", async () => {
    const r = await verifyJwt(goodToken, publicPem);
    expect(r).toEqual({ ok: true, alg: "RS256" });
  });

  it("rejects HMAC-style key for RS256", async () => {
    const r = await verifyJwt(goodToken, "not-a-pem-key");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("invalid-key-format");
  });

  it("rejects signature when payload is tampered", async () => {
    const [h, , s] = goodToken.split(".");
    const tampered = `${h}.${b64u(utf8(JSON.stringify({ sub: "evil" })))}.${s}`;
    const r = await verifyJwt(tampered, publicPem);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("signature-mismatch");
  });
});

describe("verifyJwt — ES256", () => {
  let goodToken: string;
  let publicPem: string;

  beforeAll(async () => {
    const pair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"],
    );
    publicPem = spkiToPem(await crypto.subtle.exportKey("spki", pair.publicKey));
    goodToken = await makeJwt(
      { alg: "ES256", typ: "JWT" },
      { sub: "1234" },
      async (d) =>
        new Uint8Array(
          await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, pair.privateKey, d),
        ),
    );
  });

  it("verifies a valid ES256 token with the matching public key", async () => {
    const r = await verifyJwt(goodToken, publicPem);
    expect(r).toEqual({ ok: true, alg: "ES256" });
  });
});

describe("verifyJwt — security guards", () => {
  it("rejects alg=none even with a key supplied", async () => {
    const noneToken = `${b64u(utf8(JSON.stringify({ alg: "none", typ: "JWT" })))}.${b64u(utf8(JSON.stringify({ sub: "x" })))}.`;
    const r = await verifyJwt(noneToken, "anything");
    expect(r).toEqual({ ok: false, reason: "alg-none-rejected" });
  });

  it("rejects unsupported algorithms (HS512, RS384, etc)", async () => {
    const t = `${b64u(utf8(JSON.stringify({ alg: "HS512", typ: "JWT" })))}.${b64u(utf8(JSON.stringify({ sub: "x" })))}.aaaa`;
    const r = await verifyJwt(t, "secret");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe("unsupported-alg");
      expect(r.detail).toBe("HS512");
    }
  });

  it("rejects malformed tokens (not three dot-separated parts)", async () => {
    const r = await verifyJwt("not.a.valid.jwt", "secret");
    expect(r).toEqual({ ok: false, reason: "malformed-token" });
  });

  it("rejects when expectedAlg differs from header alg", async () => {
    const goodToken = await makeJwt(
      { alg: "HS256", typ: "JWT" },
      { sub: "x" },
      (d) => signHs256("s", d),
    );
    const r = await verifyJwt(goodToken, "s", "RS256");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("alg-mismatch");
  });
});
