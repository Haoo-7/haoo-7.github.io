import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { siteConfig } from '../data/site';

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Missing site URL');
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Haoo — Life, Tech & History',
    description: siteConfig.description,
    site,
    items: posts.map(({ slug, data }) => ({
      title: data.title,
      description: data.description,
      pubDate: data.pubDate,
      link: `/writing/${slug}/`,
    })),
    customData: '<language>zh-CN</language>',
  });
};
