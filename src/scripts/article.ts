import { $, $$, reduce, lang, text } from './core';

// 窄屏目录默认收起
const toc = $<HTMLDetailsElement>('[data-toc]');
if (toc && matchMedia('(max-width: 1023px)').matches) toc.open = false;

// 顶栏下的阅读进度线：只算正文这一段
const prose = $('#prose')!;
const bar = $('#progress');
// 目录：当前章节墨色下划线
const links = $$<HTMLAnchorElement>('[data-to]');
const heads = links.map((a) => document.getElementById(a.dataset.to!)).filter((h): h is HTMLElement => !!h);
let cur = -1;
let queued = false;
const update = () => {
  queued = false;
  const r = prose.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
  if (bar) bar.style.transform = `scaleX(${p})`;
  let k = -1;
  heads.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * 0.3) k = i; });
  if (k !== cur) {
    cur = k;
    links.forEach((a, i) => (i === k ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  }
};
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
addEventListener('scroll', queue, { passive: true });
addEventListener('resize', queue);
update();
// 页内跳转（目录、脚注回链、跳到正文）只换掉地址栏里的 #，不往历史里加一条，回退直接回上一页
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || a.hasAttribute('data-footnote-ref') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const hash = a.getAttribute('href')!;
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (!el.hasAttribute('tabindex') && !el.matches('a, button, input, select, textarea')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
  history.replaceState(history.state, '', hash);
  // 窄屏点了目录里的一章，就把目录收起
  if (a.hasAttribute('data-to') && toc && matchMedia('(max-width: 1023px)').matches) toc.open = false;
});

// 上标和它前面的一个字、后面紧跟的标点绑在一起，不让它们被折到下一行开头
$$('sup', prose).forEach((sup) => {
  if (!sup.querySelector('[data-footnote-ref]')) return;
  const wrap = document.createElement('span');
  wrap.className = 'nobr';
  const prev = sup.previousSibling;
  if (prev?.nodeType === 3 && prev.textContent) {
    const t = prev.textContent;
    prev.textContent = t.slice(0, -1);
    wrap.append(t.slice(-1));
  }
  sup.replaceWith(wrap);
  wrap.append(sup);
  const next = wrap.nextSibling;
  const m = next?.nodeType === 3 ? next.textContent!.match(/^[，。、；：！？）」』”’,.;:!?)]+/) : null;
  if (m) { next!.textContent = next!.textContent!.slice(m[0].length); wrap.append(m[0]); }
});

// 脚注：点上标浮出注释，Esc 或点别处关掉
const notes = $('.footnotes', prose);
let ref: HTMLAnchorElement | null = null;
let pop: HTMLElement | null = null;
const close = (back = false) => {
  if (!pop) return;
  const p = pop;
  const r = ref;
  p.classList.remove('on');
  setTimeout(() => p.remove(), 180);
  pop = null;
  ref = null;
  r?.setAttribute('aria-expanded', 'false');
  if (back) r?.focus();
};
const place = () => {
  if (!pop || !ref || matchMedia('(max-width: 767px)').matches) return;
  const a = ref.getBoundingClientRect();
  const { width, height } = pop.getBoundingClientRect();
  const left = Math.min(Math.max(16, a.left - 8), innerWidth - width - 16);
  const top = a.bottom + 10 + height <= innerHeight - 16 ? a.bottom + 10 : Math.max(16, a.top - height - 10);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
};
const open = (a: HTMLAnchorElement) => {
  const id = a.getAttribute('href')?.slice(1);
  const src = id && notes?.querySelector(`#${CSS.escape(id)}`);
  if (!src) return;
  if (ref === a) return close();
  close();
  pop = document.createElement('aside');
  pop.className = 'fn-pop';
  pop.id = 'fn-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', `${lang === 'zh' ? '注释' : 'Note'} ${a.textContent?.trim() ?? ''}`);
  const body = src.cloneNode(true) as HTMLElement;
  body.removeAttribute('id');
  body.querySelector('.data-footnote-backref')?.remove();
  const x = document.createElement('button');
  x.className = 'x';
  x.type = 'button';
  x.setAttribute('aria-label', text.closeNote);
  x.textContent = '×';
  x.addEventListener('click', () => close(true));
  pop.append(x, ...body.childNodes);
  document.body.append(pop);
  ref = a;
  a.setAttribute('aria-expanded', 'true');
  a.setAttribute('aria-controls', 'fn-pop');
  place();
  void pop.offsetWidth;
  pop.classList.add('on');
};
$$<HTMLAnchorElement>('[data-footnote-ref]', prose).forEach((a) => {
  a.setAttribute('aria-expanded', 'false');
  a.addEventListener('click', (e) => { e.preventDefault(); open(a); });
});
document.addEventListener('click', (e) => {
  const t = e.target as Node;
  if (pop && !pop.contains(t) && !ref?.contains(t)) close();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pop) close(true); });
addEventListener('resize', place);
addEventListener('scroll', place, { passive: true });
