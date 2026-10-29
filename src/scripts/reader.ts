import { $, $$ } from './core';

// 顶栏 Aa：正文的字体（衬线 / 无衬线）和字号（五档），存在本机，下次打开由 Base 里的内联脚本在首帧前套上
type Face = 'serif' | 'sans';
const KEY = 'haoo:reading';
const DEF = { face: 'serif' as Face, size: 1 };
const root = document.documentElement;
const btn = $<HTMLButtonElement>('[data-rd-open]');
const panel = $('#rd-panel');
const prose = $('#prose');

if (btn && panel && prose) {
  const faces = $$<HTMLButtonElement>('[data-rd-face]', panel);
  const steps = $$<HTMLButtonElement>('[data-rd-step]', panel);
  const ticks = $$('.rd-ticks i', panel);
  const px = $('[data-rd-px]', panel)!;
  const reset = $<HTMLButtonElement>('[data-rd-reset]', panel)!;

  let face: Face = root.dataset.face === 'sans' ? 'sans' : 'serif';
  let size = root.dataset.size ? Number(root.dataset.size) : DEF.size;

  const paint = () => {
    faces.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rdFace === face)));
    ticks.forEach((t, i) => { t.classList.toggle('on', i <= size); t.classList.toggle('now', i === size); });
    steps[0].disabled = size === 0;
    steps[1].disabled = size === 4;
    reset.disabled = face === DEF.face && size === DEF.size;
    // 手机和桌面的默认字号不同，显示的是这台设备上正文实际的字号
    px.textContent = `${Math.round(parseFloat(getComputedStyle(prose).fontSize))} px`;
  };

  // 换字号时，把屏幕顶上正在读的那一段钉在原处，不让正文跳走
  const anchor = () => {
    const y = ($('#bar')?.getBoundingClientRect().bottom ?? 0) + 8;
    const el = [...prose.children].find((c) => c.getBoundingClientRect().bottom > y) as HTMLElement | undefined;
    if (!el) return () => {};
    const a = el.getBoundingClientRect();
    const f = (y - a.top) / Math.max(1, a.height);
    return () => {
      const b = el.getBoundingClientRect();
      scrollBy(0, b.top - a.top + f * (b.height - a.height));
    };
  };

  const apply = (next: { face?: Face; size?: number }) => {
    const restore = prose.getBoundingClientRect().top < innerHeight ? anchor() : () => {};
    if (next.face) face = next.face;
    if (next.size !== undefined) size = Math.min(4, Math.max(0, next.size));
    if (face === 'sans') root.dataset.face = 'sans'; else delete root.dataset.face;
    if (size !== DEF.size) root.dataset.size = String(size); else delete root.dataset.size;
    restore();
    paint();
    try {
      if (face === DEF.face && size === DEF.size) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify({ face, size }));
    } catch {}
    dispatchEvent(new Event('resize'));
  };

  faces.forEach((b) => b.addEventListener('click', () => apply({ face: b.dataset.rdFace as Face })));
  steps.forEach((b) => b.addEventListener('click', () => apply({ size: size + Number(b.dataset.rdStep) })));
  reset.addEventListener('click', () => { apply(DEF); btn.focus(); });

  // 开关：不是模态框，Tab 照常走进面板；Esc 或点别处关掉
  let t = 0;
  const open = () => {
    clearTimeout(t);
    paint();
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    void panel.offsetWidth;
    panel.classList.add('on');
  };
  const close = (back = false) => {
    if (panel.hidden) return;
    btn.setAttribute('aria-expanded', 'false');
    panel.classList.remove('on');
    t = window.setTimeout(() => (panel.hidden = true), 180);
    if (back) btn.focus();
  };
  btn.addEventListener('click', () => (panel.hidden || !panel.classList.contains('on') ? open() : close()));
  document.addEventListener('click', (e) => {
    const n = e.target as Node;
    if (!panel.contains(n) && !btn.contains(n)) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(true); });
  panel.addEventListener('focusout', (e) => {
    const n = e.relatedTarget as Node | null;
    if (n && !panel.contains(n) && n !== btn) close();
  });
}
