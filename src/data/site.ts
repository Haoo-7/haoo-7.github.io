export interface SocialLink {
  label: string;
  href: string;
  handle: string;
  kind: 'link' | 'mail' | 'qr';
  icon: string;
  short: string;
  primary?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  navigation: NavItem[];
  email: string;
  socialLinks: SocialLink[];
}

export const siteConfig = {
  name: 'Haoo',
  tagline: 'Life, Tech & History',
  description: 'Haoo is a history student who builds like an engineer. Projects, essays, tech reviews and some history research.',
  navigation: [
    { label: 'Work', href: '/work/' },
    { label: 'Writing', href: '/writing/' },
    { label: 'About', href: '/about/' },
  ],
  email: 're11.zhou@qq.com',
  // 七张邮票：两张邮箱票（主邮箱在前）、四张链接票、一张公众号二维码票
  socialLinks: [
    { label: 'QQ Mail', href: 'mailto:re11.zhou@qq.com', handle: 're11.zhou@qq.com', kind: 'mail', icon: 'qq.svg', short: 're11.zhou@qq' },
    { label: 'Gmail', href: 'mailto:re11.zhou@gmail.com', handle: 're11.zhou@gmail.com', kind: 'mail', icon: 'gmail.svg', short: 're11.zhou@gmail' },
    { label: 'GitHub', href: 'https://github.com/Haoo-7', handle: 'Haoo-7', kind: 'link', icon: 'github.svg', short: 'Haoo-7', primary: true },
    { label: 'sspai', href: 'https://sspai.com/u/6veuyub4/updates', handle: 'Haoo_7', kind: 'link', icon: 'sspai.svg', short: 'Haoo_7', primary: true },
    { label: 'Bilibili', href: 'https://space.bilibili.com/438365760', handle: 'Haoo_117c', kind: 'link', icon: 'bilibili.svg', short: 'Haoo_117c', primary: true },
    { label: 'Xiaohongshu', href: 'https://www.xiaohongshu.com/user/profile/65464d64000000000d005c9b', handle: 'Haoo', kind: 'link', icon: 'xiaohongshu.svg', short: 'Haoo', primary: true },
    { label: 'WeChat', href: '', handle: '公众号', kind: 'qr', icon: 'wechat.svg', short: '公众号' },
  ],
} satisfies SiteConfig;
