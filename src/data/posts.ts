import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;

const kindLabel = { essay: 'Essay', review: 'Review', research: 'Research' } as const;
const platformLabel: Record<string, string> = { sspai: 'sspai', wechat: 'WeChat' };

export const month = (d: Date) => d.toISOString().slice(0, 7);
export const kind = (post: Post) => kindLabel[post.data.kind];
export const platforms = (post: Post) => post.data.externalPublications.map((p) => platformLabel[p.platform] ?? p.platform);
export const readingMinutes = (post: Post) => Math.max(1, Math.ceil((post.body ?? '').replace(/<[^>]*>/g, '').length / 450));

// 列表里一行元信息：2026-03 · Essay · sspai, WeChat · In Chinese
export const postMeta = (post: Post) =>
  [month(post.data.pubDate), kind(post), platforms(post).join(', '), 'In Chinese'].filter(Boolean).join(' · ');

// 阅读器屏幕上的一页
export const readerItem = (post: Post, i: number, total: number) => ({
  meta: `${kind(post)} · ${month(post.data.pubDate)}`,
  title: post.data.shortEn ?? post.data.titleEn ?? post.data.title,
  dek: post.data.dekEn ?? post.data.description,
  n: `${i + 1} / ${total}`,
  source: `${readingMinutes(post)} min`,
});
