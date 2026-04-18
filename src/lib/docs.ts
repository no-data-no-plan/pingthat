import { getCollection, type CollectionEntry } from "astro:content";

export type Doc = CollectionEntry<"docs">;
export type Category = Doc["data"]["category"];
export type DocLang = "en" | "es";

export const CATEGORY_ORDER: Category[] = [
  "monitoring",
  "dns",
  "http",
  "email",
  "security",
  "networking",
];

export const CATEGORY_LABELS: Record<DocLang, Record<Category, string>> = {
  en: {
    monitoring: "Uptime & Monitoring",
    dns: "DNS",
    http: "HTTP",
    email: "Email",
    security: "Security",
    networking: "Networking",
  },
  es: {
    monitoring: "Uptime y monitoreo",
    dns: "DNS",
    http: "HTTP",
    email: "Email",
    security: "Seguridad",
    networking: "Redes",
  },
};

export async function getAllDocs(lang: DocLang): Promise<Doc[]> {
  const all = await getCollection("docs");
  return all
    .filter((d) => d.data.lang === lang)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getDocBySlug(slug: string, lang: DocLang): Promise<Doc | undefined> {
  const all = await getCollection("docs");
  return all.find((d) => d.data.lang === lang && docSlug(d) === slug);
}

export async function getDocsByCategory(category: Category, lang: DocLang): Promise<Doc[]> {
  const docs = await getAllDocs(lang);
  return docs.filter((d) => d.data.category === category);
}

export async function getDocsReferencingTool(toolId: string, lang: DocLang, limit = 4): Promise<Doc[]> {
  const docs = await getAllDocs(lang);
  return docs.filter((d) => d.data.relatedToolIds.includes(toolId)).slice(0, limit);
}

export function docSlug(doc: Doc): string {
  const parts = doc.id.split("/");
  return parts[parts.length - 1];
}

export function docPath(doc: Doc): string {
  const slug = docSlug(doc);
  return doc.data.lang === "es" ? `/es/docs/${slug}/` : `/docs/${slug}/`;
}

export function formatDate(date: Date, lang: DocLang): string {
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getAdjacentDocs(currentSlug: string, currentCategory: Category, lang: DocLang): Promise<{ prev: Doc | null; next: Doc | null; categorySiblings: Doc[] }> {
  // Navigate within the same category first; fall back to all docs if only one in category.
  const allInCategory = await getDocsByCategory(currentCategory, lang);
  const sortedCategory = allInCategory.slice().sort((a, b) => a.data.title.localeCompare(b.data.title));
  const fallbackAll = (await getAllDocs(lang)).slice().sort((a, b) => a.data.title.localeCompare(b.data.title));
  const pool = sortedCategory.length > 1 ? sortedCategory : fallbackAll;
  const idx = pool.findIndex((d) => docSlug(d) === currentSlug);
  if (idx === -1) return { prev: null, next: null, categorySiblings: sortedCategory };
  return {
    prev: idx > 0 ? pool[idx - 1] : null,
    next: idx < pool.length - 1 ? pool[idx + 1] : null,
    categorySiblings: sortedCategory,
  };
}
