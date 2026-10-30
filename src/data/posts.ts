import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/lang';

type Post = CollectionEntry<'posts'>;

const kindLabel = { essay: 'Essay', review: 'Review', research: 'Research' } as const;
const platformLabel: Record<string, string> = { sspai: 'sspai', wechat: 'WeChat' };
const platformLabelZh: Record<string, string> = { sspai: '少数派', wechat: '公众号' };

export const month = (d: Date) => d.toISOString().slice(0, 7);
export const kind = (post: Post) => kindLabel[post.data.kind];
export const platforms = (post: Post, lang: Lang = 'en') => post.data.externalPublications.map((p) => (lang === 'zh' ? platformLabelZh : platformLabel)[p.platform] ?? p.platform);
export const readingMinutes = (post: Post) => Math.max(1, Math.ceil((post.body ?? '').replace(/<[^>]*>/g, '').length / 450));

// 列表里一行元信息：2026-03 · Essay · sspai, WeChat · In Chinese
// Writing 页头已经写了语言，列表里可以省掉
export const postMeta = (post: Post, showLanguage = true, lang: Lang = 'en') =>
  [month(post.data.pubDate), kind(post), platforms(post, lang).join(', '), showLanguage && lang === 'en' && 'In Chinese'].filter(Boolean).join(' · ');

// 阅读器屏幕上的一页
export const readerItem = (post: Post, i: number, total: number, lang: Lang = 'en') => ({
  meta: `${kind(post)} · ${month(post.data.pubDate)}`,
  title: lang === 'zh' ? post.data.title : post.data.shortEn ?? post.data.titleEn ?? post.data.title,
  dek: lang === 'zh' ? post.data.description : post.data.dekEn ?? post.data.description,
  n: `${i + 1} / ${total}`,
  source: `${readingMinutes(post)} min`,
});

// 两种语言的文章路由共用排序和下一篇关系
export const postPaths = async () => {
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return posts.map((post, i) => ({
    params: { slug: post.slug },
    props: { post, next: posts[(i + 1) % posts.length] },
  }));
};
