import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { $, $$, reduce } from './core';

gsap.registerPlugin(ScrollTrigger, SplitText);
export { gsap, ScrollTrigger, SplitText };

// 平滑滚动接进 GSAP 的时钟
export let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
// 页内锚点自己滚，不往历史里加一条，回退直接回上一页
$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = a.getAttribute('href')!;
    const el = id === '#top' ? 0 : $(id);
    if (el === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -20, duration: 1.1 });
    else if (el === 0) scrollTo(0, 0);
    else el.scrollIntoView();
    history.replaceState(history.state, '', id === '#top' ? location.pathname : id);
  }),
);

// 标题按行升起，说明文字淡入；进页后各做一次
export const rises = () => {
  if (reduce) return;
  $$('[data-split]').forEach((h) => {
    const s = new SplitText(h, { type: 'lines', mask: 'lines' });
    s.masks.forEach((m) => m.classList.add('split-mask'));
    gsap.from(s.lines, { yPercent: 110, letterSpacing: '.01em', duration: 0.85, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
  });
  $$('[data-rise]').forEach((el) =>
    gsap.from(el, { opacity: 0, y: 18, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
  );
};
