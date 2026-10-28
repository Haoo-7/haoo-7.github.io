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
// 进站不碰页面也在轮播；滚出首屏就停，回来接着走。等加载动画放行再计时，第一次换帧别撞上交接
const loaderGate = (window as any).__loaderGate;
if (loaderGate && typeof loaderGate.then === 'function') loaderGate.then(() => loop(2600));
else loop(2600);
ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom 20%', onLeave: stop, onEnterBack: () => loop(1200) });

const pick = bindTray($('.bench')!);
const screen = $('[data-screen]')!;
bindReader($('.posts')!, screen);

const mm = gsap.matchMedia();

// 关于：一帧拆成三帧。只在宽屏且开着动效时钉住，滚动 1:1 驱动 1400px；其余情况保持拆好的样子
const facts = $$('[data-facts] li');
const strips = $$('.strip');
const caps = $$('.caps span');
let fcur = 3;
const focusFact = (f: number) => {
  if (f === fcur) return;
  fcur = f;
  facts.forEach((li, k) => li.classList.toggle('on', f === 3 || k === f));
  strips.forEach((s) => s.classList.toggle('dim', f !== 3 && f >= 0 && +s.dataset.s! !== f));
};
mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
  const [life, tech, hist] = [0, 1, 2].map((k) => strips.find((el) => +el.dataset.s! === k)!);
  const img = (s: HTMLElement) => $('img', s)!;
  // 栏宽 244/760，栏缝 14/760：底下那一帧的左边始终跟着上面那一帧的右边走
  gsap.set(strips.map(img), { x: 0, xPercent: 49.606 });
  gsap.set(life, { clipPath: 'inset(0% 0% 0% 33.158%)' });
  gsap.set([tech, hist], { clipPath: 'inset(0% 0% 0% 101.842%)' });
  gsap.set(caps, { opacity: 0 });
  focusFact(-1);
  // 只在往下滚时刷新；往回滚帧安静地合回去
  const fwd = () => split.scrollTrigger!.direction === 1;
  const land = (s: HTMLElement) => { if (fwd()) { s.classList.add('partial'); refresh(s); } };
  const split = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: '.about', start: 'top top', end: '+=1400', pin: true, scrub: 0.6,
      // 第 k 帧落定时它这句亮起；最后整组刷新一次，三句都亮
      onUpdate: (st) => { const t = st.progress * split.duration(); focusFact(t < 0.1 ? -1 : t < 0.3 ? 0 : t < 0.5 ? 1 : t < 0.68 ? 2 : 3); },
    },
  });
  // Life 揭到左栏，露出底下的 Tech；Tech 收进中栏，露出 History；History 落在右栏
  split.to(life, { clipPath: 'inset(0% 67.895% 0% 0%)', duration: 0.18 }, 0.1)
    .to(img(life), { xPercent: -25.984, duration: 0.18 }, 0.1)
    .to(tech, { clipPath: 'inset(0% 0% 0% 33.947%)', duration: 0.18 }, 0.1)
    .call(() => land(life), undefined, 0.28).to(caps[0], { opacity: 1, duration: 0.03, ease: 'none' }, 0.29)
    .to(tech, { clipPath: 'inset(0% 33.947% 0% 33.947%)', duration: 0.18 }, 0.3)
    .to(img(tech), { xPercent: 24.803, duration: 0.18 }, 0.3)
    .to(hist, { clipPath: 'inset(0% 0% 0% 67.895%)', duration: 0.18 }, 0.3)
    .to(img(hist), { xPercent: 75.591, duration: 0.18 }, 0.3)
    .call(() => land(tech), undefined, 0.48).to(caps[1], { opacity: 1, duration: 0.03, ease: 'none' }, 0.49)
    .call(() => land(hist), undefined, 0.5).to(caps[2], { opacity: 1, duration: 0.03, ease: 'none' }, 0.51)
    // 收尾：三帧从左到右依次整屏刷新，和首屏的刷新呼应；错开 120ms，不让三块同时黑着
    .call(() => { if (fwd()) [life, tech, hist].forEach((s, k) => setTimeout(() => { s.classList.remove('partial'); refresh(s); }, k * 120)); }, undefined, 0.68)
    .to({}, { duration: 0.2 }, 0.7);
  return () => focusFact(3);
});

// 钉住的舞台要先建，它下面的触发点才算上钉住的那段距离
mm.add('(prefers-reduced-motion: no-preference)', () => {
  let stopped = false;
  // 先在纸下摆好起始状态，等加载动画放行再播，免得白演一遍
  gsap.set('.words .w', { yPercent: 105 });
  gsap.set('.intro, .hero .foot', { opacity: 0, y: 14 });
  const enter = (r?: { shown?: boolean }) => {
    if (stopped) return;
    gsap.to('.words .w', { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.1 });
    if (r?.shown) {
      // 加载层露过面：猫要留给交接，只让文字自己进来
      gsap.set('.hero .foot', { opacity: 1, y: 0 });
      gsap.set('.hero .foot .makes, .hero .foot .scrollhint', { opacity: 0, y: 14 });
      gsap.to('.intro, .hero .foot .makes, .hero .foot .scrollhint', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.45 });
    } else {
      gsap.to('.intro, .hero .foot', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.45 });
      refresh(panel);
    }
  };
  const gate = (window as any).__loaderGate;
  if (gate && typeof gate.then === 'function') gate.then(enter);
  else enter();
  rises();

  // 工作台：照片从左揭开并回缩，再依次框出作品
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.tray', start: 'top 70%', once: true } });
  tl.fromTo('.tray .img', { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.1, ease: 'expo.out', transformOrigin: '20% 50%' })
    .from('.works li', { opacity: 0, y: 24, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, '-=.7')
    .add(() => pick('0'), '-=.2');

  // 阅读桌：屏幕在滚到时刷新一次，文章依次落位
  ScrollTrigger.create({ trigger: screen, start: 'top 75%', once: true, onEnter: () => refresh(screen) });
  gsap.from('.posts li, .desk .all', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: '.posts', start: 'top 80%', once: true } });

  // 近况：四行沿阅读方向展开
  gsap.from('.lately li', { opacity: 0, x: -28, duration: 0.6, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: '.lately', start: 'top 80%', once: true } });

  // 联系：屏幕刷一次进入待机
  const standby = $('[data-standby]')!;
  ScrollTrigger.create({ trigger: standby, start: 'top 75%', once: true, onEnter: () => refresh(standby) });

  // 媒体查询失效时，别再让迟到的那一帧把元素点起来
  return () => { stopped = true; };
});
mm.add('(prefers-reduced-motion: reduce)', () => pick('0'));

