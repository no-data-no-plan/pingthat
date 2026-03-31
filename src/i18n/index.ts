export type Lang = "en" | "es";

export function getLangFromUrl(url: URL): Lang {
  return url.pathname.startsWith("/es") ? "es" : "en";
}

/** Get the equivalent path in the other language */
export function getAlternatePath(path: string, targetLang: Lang): string {
  if (targetLang === "es") {
    return `/es${path === "/" ? "" : path}`;
  }
  // Remove /es prefix
  const stripped = path.replace(/^\/es/, "") || "/";
  return stripped;
}

/** Get the canonical path (without /es prefix) */
export function getCanonicalPath(path: string): string {
  return path.replace(/^\/es/, "") || "/";
}
