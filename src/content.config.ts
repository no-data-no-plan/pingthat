import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["monitoring", "dns", "http", "email", "security", "networking"]),
    relatedToolIds: z.array(z.string()).default([]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    lang: z.enum(["en", "es"]),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { docs };
