import type { Lang } from '../i18n/index';

export type Level = 'ok' | 'warn' | 'bad' | 'info';

const ICON: Record<Level, string> = {
  ok: '✓',
  warn: '!',
  bad: '✕',
  info: 'i',
};

const ARIA: Record<Level, Record<Lang, string>> = {
  ok:   { en: 'OK',      es: 'Correcto' },
  warn: { en: 'Warning', es: 'Advertencia' },
  bad:  { en: 'Problem', es: 'Problema' },
  info: { en: 'Info',    es: 'Información' },
};

export function levelIcon(level: Level): string {
  return ICON[level];
}

export function levelAria(level: Level, lang: Lang = 'en'): string {
  return ARIA[level][lang] ?? ARIA[level].en;
}
