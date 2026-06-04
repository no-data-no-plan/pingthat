import type { Level } from './severity';
import type { SslCheckerResult } from './api-types';

export type Letter = 'A' | 'B' | 'C' | 'D' | 'F';

/** A/B -> ok, C -> warn, D/F -> bad. Reuses the stage-2 severity colour scale. */
export function letterLevel(letter: Letter): Level {
  if (letter === 'A' || letter === 'B') return 'ok';
  if (letter === 'C') return 'warn';
  return 'bad';
}

/** http-headers: grade by how many of the `max` (=6) recommended headers are present.
 *  missing 0 -> A, 1 -> B, 2 -> C, 3 -> D, 4+ -> F. */
export function gradeFromHeaders(score: number, max: number): { letter: Letter; level: Level } {
  const missing = Math.max(0, max - score);
  const letter: Letter = missing === 0 ? 'A' : missing === 1 ? 'B' : missing === 2 ? 'C' : missing === 3 ? 'D' : 'F';
  return { letter, level: letterLevel(letter) };
}

/** SSL: "HTTPS hardening" grade from cert validity/expiry + HSTS. Evaluated F->D->C->B->A. */
export function gradeFromSsl(result: SslCheckerResult): { letter: Letter; level: Level } {
  const days = result.activeCertificate?.daysRemaining ?? null;
  let letter: Letter;
  if (!result.httpsOk || (days !== null && days < 0)) letter = 'F';
  else if (days !== null && days <= 7) letter = 'D';
  else if (!result.hstsDetails) letter = 'C';
  else if (days !== null && days <= 30) letter = 'B';
  else letter = 'A';
  return { letter, level: letterLevel(letter) };
}
