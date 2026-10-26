import { $, $$, reduce, refresh } from './core';
import { gsap, ScrollTrigger, rises } from './motion';
import { bindReader, bindTray } from './parts';

// 首屏：三个词三帧
const names = ['The reading desk', 'The workbench', 'The archive'];
const panel = $('#panel')!;
const imgs = $$('img', panel);
const ticks = $$('.ticks i', panel);
const words = $$('.words li');
let cur = 1;
let timer = 0;
let wait = 0;
const show = (n: number) => {
  if (n === cur) return;
  cur = n;
  refresh(panel, () => {
    imgs.forEach((im, k) => im.classList.toggle('on', k === cur));
    ticks.forEach((t, k) => t.classList.toggle('on', k === cur));
    $('#fig')!.textContent = '0' + (cur + 1);
    $('#figname')!.textContent = names[cur];
  });
  words.forEach((w, k) => w.classList.toggle('on', k === cur));
};
const stop = () => { clearInterval(timer); clearTimeout(wait); };
const loop = (first = 4200) => {
  stop();
  if (reduce) return;
  wait = window.setTimeout(() => {
    show((cur + 1) % 3);
    timer = window.setInterval(() => show((cur + 1) % 3), 4200);
  }, first);
};
const next = () => { show((cur + 1) % 3); loop(); };
words.forEach((w) => w.addEventListener('mouseenter', () => { show(+w.dataset.i!); loop(); }));
panel.addEventListener('click', next);
panel.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
});
// 进站不碰页面也在轮播；滚出首屏就停，回来接着走
loop(2600);
ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom 20%', onLeave: stop, onEnterBack: () => loop(1200) });

const pick = bindTray($('.bench')!);
const screen = $('[data-screen]')!;
bindReader($('.posts')!, screen);

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // 首次进入：三个词从遮罩里升起，屏幕刷一下亮起
  gsap.from('.words .w', { yPercent: 105, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.1 });
  gsap.from('.intro, .hero .foot', { opacity: 0, y: 14, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.45 });
  refresh(panel);
  rises();

  // 工作台：照片从左揭开并回缩，再依次框出作品
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.tray', start: 'top 70%', once: true } });
  tl.fromTo('.tray .img', { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.1, ease: 'expo.out', transformOrigin: '20% 50%' })
    .from('.works li', { opacity: 0, y: 24, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, '-=.7')
    .add(() => pick('0'), '-=.2');

  // 阅读桌：屏幕在滚到时刷新一次，文章依次落位
  ScrollTrigger.create({ trigger: screen, start: 'top 75%', once: true, onEnter: () => refresh(screen) });
  gsap.from('.posts li, .desk .all', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: '.posts', start: 'top 80%', once: true } });

  // 联系：屏幕刷一次进入待机
  const standby = $('[data-standby]')!;
  ScrollTrigger.create({ trigger: standby, start: 'top 75%', once: true, onEnter: () => refresh(standby) });
});
mm.add('(prefers-reduced-motion: reduce)', () => pick('0'));
