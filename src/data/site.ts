export interface SocialLink {
  label: string;
  href: string;
  handle: string;
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
  emails: Array<{ label: string; address: string }>;
  wechat: { label: string; account: string };
  socialLinks: SocialLink[];
}

export const siteConfig = {
  name: 'Haoo',
  tagline: '让科技改变生活',
  description: '记录数码工具、学习方法与真实使用体验的中文个人博客。',
  navigation: [
    { label: '文章', href: '/posts/' },
    { label: '项目', href: '/projects/' },
    { label: '记录', href: '/records/' },
    { label: '关于', href: '/about/' },
  ],
  emails: [
    { label: 'QQ 邮箱', address: 're11.zhou@qq.com' },
    { label: 'Gmail', address: 're11.zhou@gmail.com' },
  ],
  wechat: { label: '微信公众号', account: 'Haoo Blog' },
  socialLinks: [
    { label: 'Bilibili', href: 'https://space.bilibili.com/438365760', handle: 'Haoo_117c' },
    { label: '少数派', href: 'https://sspai.com/u/6veuyub4/updates', handle: 'Haoo_7' },
    { label: 'GitHub', href: 'https://github.com/QVQSmile', handle: 'QVQSmile' },
  ],
} satisfies SiteConfig;
