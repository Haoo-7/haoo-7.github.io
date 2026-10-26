import { $, $$, refresh } from './core';

// 工作台：悬停或聚焦哪一行，就框出哪一格
export const bindTray = (root: ParentNode) => {
  const rows = $$('[data-rows] > li', root);
  const cells = $$('[data-cell]', root);
  const pick = (c: string) => {
    rows.forEach((r) => r.classList.toggle('on', r.dataset.c === c));
    cells.forEach((x) => x.classList.toggle('on', x.dataset.cell === c));
  };
  rows.forEach((r) => {
    r.addEventListener('mouseenter', () => pick(r.dataset.c!));
    r.addEventListener('focusin', () => pick(r.dataset.c!));
  });
  return pick;
};

export interface ReaderItem { meta: string; title: string; dek: string; n: string; source: string }

// 阅读桌：选中哪篇，阅读器屏幕就局部刷新成哪篇
export const bindReader = (list: HTMLElement, screen: HTMLElement) => {
  const items: ReaderItem[] = JSON.parse(list.dataset.items ?? '[]');
  const lis = $$('li[data-p]', list);
  let cur = 0;
  const show = (p: number) => {
    if (p === cur || !items[p]) return;
    cur = p;
    lis.forEach((li) => li.classList.toggle('on', +li.dataset.p! === p));
    refresh(screen, () => {
      (Object.keys(items[p]) as (keyof ReaderItem)[]).forEach((k) => {
        const el = $(`[data-s="${k}"]`, screen);
        if (el) el.textContent = items[p][k];
      });
    });
  };
  lis.forEach((li) => {
    li.addEventListener('mouseenter', () => show(+li.dataset.p!));
    li.addEventListener('focusin', () => show(+li.dataset.p!));
  });
  return show;
};
