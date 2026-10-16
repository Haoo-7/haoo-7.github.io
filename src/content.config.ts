import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tldr: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
    cover: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    externalPublications: z.array(z.object({
      platform: z.string(),
      url: z.string().url()
    })).default([])
  })
});

export const collections = { posts };
