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
  email: 're11.zhou@gmail.com',
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/Haoo-7', handle: 'Haoo-7' },
    { label: 'Bilibili', href: 'https://space.bilibili.com/438365760', handle: 'Haoo_117c' },
    { label: 'sspai', href: 'https://sspai.com/u/6veuyub4/updates', handle: 'Haoo_7' },
  ],
} satisfies SiteConfig;
