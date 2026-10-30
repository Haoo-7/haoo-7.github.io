import { ui } from '../i18n/ui';

export const lang = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
export const text = ui[lang].a11y;
export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 墨水屏刷新：重放一次 flash，在全黑那一刻换内容
export const refresh = (host: Element, swap?: () => void) => {
  host.classList.remove('refresh');
  void (host as HTMLElement).offsetWidth;
  host.classList.add('refresh');
  if (swap) setTimeout(swap, reduce ? 0 : 190);
};

// 广州时间
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit' });
const tick = () => $$('[data-time]').forEach((t) => (t.textContent = fmt.format(new Date())));
tick();
setInterval(tick, 15000);

// 顶栏：滚过 80px 后托底
const bar = $('#bar');
const onScroll = () => bar?.classList.toggle('stuck', scrollY > 80);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 复制邮箱
$$<HTMLButtonElement>('[data-copy]').forEach((copy) => {
  let t = 0;
  copy.addEventListener('click', async () => {
    const addr = copy.dataset.copy!;
    const ok = $('.ok', copy)!;
    try {
      await navigator.clipboard.writeText(addr);
      ok.textContent = 'Copied: ' + addr;
    } catch {
      ok.textContent = text.copyFailed;
    }
    copy.classList.add('done');
    clearTimeout(t);
    t = window.setTimeout(() => copy.classList.remove('done'), 2600);
  });
});
