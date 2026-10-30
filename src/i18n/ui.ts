import { zh } from './copy-zh';

export const ui = {
  en: {
    meta: {
      home: 'Haoo is a history student who builds like an engineer. Projects, essays, tech reviews and some history research.',
      work: 'Small tools built for real problems: what each one solves, how it works and where to get it.',
      writing: 'Essays, reviews and history research by Haoo, written in Chinese.',
      about: 'Haoo is a history undergrad in Guangzhou who builds like an engineer. About, and how to get in touch.',
    },
    a11y: {
      skip: 'Skip to content',
      home: 'Haoo, home',
      nav: 'Main',
      reading: 'Reading settings',
      smaller: 'Smaller text',
      larger: 'Larger text',
      time: 'Local time in Guangzhou',
      photo: 'Show the next photograph',
      elsewhere: 'Elsewhere',
      stamps: 'Elsewhere stamps',
      qrShow: 'WeChat official account, show QR code',
      qrHide: 'WeChat official account, hide QR code',
      tail: 'Pull the cat’s tail (back to top)',
      contents: 'Contents',
      continue: 'Continue browsing',
      closeNote: 'Close note',
      loading: 'Loading',
      copyFailed: 'Couldn’t copy. Select the address above.',
    },
    alt: {
      life: 'A paperback, a glass of water and earbuds on a desk by the window',
      tech: 'A half-built mechanical keyboard and a bare circuit board on a cutting mat',
      history: 'An open thread-bound book beside a rolled stele rubbing',
      reader: 'An e-reader, a pencil and an open notebook on a wooden desk in morning light',
      dusk: 'The same desk at dusk, the e-reader asleep with a clock on its screen',
      qr: 'QR code for Haoo\'s WeChat official account',
    },
    home: {
      bench: 'Small tools for problems I actually had. One compartment each. The empty ones are on purpose.',
      writing: 'History research is on its way here.',
    },
    work: {
      intro: 'Small tools for problems I actually had. One compartment each.',
    },
    writing: {
      intro: 'Essays on how I study and work, and reviews of the gear I actually use. Written in Chinese, with a short English note on each.',
    },
    about: {
      intro: 'I’m Haoo, a history undergrad who builds like an engineer. This site is where the three parts meet: life, tech and history.',
      chapters: [
        [
          'What I care about is the slow kind of progress: reading on how people grow, keeping notes I actually come back to, and habits that survive a busy term.',
          'Off the desk I play Brawlhalla, casually.',
        ],
        [
          'People who meet me assume I study engineering. I play with AI mostly to study faster, tinker with software and small hardware, and keep the tools that earn a place.',
          'Two of them are on the <a href="/work/">bench</a> right now. The reviews and how-tos are under <a href="/writing/">Writing</a>.',
        ],
        [
          'I study history at Jinan University in Guangzhou. I like reading the past at two scales at once: the long arc of how societies change, and the ordinary people living inside it.',
        ],
      ],
    },
    contact: { sleep: 'Probably at a desk, building something.' },
  },
  zh: {
    meta: zh.meta,
    a11y: {
      skip: '跳到正文',
      home: 'Haoo，首页',
      nav: '主导航',
      reading: '阅读设置',
      smaller: '缩小字号',
      larger: '放大字号',
      time: '广州当地时间',
      photo: '下一张照片',
      elsewhere: '其他平台',
      stamps: '其他平台的邮票',
      qrShow: '公众号，显示二维码',
      qrHide: '公众号，隐藏二维码',
      tail: '拉一下猫尾巴，回到顶部',
      contents: '目录',
      continue: '继续浏览',
      closeNote: '关闭注释',
      loading: '加载中',
      copyFailed: '没能复制，请手动选中上面的邮箱地址。',
    },
    alt: {
      life: '窗边书桌上放着一本平装书、一杯水和一副耳机',
      tech: '切割垫上放着一把装了一半的机械键盘和一块裸露的电路板',
      history: '一本摊开的线装书，旁边是卷起的碑帖拓片',
      reader: '晨光里的木书桌上放着一台阅读器、一支铅笔和一本摊开的笔记本',
      dusk: '傍晚的同一张书桌，阅读器进入待机，屏幕上显示时钟',
      qr: 'Haoo 公众号的二维码',
    },
    home: {
      intro: zh.intro,
      bench: zh.bench,
      writing: zh.writingLater,
      lately: zh.lately,
      egg: zh.latelyEgg,
    },
    work: {
      intro: zh.workIntro,
    },
    writing: {
      intro: zh.writingIntro,
    },
    about: {
      intro: zh.aboutIntro,
      chapters: zh.aboutChapters,
    },
    contact: { sleep: zh.standby },
  },
} as const;
