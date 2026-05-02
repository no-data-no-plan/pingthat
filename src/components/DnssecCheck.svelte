<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getDnssecCheck } from '../i18n/components';
  import { readQuery, updateQuery } from '../lib/share-state';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getDnssecCheck(lang));

  type Overall = "secure" | "bogus" | "insecure" | "partial";

  interface DnskeyRecord { flags: number; algorithm: number; keyTag?: number; raw: string; }
  interface DsRecord { keyTag: number; algorithm: number; digestType: number; digest: string; raw: string; }
  interface DnssecState {
    domain: string;
    dnskeyCount: number;
    dnskeys: DnskeyRecord[];
    dsCount: number;
    dsRecords: DsRecord[];
    validated: boolean;
    bogus: boolean;
    authoritative: boolean;
    overall: Overall;
  }

  let domain = $state("");
  let state = $state<DnssecState | null>(null);
  let loading = $state(false);
  let error = $state("");
  let requestId = $state(0);

  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  async function doh(name: string, type: string, cd = false): Promise<any> {
    const params = `name=${encodeURIComponent(name)}&type=${type}${cd ? "&cd=1" : ""}`;
    const res = await fetch(`https://cloudflare-dns.com/dns-query?${params}`, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("DNS query failed");
    return res.json();
  }

  function parseDnskey(raw: string): DnskeyRecord | null {
    // Format: "<flags> <protocol> <algorithm> <base64 key>"
    const parts = raw.split(/\s+/);
    if (parts.length < 4) return null;
    const flags = parseInt(parts[0], 10);
    const algorithm = parseInt(parts[2], 10);
    if (isNaN(flags) || isNaN(algorithm)) return null;
    return { flags, algorithm, raw };
  }

  const ALGORITHMS: Record<number, string> = {
    5: "RSA/SHA-1", 7: "RSASHA1-NSEC3-SHA1", 8: "RSA/SHA-256", 10: "RSA/SHA-512",
    13: "ECDSA P-256/SHA-256", 14: "ECDSA P-384/SHA-384", 15: "Ed25519", 16: "Ed448",
  };

  const ALGORITHM_NAMES: Record<string, number> = {
    RSASHA1: 5, RSASHA1NSEC3SHA1: 7, RSASHA256: 8, RSASHA512: 10,
    ECDSAP256SHA256: 13, ECDSAP384SHA384: 14, ED25519: 15, ED448: 16,
  };

  function parseAlgorithm(token: string): number {
    const num = parseInt(token, 10);
    if (!isNaN(num)) return num;
    const key = token.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return ALGORITHM_NAMES[key] ?? NaN;
  }

  function parseDs(raw: string): DsRecord | null {
    // DoH returns either "<key tag> <algo num> <digest type> <digest>"
    // or "<key tag> <ALGO NAME> <digest type> <digest>" (e.g. ECDSAP256SHA256).
    const parts = raw.split(/\s+/);
    if (parts.length < 4) return null;
    const keyTag = parseInt(parts[0], 10);
    const algorithm = parseAlgorithm(parts[1]);
    const digestType = parseInt(parts[2], 10);
    const digest = parts.slice(3).join("").toLowerCase();
    if (isNaN(keyTag) || isNaN(algorithm) || isNaN(digestType) || digest.length === 0) return null;
    return { keyTag, algorithm, digestType, digest, raw };
  }

  function algorithmName(n: number): string {
    if (isNaN(n)) return "Unknown";
    return ALGORITHMS[n] || `Algorithm ${n}`;
  }

  // CW-PT-04 / Theme A (2026-05-02): Hydrate from URL so chains preserve
  // domain context.
  onMount(() => {
    const q = readQuery(["domain"]);
    if (q.domain) {
      domain = q.domain;
      runCheck();
    }
  });

  async function runCheck() {
    if (!domain.trim()) return;
    requestId++;
    const myId = requestId;
    loading = true; error = ""; state = null;

    const target = domain.trim().toLowerCase();
    if (!domainRegex.test(target)) {
      error = t.invalidDomain;
      loading = false;
      return;
    }
    updateQuery({ domain: target });

    try {
      const [dnskey, ds, validated] = await Promise.all([
        doh(target, "DNSKEY"),
        doh(target, "DS"),
        doh(target, "A"),
      ]);
      if (myId !== requestId) return;

      const dnskeyAnswers = (dnskey.Answer || []).filter((r: any) => r.type === 48);
      const dsAnswers = (ds.Answer || []).filter((r: any) => r.type === 43);
      const dnskeys = dnskeyAnswers.map((r: any) => parseDnskey(r.data)).filter((r: DnskeyRecord | null): r is DnskeyRecord => r !== null);
      const dsRecords = dsAnswers.map((r: any) => parseDs(r.data)).filter((r: DsRecord | null): r is DsRecord => r !== null);

      const isValidated = validated.AD === true && validated.Status === 0 && (validated.Answer || []).length > 0;
      // Bogus: parent published DS (chain of trust claimed) and resolver SERVFAILs on A lookup.
      // Validating resolvers won't return DNSKEY records for a bogus zone, so we detect via Status 2 + DS present.
      const isBogus = validated.Status === 2 && dsRecords.length > 0;
      const authoritative = validated.Status === 0;

      let overall: Overall;
      if (isBogus) overall = "bogus";
      else if (dnskeys.length > 0 && dsRecords.length > 0 && isValidated) overall = "secure";
      else if (dnskeys.length > 0 && dsRecords.length === 0) overall = "partial";
      else overall = "insecure";

      state = {
        domain: target,
        dnskeyCount: dnskeys.length,
        dnskeys,
        dsCount: dsRecords.length,
        dsRecords,
        validated: isValidated,
        bogus: isBogus,
        authoritative,
        overall,
      };
    } catch (e: any) {
      if (myId !== requestId) return;
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        error = lang === 'es' ? 'La petici\u00f3n ha tardado demasiado. Int\u00e9ntalo de nuevo.' : 'Request timed out. Please try again.';
      } else {
        error = t.lookupFailed;
      }
    } finally {
      if (myId === requestId) loading = false;
    }
  }

  function overallColor(o: Overall): string {
    if (o === "secure") return "var(--color-green, #22c55e)";
    if (o === "bogus") return "var(--color-red, #ef4444)";
    if (o === "partial") return "var(--color-yellow, #eab308)";
    return "var(--color-text-muted, #64748b)";
  }

  function overallLabel(o: Overall): string {
    if (o === "secure") return t.statusSecure;
    if (o === "bogus") return t.statusBogus;
    if (o === "partial") return t.statusPartial;
    return t.statusInsecure;
  }

  function overallExplanation(o: Overall): string {
    if (o === "secure") return t.explainSecure;
    if (o === "bogus") return t.explainBogus;
    if (o === "partial") return t.explainPartial;
    return t.explainInsecure;
  }
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="dnssec-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="dnssec-domain" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={domain} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && runCheck()} style="width: 100%;" />
      <button class="btn-primary" onclick={runCheck} disabled={loading || !domain.trim()}>
        {loading ? t.checking : t.check}
      </button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}
    <div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>
  {/if}

  {#if state}
    <div class="card" style="border-left: 3px solid {overallColor(state.overall)}; margin-bottom: 16px;">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
          <div>
            <div style="font-weight: 700; font-size: 16px; color: {overallColor(state.overall)};">{overallLabel(state.overall)}</div>
            <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">{overallExplanation(state.overall)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header"><span class="card-title">{t.checksTitle}</span></div>
      <div class="card-body space-y-2">
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border);">
          <div>
            <div style="font-weight: 600; font-size: 13px;">{t.dnskeyLabel}</div>
            <div style="font-size: 11px; color: var(--color-text-muted);">{t.dnskeyHint}</div>
          </div>
          <div style="font-family: monospace; font-weight: 600; color: {state.dnskeyCount > 0 ? 'var(--color-green)' : 'var(--color-text-muted)'};">
            {state.dnskeyCount > 0 ? `\u2713 ${state.dnskeyCount}` : t.none}
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border);">
          <div>
            <div style="font-weight: 600; font-size: 13px;">{t.dsLabel}</div>
            <div style="font-size: 11px; color: var(--color-text-muted);">{t.dsHint}</div>
          </div>
          <div style="font-family: monospace; font-weight: 600; color: {state.dsCount > 0 ? 'var(--color-green)' : 'var(--color-text-muted)'};">
            {state.dsCount > 0 ? `\u2713 ${state.dsCount}` : t.none}
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
          <div>
            <div style="font-weight: 600; font-size: 13px;">{t.validationLabel}</div>
            <div style="font-size: 11px; color: var(--color-text-muted);">{t.validationHint}</div>
          </div>
          <div style="font-family: monospace; font-weight: 600; color: {state.bogus ? 'var(--color-red)' : state.validated ? 'var(--color-green)' : 'var(--color-text-muted)'};">
            {state.bogus ? t.bogus : state.validated ? t.validated : t.notValidated}
          </div>
        </div>
      </div>
    </div>

    {#if state.dsRecords.length > 0}
      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header"><span class="card-title">{t.dsRecordsTitle} ({state.dsRecords.length})</span></div>
        <div class="card-body" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-border);">
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colKeyTag}</th>
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colAlgorithm}</th>
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colDigest}</th>
              </tr>
            </thead>
            <tbody>
              {#each state.dsRecords as r}
                <tr style="border-bottom: 1px solid var(--color-border);">
                  <td style="padding: 6px; font-family: monospace;">{r.keyTag}</td>
                  <td style="padding: 6px; font-size: 12px;">{algorithmName(r.algorithm)}</td>
                  <td style="padding: 6px; font-family: monospace; font-size: 11px; word-break: break-all; color: var(--color-text-muted);">{r.digest}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if state.dnskeys.length > 0}
      <div class="card">
        <div class="card-header"><span class="card-title">{t.dnskeysTitle} ({state.dnskeys.length})</span></div>
        <div class="card-body" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-border);">
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colFlags}</th>
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colKeyType}</th>
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colAlgorithm}</th>
              </tr>
            </thead>
            <tbody>
              {#each state.dnskeys as r}
                <tr style="border-bottom: 1px solid var(--color-border);">
                  <td style="padding: 6px; font-family: monospace;">{r.flags}</td>
                  <td style="padding: 6px; font-size: 12px;">{r.flags === 257 ? t.ksk : r.flags === 256 ? t.zsk : r.flags}</td>
                  <td style="padding: 6px; font-size: 12px;">{algorithmName(r.algorithm)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}
  </div>
</div>
