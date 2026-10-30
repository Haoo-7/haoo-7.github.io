export type Lang = 'en' | 'zh';

export const htmlLang = (lang: Lang) => lang === 'zh' ? 'zh-CN' : 'en';

// 先去掉已有的语言前缀，锚点与查询参数随原地址保留
export const pathFor = (path: string, lang: Lang) => {
  const plain = path.replace(/^\/zh(?=\/|[?#]|$)/, '') || '/';
  return lang === 'zh' ? `/zh${plain.startsWith('/') ? plain : `/${plain}`}` : plain;
};
