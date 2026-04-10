import { describe, it, expect } from 'vitest';
import { tools, groups } from './tools';
import { pageI18n, toolNamesI18n, toolDescriptionsI18n, groupLabelsI18n } from '../i18n/pages';
import {
  myIpI18n, ipConverterI18n, jwtDecoderI18n, passwordStrengthI18n,
  privacyCheckI18n, subnetCalculatorI18n, webrtcLeakTestI18n,
  dnsLookupI18n, sslCheckerI18n, isItDownI18n, isItUpI18n,
  httpHeadersI18n, whoisLookupI18n, redirectCheckerI18n, urlParserI18n,
  emailAuthI18n, portScanI18n,
} from '../i18n/components';
import { getCommon } from '../i18n/common';

// ─── pages.ts completeness ────────────────────────────────────────────────────

describe('pageI18n completeness', () => {
  const toolIds = tools.map((t) => t.id);

  it('all tool IDs have an entry in pageI18n', () => {
    for (const id of toolIds) {
      expect(pageI18n[id], `pageI18n missing tool "${id}"`).toBeDefined();
    }
  });

  it('all pageI18n entries have both EN and ES translations', () => {
    for (const [id, langs] of Object.entries(pageI18n)) {
      expect(langs.en, `pageI18n["${id}"].en missing`).toBeDefined();
      expect(langs.es, `pageI18n["${id}"].es missing`).toBeDefined();
    }
  });

  it('all pageI18n entries have matching keys between EN and ES', () => {
    for (const [id, langs] of Object.entries(pageI18n)) {
      const enKeys = Object.keys(langs.en).sort();
      const esKeys = Object.keys(langs.es).sort();
      expect(enKeys, `pageI18n["${id}"] key mismatch`).toEqual(esKeys);
    }
  });

  it('no empty values in pageI18n EN', () => {
    for (const [id, langs] of Object.entries(pageI18n)) {
      for (const [key, val] of Object.entries(langs.en)) {
        if (typeof val === 'string') {
          expect(val.trim().length, `pageI18n["${id}"].en.${key} is empty`).toBeGreaterThan(0);
        }
        if (Array.isArray(val)) {
          expect(val.length, `pageI18n["${id}"].en.${key} is empty array`).toBeGreaterThan(0);
          for (const item of val) {
            expect(typeof item === 'string' && item.trim().length > 0, `pageI18n["${id}"].en.${key} has empty array item`).toBe(true);
          }
        }
      }
    }
  });

  it('no empty values in pageI18n ES', () => {
    for (const [id, langs] of Object.entries(pageI18n)) {
      for (const [key, val] of Object.entries(langs.es)) {
        if (typeof val === 'string') {
          expect(val.trim().length, `pageI18n["${id}"].es.${key} is empty`).toBeGreaterThan(0);
        }
        if (Array.isArray(val)) {
          expect(val.length, `pageI18n["${id}"].es.${key} is empty array`).toBeGreaterThan(0);
          for (const item of val) {
            expect(typeof item === 'string' && item.trim().length > 0, `pageI18n["${id}"].es.${key} has empty array item`).toBe(true);
          }
        }
      }
    }
  });

  it('seoFeatures arrays have same length in EN and ES for each tool', () => {
    for (const [id, langs] of Object.entries(pageI18n)) {
      expect(
        langs.en.seoFeatures.length,
        `pageI18n["${id}"] seoFeatures count mismatch`
      ).toBe(langs.es.seoFeatures.length);
    }
  });
});

// ─── toolNamesI18n completeness ───────────────────────────────────────────────

describe('toolNamesI18n completeness', () => {
  const toolIds = tools.map((t) => t.id);

  it('all tool IDs have toolNamesI18n entry', () => {
    for (const id of toolIds) {
      expect(toolNamesI18n[id], `toolNamesI18n missing "${id}"`).toBeDefined();
    }
  });

  it('all toolNamesI18n entries have EN and ES', () => {
    for (const [id, langs] of Object.entries(toolNamesI18n)) {
      expect(langs.en, `toolNamesI18n["${id}"].en missing`).toBeDefined();
      expect(langs.es, `toolNamesI18n["${id}"].es missing`).toBeDefined();
    }
  });

  it('no empty toolNamesI18n values', () => {
    for (const [id, langs] of Object.entries(toolNamesI18n)) {
      expect(langs.en.trim().length, `toolNamesI18n["${id}"].en is empty`).toBeGreaterThan(0);
      expect(langs.es.trim().length, `toolNamesI18n["${id}"].es is empty`).toBeGreaterThan(0);
    }
  });

  it('toolNamesI18n has no extra keys beyond tools.ts', () => {
    const toolIdSet = new Set(toolIds);
    for (const id of Object.keys(toolNamesI18n)) {
      expect(toolIdSet.has(id), `toolNamesI18n has extra key "${id}"`).toBe(true);
    }
  });
});

// ─── toolDescriptionsI18n completeness ────────────────────────────────────────

describe('toolDescriptionsI18n completeness', () => {
  const toolIds = tools.map((t) => t.id);

  it('all tool IDs have toolDescriptionsI18n entry', () => {
    for (const id of toolIds) {
      expect(toolDescriptionsI18n[id], `toolDescriptionsI18n missing "${id}"`).toBeDefined();
    }
  });

  it('all toolDescriptionsI18n entries have EN and ES', () => {
    for (const [id, langs] of Object.entries(toolDescriptionsI18n)) {
      expect(langs.en.trim().length, `toolDescriptionsI18n["${id}"].en is empty`).toBeGreaterThan(0);
      expect(langs.es.trim().length, `toolDescriptionsI18n["${id}"].es is empty`).toBeGreaterThan(0);
    }
  });
});

// ─── groupLabelsI18n completeness ─────────────────────────────────────────────

describe('groupLabelsI18n completeness', () => {
  it('all group labels from tools.ts have i18n entries', () => {
    for (const group of groups) {
      expect(groupLabelsI18n[group.label], `groupLabelsI18n missing "${group.label}"`).toBeDefined();
    }
  });

  it('all groupLabelsI18n entries have EN and ES', () => {
    for (const [label, langs] of Object.entries(groupLabelsI18n)) {
      expect(langs.en.trim().length, `groupLabelsI18n["${label}"].en is empty`).toBeGreaterThan(0);
      expect(langs.es.trim().length, `groupLabelsI18n["${label}"].es is empty`).toBeGreaterThan(0);
    }
  });
});

// ─── Component i18n key matching ──────────────────────────────────────────────

describe('component i18n key matching (EN vs ES)', () => {
  const componentI18ns: Record<string, { en: Record<string, unknown>; es: Record<string, unknown> }> = {
    myIp: myIpI18n,
    ipConverter: ipConverterI18n,
    jwtDecoder: jwtDecoderI18n,
    passwordStrength: passwordStrengthI18n,
    privacyCheck: privacyCheckI18n,
    subnetCalculator: subnetCalculatorI18n,
    webrtcLeakTest: webrtcLeakTestI18n,
    dnsLookup: dnsLookupI18n,
    sslChecker: sslCheckerI18n,
    isItDown: isItDownI18n,
    isItUp: isItUpI18n,
    httpHeaders: httpHeadersI18n,
    whoisLookup: whoisLookupI18n,
    redirectChecker: redirectCheckerI18n,
    urlParser: urlParserI18n,
    emailAuth: emailAuthI18n,
    portScan: portScanI18n,
  };

  for (const [name, i18n] of Object.entries(componentI18ns)) {
    it(`${name} has matching keys between EN and ES`, () => {
      const enKeys = Object.keys(i18n.en).sort();
      const esKeys = Object.keys(i18n.es).sort();
      expect(enKeys, `${name} key mismatch`).toEqual(esKeys);
    });

    it(`${name} has no empty string values`, () => {
      for (const [key, val] of Object.entries(i18n.en)) {
        if (typeof val === 'string') {
          expect(val.trim().length, `${name}.en.${key} is empty`).toBeGreaterThan(0);
        }
      }
      for (const [key, val] of Object.entries(i18n.es)) {
        if (typeof val === 'string') {
          expect(val.trim().length, `${name}.es.${key} is empty`).toBeGreaterThan(0);
        }
      }
    });
  }
});

// ─── common.ts key matching ───────────────────────────────────────────────────

describe('common i18n key matching', () => {
  it('common EN and ES have matching keys', () => {
    const en = getCommon('en');
    const es = getCommon('es');
    const enKeys = Object.keys(en).sort();
    const esKeys = Object.keys(es).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('common has no empty values', () => {
    for (const lang of ['en', 'es'] as const) {
      const strings = getCommon(lang);
      for (const [key, val] of Object.entries(strings)) {
        expect(val.trim().length, `common.${lang}.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Server-side i18n matching ────────────────────────────────────────────────

describe('server-side API i18n (_i18n.ts)', () => {
  // We import dynamically since it's in functions/api
  it('EN and ES have matching keys (excluding functions)', async () => {
    const { getApiErrors } = await import('../../functions/api/_i18n');
    const en = getApiErrors('en');
    const es = getApiErrors('es');
    // Filter out function-valued keys for simple comparison
    const enKeys = Object.keys(en).filter(k => typeof en[k as keyof typeof en] !== 'function').sort();
    const esKeys = Object.keys(es).filter(k => typeof es[k as keyof typeof es] !== 'function').sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('no empty string values in EN', async () => {
    const { getApiErrors } = await import('../../functions/api/_i18n');
    const en = getApiErrors('en');
    for (const [key, val] of Object.entries(en)) {
      if (typeof val === 'string') {
        expect(val.trim().length, `apiErrors.en.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('no empty string values in ES', async () => {
    const { getApiErrors } = await import('../../functions/api/_i18n');
    const es = getApiErrors('es');
    for (const [key, val] of Object.entries(es)) {
      if (typeof val === 'string') {
        expect(val.trim().length, `apiErrors.es.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('function-valued keys exist in both EN and ES', async () => {
    const { getApiErrors } = await import('../../functions/api/_i18n');
    const en = getApiErrors('en');
    const es = getApiErrors('es');
    const enFnKeys = Object.keys(en).filter(k => typeof en[k as keyof typeof en] === 'function').sort();
    const esFnKeys = Object.keys(es).filter(k => typeof es[k as keyof typeof es] === 'function').sort();
    expect(enFnKeys).toEqual(esFnKeys);
  });
});

// ─── Tool count consistency ───────────────────────────────────────────────────

describe('tool count consistency', () => {
  it('pageI18n has same number of entries as tools.ts', () => {
    expect(Object.keys(pageI18n).length).toBe(tools.length);
  });

  it('toolNamesI18n has same number of entries as tools.ts', () => {
    expect(Object.keys(toolNamesI18n).length).toBe(tools.length);
  });

  it('toolDescriptionsI18n has same number of entries as tools.ts', () => {
    expect(Object.keys(toolDescriptionsI18n).length).toBe(tools.length);
  });

  it('component i18n exports cover all 17 tools', () => {
    // There should be a component i18n for each tool
    const componentCount = [
      myIpI18n, ipConverterI18n, jwtDecoderI18n, passwordStrengthI18n,
      privacyCheckI18n, subnetCalculatorI18n, webrtcLeakTestI18n,
      dnsLookupI18n, sslCheckerI18n, isItDownI18n, isItUpI18n,
      httpHeadersI18n, whoisLookupI18n, redirectCheckerI18n, urlParserI18n,
      emailAuthI18n, portScanI18n,
    ].length;
    expect(componentCount).toBe(tools.length);
  });
});
