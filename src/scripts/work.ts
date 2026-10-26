import { $$ } from './core';
import { ScrollTrigger, rises } from './motion';
import { bindTray } from './parts';

// 滚到哪份档案，托盘上就框出哪一格；悬停和聚焦也一样
const pick = bindTray(document);
$$('.dossier').forEach((d) =>
  ScrollTrigger.create({ trigger: d, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => st.isActive && pick(d.dataset.c!) }),
);
pick('0');
rises();
