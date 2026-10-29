import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Missing site URL');
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const pages = [
    ...['/', '/work/', '/writing/', '/about/'].map((path) => ({ path, lastmod: undefined })),
    ...posts.map(({ slug, data }) => ({
      path: `/writing/${slug}/`,
      lastmod: data.pubDate.toISOString(),
    })),
  ];
  const urls = pages.map(({ path, lastmod }) => {
    const loc = new URL(path, site).href.replaceAll('&', '&amp;');
    return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  }).join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
