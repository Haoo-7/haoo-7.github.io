import { $, $$, reduce } from './core';
import { gsap, lenis } from './motion';

// 首屏黑猫：眼睛和脑袋跟着指针；尾巴从页面后面一路垂到最底部，往下拉，拉过头猫被吓一跳、页面回到顶部
const cat = $('[data-cat]')!;
const svg = $<SVGSVGElement>('svg', cat)!;
const all = $('.cat-all', cat)!;
const head = $('.cat-head', cat)!;
const eyes = $('.cat-eyes', cat)!;
const pupils = $$('.cat-pupil', cat);
const glints = $$('.cat-glint', cat);
const ears = $$('.cat-ear', cat);
const whisks = $$('.cat-whisk', cat);
const shiver = $('.cat-shiver', cat)!;
const shake = $('.cat-shake', cat)!;
const mouth = $('.cat-mouth', cat)!;
const hiss = $('.cat-hiss', cat)!;
const shock = $('.cat-shock', cat)!;
const tail = $<SVGPathElement>('.cat-tail', cat)!;
const wrap = $('.cat-wrap', cat)!;
const wrapLines = $$('.cat-wrap path', cat);
// 后面垂着的那根从胯部长出多少：1 是整根，0 缩回胯部。和身前那圈交接时用，保证任何时候只有一根尾巴
const tailGrow = { v: 1 };
// draw：身前那圈尾巴从胯部长出来多少（0..1），每帧换算成虚线长度
const wrapSt = { draw: 0 };
const EYES = [[50, 92], [78, 92]];

// ——炸毛：沿轮廓取点，每个点往外长一根尖毛——
// stray：甩完毛以后还翘着的那几根
type Tooth = { x: number; y: number; nx: number; ny: number; len: number; lean: number; ph: number; stray: boolean };
const sample = (el: SVGPathElement, n: number, cx: number, cy: number, weight: (x: number, y: number) => number): Tooth[] => {
  const L = el.getTotalLength();
  return Array.from({ length: n }, (_, i) => {
    const p = el.getPointAtLength((i / n) * L);
    const a = el.getPointAtLength(((i - 0.5 + n) % n / n) * L), b = el.getPointAtLength(((i + 0.5) % n / n) * L);
    let nx = b.y - a.y, ny = -(b.x - a.x);
    const d = Math.hypot(nx, ny) || 1; nx /= d; ny /= d;
    if (nx * (p.x - cx) + ny * (p.y - cy) < 0) { nx = -nx; ny = -ny; } // 朝外
    const w = weight(p.x, p.y);
    // 长短不一：偶尔一撮特别长，读起来是毛，不是锯片
    const len = w * (Math.random() < 0.14 ? 1.35 : 0.6 + Math.random() * 0.45);
    return { x: p.x, y: p.y, nx, ny, len, lean: Math.random() * 0.5 - 0.25, ph: Math.random() * 6.28, stray: false };
  });
};
const smooth = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
// 身子：肩背上的毛最长，越往下越短；贴地那一圈和被头盖住的脖子不长
const bodyTeeth = sample($('.cat-body', cat) as unknown as SVGPathElement, 46, 64, 150, (_, y) => (y > 184 || y < 114 ? 0 : 0.2 + 0.8 * (1 - smooth(126, 178, y))));
// 头：头顶最长，脸颊和下巴很短，胡子不会被毛吃掉
const skullTeeth = sample($('.cat-skull', cat) as unknown as SVGPathElement, 40, 64, 92, (x, y) => (0.15 + 0.85 * (1 - smooth(70, 98, y))) * (y < 70 ? 0.55 + 0.45 * (1 - Math.min(1, Math.abs(x - 64) / 26)) : 1));
// 头顶两根、肩上一根：甩完以后还翘着
[...skullTeeth].filter((k) => k.y < 66).sort(() => Math.random() - 0.5).slice(0, 2).forEach((k) => { k.stray = true; k.len = 1.2; });
const shoulder = bodyTeeth.filter((k) => k.len > 0 && k.y < 135);
if (shoulder.length) { shoulder[0].stray = true; shoulder[0].len = 1; }
const furBody = $('[data-fur="body"]', cat)!, furSkull = $('[data-fur="skull"]', cat)!, furTail = $('[data-fur="tail"]', cat)!;
// puff：炸毛程度 0..1；jit：毛尖抖动的幅度；stray：翘着的那几根还剩多少；amp：尖毛最长多长（svg 单位）
const furSt = { puff: 0, jit: 0, stray: 0 };
const ring = (teeth: Tooth[], amp: number, t: number) => {
  let d = '';
  teeth.forEach((k, i) => {
    const p = k.stray ? Math.max(furSt.puff, furSt.stray) : furSt.puff;
    const l = k.len * amp * p * (1 + furSt.jit * 0.35 * Math.sin(t * 38 + k.ph));
    const v = i === 0 ? 'M' : 'L';
    if (l < 0.3) { d += `${v}${k.x.toFixed(1)} ${k.y.toFixed(1)}`; return; }
    // 毛尖往外，略微歪一点，不像锯齿那么整齐
    const tx = k.x + k.nx * l - k.ny * l * k.lean, ty = k.y + k.ny * l + k.nx * l * k.lean;
    d += `${v}${k.x.toFixed(1)} ${k.y.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}`;
  });
  return d + 'Z';
};

// ——尾巴：平时从右胯垂到线后面；受惊时竖起来，炸成一根瓶刷——
const T_DOWN = [92, 184, 106, 183, 117, 185, 121, 196, 121.3, 210, 121.7, 225, 122, 240];
// 竖起来时先往右离开身子，再弯回来，尖上微微往外卷；和身子之间留一道干净的缝
const T_UP = [94, 184, 110, 182, 118, 166, 119, 148, 120, 130, 117, 114, 124, 104];
// 松开后放下尾巴用的“翘着”姿势：从胯部往右上一道平滑的弧；从它插值到垂着，中途不会折成直角
const T_LIFT = [92, 184, 104, 183, 112, 180, 117, 172, 122, 164, 128, 158, 134, 156];
const tailSt = { up: 0, lift: 0 };
const TAIL_LEN = Array.from({ length: 64 }, () => 0.6 + Math.random() * 0.5);
const bez = (p: number[], o: number, t: number) => {
  const u = 1 - t;
  return [0, 1].map((j) => u * u * u * p[o + j] + 3 * u * u * t * p[o + 2 + j] + 3 * u * t * t * p[o + 4 + j] + t * t * t * p[o + 6 + j]);
};
const drawTail = (t: number) => {
  const p = T_DOWN.map((v, i) => v + (T_UP[i] - v) * tailSt.up + (T_LIFT[i] - v) * tailSt.lift);
  tail.setAttribute('d', `M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]} C${p[8]} ${p[9]} ${p[10]} ${p[11]} ${p[12]} ${p[13]}`);
  if (furSt.puff < 0.02) {
    tail.style.opacity = '';
    // pathLength=1：虚线长度就是从胯部长出来的比例；整根时去掉虚线
    if (tailGrow.v >= 0.999) tail.removeAttribute('stroke-dasharray');
    else tail.setAttribute('stroke-dasharray', `${Math.max(0.0001, tailGrow.v)} 2`);
    furTail.setAttribute('d', '');
    return;
  }
  // 炸开时换成一整块填色的瓶刷：根部细、越往上越蓬，尖上是一团圆的毛，不是星形也不是光秃的圆球。
  // 外侧（背离身子）的毛长，内侧短，和身子之间的缝保持干净
  tail.style.opacity = '0';
  const N = 24, pts: number[][] = [];
  for (let i = 0; i <= N; i++) { const s = i / N; pts.push(s < 0.5 ? bez(p, 0, s * 2) : bez(p, 6, s * 2 - 1)); }
  const tan = (i: number) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1;
    return [tx / m, ty / m];
  };
  const out: string[] = [], inn: string[] = [];
  const P = furSt.puff, J = (k: number) => 1 + furSt.jit * 0.3 * Math.sin(t * 40 + k);
  pts.forEach((q, i) => {
    const s = i / N, [tx, ty] = tan(i);
    const hw = 4 + 6 * P * smooth(0, 0.7, s);
    // 外侧：法线指向右（离开身子），隔一个点长一根尖
    const spikeO = i % 2 ? 7 * P * TAIL_LEN[i] * J(i) * (0.35 + 0.65 * s) : 0;
    const spikeI = i % 2 ? 0 : 3 * P * TAIL_LEN[i + 25] * J(i + 25) * s;
    // 法线固定取切线的同一侧：尾巴往上走时它朝右（离开身子），整条尾巴不会中途换边、交叉
    const ox = -ty, oy = tx;
    out.push(`${(q[0] + ox * (hw + spikeO)).toFixed(1)} ${(q[1] + oy * (hw + spikeO)).toFixed(1)}`);
    inn.push(`${(q[0] - ox * (hw + spikeI)).toFixed(1)} ${(q[1] - oy * (hw + spikeI)).toFixed(1)}`);
  });
  // 尖上一团：从外侧法线绕过尾尖到内侧法线，画半圈，交替长短，像一撮蓬开的毛
  const e = pts[N], [ex, ey] = tan(N), R = 6 + 7 * P;
  const aOut = Math.atan2(ex, -ey), aTip = Math.atan2(ey, ex);
  let half = aTip - aOut;
  while (half > Math.PI) half -= Math.PI * 2;
  while (half < -Math.PI) half += Math.PI * 2;
  const cap: string[] = [];
  for (let k = 1; k < 8; k++) {
    const ang = aOut + half * (k / 4);
    const r = R + (k % 2 ? 1.4 * P * TAIL_LEN[50 + k] * J(50 + k) : 0);
    cap.push(`${(e[0] + Math.cos(ang) * r).toFixed(1)} ${(e[1] + Math.sin(ang) * r).toFixed(1)}`);
  }
  furTail.setAttribute('d', `M${out.join('L')}L${cap.join('L')}L${inn.reverse().join('L')}Z`);
};
const drawFur = () => {
  const t = performance.now() / 1000;
  const any = furSt.puff >= 0.02 || furSt.stray >= 0.02;
  furBody.setAttribute('d', any ? ring(bodyTeeth, 11, t) : '');
  furSkull.setAttribute('d', any ? ring(skullTeeth, 10, t) : '');
  drawTail(t);
  // 虚线从路径起点（胯部）画出 draw 那么长，其余是空；不靠 dashoffset 补间，暂停取证时也画得对
  // 长度接近 0 时整组不画：圆头描边在 0 长度时还会留一个小圆点
  wrapLines.forEach((p) => p.setAttribute('visibility', wrapSt.draw < 0.02 ? 'hidden' : 'visible'));
  const dl = Math.max(0.0001, wrapSt.draw);
  wrapLines.forEach((p) => p.setAttribute('stroke-dasharray', `${dl} 2`));
};

// 指针位置；手机上没有悬停，久不动时眼睛自己四处看
const ptr = { x: 0, y: 0, t: -1e9 };
addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now(); }, { passive: true });
addEventListener('pointerdown', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now(); }, { passive: true });
let wander = { x: 0, y: 0, next: 0 };
const look = { x: 0, y: 0 }; // -1..1，平滑后的视线方向
let scared = false;
// 受惊时视线由动画接管：先直直盯着观众，后面低头看一眼尾巴，再回来瞪
const gaze = { x: 0, y: 0 };

const frame = () => {
  const now = performance.now();
  let tx: number, ty: number;
  if (scared) { tx = gaze.x; ty = gaze.y; }
  else if (now - ptr.t < 4000) {
    const r = svg.getBoundingClientRect();
    const s = r.width / 164;
    const cx = r.left + (64 + 12) * s, cy = r.top + (92 + 60) * s;
    const dx = ptr.x - cx, dy = ptr.y - cy;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 260);
    tx = (dx / d) * k; ty = (dy / d) * k;
  } else {
    if (now > wander.next) wander = { x: (Math.random() * 2 - 1) * 0.7, y: (Math.random() * 2 - 1) * 0.4, next: now + 1600 + Math.random() * 2400 };
    tx = wander.x; ty = wander.y;
  }
  const ease = reduce ? 1 : 0.14;
  look.x += (tx - look.x) * ease;
  look.y += (ty - look.y) * ease;
  pupils.forEach((p, i) => { p.setAttribute('cx', String(EYES[i][0] + look.x * 4.8)); p.setAttribute('cy', String(EYES[i][1] + look.y * 4)); });
  glints.forEach((g, i) => { g.setAttribute('cx', String(EYES[i][0] + 2.5 + look.x * 3.8)); g.setAttribute('cy', String(EYES[i][1] - 3.5 + look.y * 3.2)); });
  head.setAttribute('transform', `translate(${look.x * 3} ${look.y * 2}) rotate(${look.x * 4} 64 116)`);
};
// 只在猫看得见时逐帧算
new IntersectionObserver(([en]) => (en.isIntersecting ? gsap.ticker.add(frame) : gsap.ticker.remove(frame))).observe(cat);

// 眨眼：几秒一次，偶尔连眨两下
const blink = () => {
  if (!scared) {
    const tl = gsap.timeline();
    tl.to(eyes, { scaleY: 0.08, svgOrigin: '64 92', duration: 0.07, ease: 'power2.in' }).to(eyes, { scaleY: 1, duration: 0.12, ease: 'power2.out' });
    if (Math.random() < 0.25) tl.to(eyes, { scaleY: 0.08, duration: 0.07, ease: 'power2.in' }, '+=.08').to(eyes, { scaleY: 1, duration: 0.12, ease: 'power2.out' });
  }
  setTimeout(blink, 2600 + Math.random() * 3600);
};
if (!reduce) setTimeout(blink, 1800);

// 受惊：被尾巴拽一下 → 炸毛蹦起来哈气 → 落地缩成一团发抖 → 甩头把毛抖顺 → 低头看尾巴，回头瞪观众
const pupil = (rx: number, ry: number, glint: number) => {
  pupils.forEach((p) => gsap.set(p, { attr: { rx, ry } }));
  glints.forEach((g) => gsap.set(g, { opacity: glint }));
};
const shiverSt = { amp: 0 };
const shiverTick = () => {
  const t = performance.now() / 1000;
  shiver.setAttribute('transform', `translate(${(Math.sin(t * 48) * shiverSt.amp).toFixed(2)} 0)`);
  drawFur();
};
const reset = () => {
  gsap.set(all, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
  gsap.set(ears, { rotation: 0, scaleY: 1, x: 0, y: 0 });
  gsap.set(whisks, { rotation: 0 });
  gsap.set(eyes, { scaleX: 1, scaleY: 1 });
  gsap.set(shake, { rotation: 0 });
  gsap.set(hiss, { opacity: 0 }); gsap.set(mouth, { opacity: 1 });
  gsap.set(shock, { opacity: 0, scale: 1 });
  pupil(5, 5.8, 1);
  gsap.set(wrap, { opacity: 0, x: 0 }); wrapSt.draw = 0; tailGrow.v = 1;
  Object.assign(furSt, { puff: 0, jit: 0, stray: 0 }); tailSt.up = 0; tailSt.lift = 0; shiverSt.amp = 0;
  shiver.removeAttribute('transform');
  drawFur();
};
// hold：取证用，停在时间轴的某一刻
export const startle = (hold?: number) => new Promise<void>((done) => {
  scared = true; gaze.x = 0; gaze.y = 0;
  gsap.killTweensOf([all, eyes, shake, hiss, mouth, shock, wrap, wrapSt, ...ears, ...whisks, ...pupils, ...glints, furSt, tailSt, shiverSt, gaze, tailGrow]);
  const end = () => { gsap.ticker.remove(shiverTick); reset(); scared = false; done(); };
  if (reduce) {
    // 减少动态效果：直接摆出受惊的样子，停一会儿再复原
    pupil(8.6, 9.2, 1);
    gsap.set(ears[0], { rotation: -30, scaleY: .82, x: -3, y: 6, svgOrigin: '44 68' });
    gsap.set(ears[1], { rotation: 30, scaleY: .82, x: 3, y: 6, svgOrigin: '84 68' });
    gsap.set(hiss, { opacity: 1 }); gsap.set(mouth, { opacity: 0 });
    Object.assign(furSt, { puff: .8, jit: 0 }); tailSt.up = 1; drawFur();
    setTimeout(end, 1600);
    return;
  }
  gsap.ticker.add(shiverTick);
  gsap.set(all, { svgOrigin: '64 190' });
  gsap.set(ears[0], { svgOrigin: '44 68' }); gsap.set(ears[1], { svgOrigin: '84 68' });
  gsap.set(whisks[0], { svgOrigin: '31 102' }); gsap.set(whisks[1], { svgOrigin: '97 102' });
  gsap.set(eyes, { svgOrigin: '64 92' }); gsap.set(shake, { svgOrigin: '64 116' }); gsap.set(shock, { svgOrigin: '64 80' });
  const tl = gsap.timeline({ onComplete: end });
  // 1 被拽：整只往下一沉压扁；眼睛瞪大，瞳孔缩成小点，耳朵竖直
  tl.call(() => pupil(2, 2.4, 0), undefined, 0)
    .to(all, { y: 5, scaleY: 0.86, scaleX: 1.1, duration: 0.06, ease: 'power3.in' }, 0)
    .to(eyes, { scaleX: 1.12, scaleY: 1.22, duration: 0.06 }, 0)
    .to(ears, { scaleY: 1.14, duration: 0.06 }, 0)
    // 1b 愣住：压扁的样子定格 160ms，身上还是光的；下一拍毛才一下子炸开，对比最强
    // 2 蹦起来：拉长，炸毛，尾巴竖成瓶刷，哈气；耳朵这时是竖直的尖，不压平；头顶炸开几道线
    .to(all, { y: -50, scaleY: 1.12, scaleX: 0.92, duration: 0.2, ease: 'power3.out' }, 0.22)
    .to(furSt, { puff: 1, duration: 0.12, ease: 'back.out(2.2)' }, 0.22)
    .to(tailSt, { up: 1, duration: 0.24, ease: 'back.out(1.6)' }, 0.22)
    .set(hiss, { opacity: 1 }, 0.24).set(mouth, { opacity: 0 }, 0.24)
    .to(ears, { scaleY: 1.2, duration: 0.1, ease: 'power3.out' }, 0.22)
    .to(whisks[0], { rotation: -16, duration: 0.1 }, 0.24)
    .to(whisks[1], { rotation: 16, duration: 0.1 }, 0.24)
    .fromTo(shock, { opacity: 1, scale: 0.6 }, { opacity: 1, scale: 1.05, duration: 0.18, ease: 'power2.out', immediateRender: false }, 0.23)
    .to(shock, { opacity: 0, scale: 1.2, duration: 0.22, ease: 'power1.in' }, 0.41)
    // 3 顶上只停一下，停的时候拉长就收回来，不让瘦高的样子多留；然后加速掉下
    .to(all, { scaleY: 1.02, scaleX: 0.98, duration: 0.1, ease: 'sine.out' }, 0.42)
    .to(all, { y: 0, duration: 0.15, ease: 'power3.in' }, 0.5)
    // 落地那一下比缩着还扁，再回弹成缩成一团的样子
    .to(all, { scaleY: 0.72, scaleX: 1.18, duration: 0.05, ease: 'power2.out' }, 0.65)
    .to(all, { scaleY: 0.88, scaleX: 1.07, duration: 0.28, ease: 'back.out(2)' }, 0.7)
    // 落地才压耳朵：向两边压低成飞机耳，头顶的毛拱成一个圆顶
    .to(ears[0], { rotation: -30, scaleY: 0.82, x: -3, y: 6, duration: 0.1, ease: 'power3.out' }, 0.65)
    .to(ears[1], { rotation: 30, scaleY: 0.82, x: 3, y: 6, duration: 0.1, ease: 'power3.out' }, 0.65)
    .call(() => pupil(8.6, 9.2, 1), undefined, 0.67)
    .to(eyes, { scaleX: 1, scaleY: 1.05, duration: 0.2 }, 0.67)
    // 4 发抖：缩着打颤，毛尖跟着抖；嘴合上。只抖 0.4 秒
    .to(shiverSt, { amp: 2.4, duration: 0.08 }, 0.72)
    .to(furSt, { jit: 1, duration: 0.08 }, 0.72)
    .set(hiss, { opacity: 0 }, 1.08).set(mouth, { opacity: 1 }, 1.08)
    .to(shiverSt, { amp: 0, duration: 0.12 }, 1.08)
    .to(furSt, { jit: 0, duration: 0.12 }, 1.08)
    // 5 站起来抖毛：整只左右大幅甩、身子也跟着左右晃，头甩得更狠；毛在甩的过程中被甩顺，只剩几根翘着
    .set(furSt, { stray: 1 }, 1.15)
    .to(all, { scaleY: 1, scaleX: 1, duration: 0.18, ease: 'back.out(2)' }, 1.15)
    .to(all, { keyframes: [{ rotation: -12, x: -7 }, { rotation: 12, x: 7 }, { rotation: -9, x: -5 }, { rotation: 6, x: 3 }, { rotation: -2, x: -1 }, { rotation: 0, x: 0 }], duration: 0.6, ease: 'none' }, 1.2)
    .to(shake, { keyframes: [{ rotation: 16 }, { rotation: -16 }, { rotation: 12 }, { rotation: -8 }, { rotation: 3 }, { rotation: 0 }], duration: 0.6, ease: 'none' }, 1.22)
    .to(furSt, { puff: 0, duration: 0.5, ease: 'power2.in' }, 1.25)
    .to(tailSt, { up: 0, duration: 0.55, ease: 'power2.inOut' }, 1.4)
    .to(ears, { rotation: 0, scaleY: 1, x: 0, y: 0, duration: 0.45, ease: 'back.out(2.4)' }, 1.75)
    .to(whisks, { rotation: 0, duration: 0.4 }, 1.75)
    .call(() => pupil(5, 5.8, 1), undefined, 1.85)
    .to(eyes, { scaleX: 1, scaleY: 1, duration: 0.2 }, 1.85)
    // 6 低头看一眼尾巴；把尾巴从后面收到身前，绕住前爪——被拽过的尾巴不给你了
    .to(gaze, { x: 0.45, y: 0.9, duration: 0.3, ease: 'power2.inOut' }, 2.05)
    // 尾巴换到身前，始终只有一根：后面垂着的那根先从尖往胯部缩回去，缩到胯部，身前那圈再从胯部沿脚边长出来
    .to(tailGrow, { v: 0, duration: 0.22, ease: 'power2.in' }, 2.2)
    .set(wrap, { opacity: 1, x: 6 }, 2.4)
    .to(wrapSt, { draw: 1, duration: 0.45, ease: 'sine.out' }, 2.4)
    .to(wrap, { x: 0, duration: 0.45, ease: 'sine.out' }, 2.4)
    // 7 回头眯眼瞪观众；翘着的那几根毛这时才慢慢趴下
    .to(gaze, { x: 0, y: 0, duration: 0.25, ease: 'power2.inOut' }, 2.7)
    .to(eyes, { scaleY: 0.45, duration: 0.18, ease: 'power2.out' }, 2.75)
    .call(() => pupil(4, 6.4, 1), undefined, 2.75)
    .to(furSt, { stray: 0, duration: 0.4, ease: 'power2.in' }, 3.35)
    .to(eyes, { scaleY: 1, duration: 0.25, ease: 'power2.out' }, 3.55)
    .call(() => pupil(5, 5.8, 1), undefined, 3.55)
    // 8 松开放下，始终只有一根：身前那圈先沿脚边缩回胯部；缩到胯部，后面那根从胯部翘着长出来，
    //   再慢慢放下，垂回页面后面，到底轻轻一晃
    .to(wrapSt, { draw: 0, duration: 0.4, ease: 'sine.in' }, 3.9)
    .to(wrap, { x: 6, duration: 0.4, ease: 'sine.in' }, 3.9)
    .set(wrap, { opacity: 0, x: 0 }, 4.3)
    .set(tailSt, { up: 0, lift: 1 }, 4.28)
    .to(tailGrow, { v: 1, duration: 0.25, ease: 'power2.out' }, 4.28)
    // 放下：从右上那道弧慢慢垂下去，到底再轻轻弹起一点又落回去；不冲过头
    .to(tailSt, { lift: 0, duration: 0.5, ease: 'power2.in' }, 4.36)
    .to(tailSt, { lift: 0.12, duration: 0.12, ease: 'sine.out' }, 4.86)
    .to(tailSt, { lift: 0, duration: 0.2, ease: 'sine.in' }, 4.98);
  if (hold !== undefined) tl.pause(hold, false);
});

// 取证用：?state=startle 播一遍；?state=startle-peak 之类停在那一拍
const HOLD: Record<string, number> = { 'startle-yank': 0.15, 'startle-peak': 0.38, 'startle-land': 0.67, 'startle-crouch': 0.9, 'startle-shake': 1.4, 'startle-look': 2.25, 'startle-tuck': 2.6, 'startle-release': 4.12, 'startle-handoff': 4.34, 'startle-putdown': 4.55, 'startle-glare': 3.1 };
const state = new URLSearchParams(location.search).get('state');
if (state?.startsWith('startle')) setTimeout(() => startle(HOLD[state]), 1800); // 等首屏出场动画播完

// ——尾巴尖：从页脚下那条线后面垂下来，往下拉——
const btn = $<HTMLButtonElement>('[data-tailtip]')!;
const line = $('.tail-line', btn)!;
const grab = $('.tail-grab', btn)!;
const ROOT = { x: 86, y: -14 }; // 页脚上沿那条线后面的一段，从这里垂下来
// drop：垂下来多长（0 藏在线后，1 垂到静止位置）；dx/dy：被拉开的偏移；curl：末端那个钩
const st = { drop: 0, dx: 0, dy: 0, curl: 1, width: 8, shake: 0 };
let busy = false;
let dragging = false;

const draw = (t = performance.now() / 1000) => {
  // 像拉绳一样轻轻摆：根不动，越往下摆得越开
  const sway = reduce || dragging ? 0 : Math.sin(t * 1.4) * 5 * st.drop;
  const sx = (Math.random() * 2 - 1) * st.shake;
  const tipX = ROOT.x + st.dx + sway + sx;
  const tipY = ROOT.y + 96 * st.drop + st.dy;
  const len = tipY - ROOT.y;
  const c = st.curl * (0.88 + (reduce ? 0 : Math.sin(t * 1.1) * 0.12));
  // 竖直垂下，末端勾成 J；被拉直时钩收掉
  const m1x = ROOT.x, m1y = ROOT.y + len * 0.5;
  const m2x = tipX - (st.dx + sway) * 0.35, m2y = tipY - len * 0.22;
  // 钩往左勾：朝着页面内容，窄屏上也不会碰到屏幕右边
  const hook = c > 0.02 ? ` C${tipX} ${tipY + 14 * c} ${tipX - 13 * c} ${tipY + 22 * c} ${tipX - 22 * c} ${tipY + 13 * c}` : '';
  const d = `M${ROOT.x} ${ROOT.y} C${m1x} ${m1y} ${m2x} ${m2y} ${tipX} ${tipY}${hook}`;
  line.setAttribute('d', d);
  grab.setAttribute('d', d);
  line.style.strokeWidth = String(st.width);
};
gsap.ticker.add(() => draw());

const rest = { drop: 1, dx: 0, dy: 0, curl: 1, width: 8, shake: 0 };
// 滚到底：尾巴从线后面滑下来，到位时晃一下
const peek = () => { if (busy) return; gsap.to(st, { ...rest, duration: reduce ? 0 : 1, ease: 'back.out(1.6)', delay: reduce ? 0 : 0.3 }); };
const hide = () => { if (busy) return; gsap.killTweensOf(st); Object.assign(st, { drop: 0, dx: 0, dy: 0, curl: 1, shake: 0 }); };
new IntersectionObserver(([en]) => {
  if (en.intersectionRatio >= 0.85) peek();
  else if (!en.isIntersecting) hide();
}, { threshold: [0, 0.85] }).observe(btn);
const sync = () => { btn.style.pointerEvents = 'none'; grab.style.pointerEvents = busy ? 'none' : 'stroke'; };
sync();

// 拉：往下拉，跟手但越拉越沉；拉过 YANK 或猛地一拽，猫就把尾巴抽回去
const YANK = 80;
let start = { x: 0, y: 0 };
let last = { y: 0, t: 0, v: 0 };
const yank = async () => {
  busy = true; dragging = false; sync();
  btn.classList.remove('drag');
  gsap.killTweensOf(st);
  // 尾巴嗖地缩回线后面，页面跟着被卷回顶部
  gsap.to(st, { drop: 0, dx: 0, dy: -20, curl: 0, width: 8, shake: 0, duration: reduce ? 0 : 0.2, ease: 'power3.in' });
  await new Promise<void>((arrive) => {
    if (lenis) lenis.scrollTo(0, { duration: 0.9, easing: (x: number) => 1 - Math.pow(1 - x, 3), lock: true, force: true, onComplete: () => arrive() });
    else { scrollTo(0, 0); arrive(); }
  });
  await startle();
  busy = false; sync();
};

grab.addEventListener('pointerdown', (e) => {
  if (busy) return;
  e.preventDefault();
  try { grab.setPointerCapture(e.pointerId); } catch {}
  dragging = true;
  btn.classList.add('drag');
  gsap.killTweensOf(st);
  start = { x: e.clientX, y: e.clientY };
  last = { y: e.clientY, t: performance.now(), v: 0 };
});
grab.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const down = e.clientY - start.y, side = e.clientX - start.x;
  const pull = Math.hypot(Math.max(0, down), side * 0.6);
  // 橡皮筋：往下拉越拉越沉；往上推只会让尾巴皱一点
  st.dy = down > 0 ? 70 * (1 - Math.exp(-down / 90)) : Math.max(-40, down * 0.3);
  st.dx = 50 * Math.tanh(side / 120);
  const k = Math.min(1, pull / YANK);
  st.curl = 1 - k * 0.95;
  st.width = 8 - k * 2.2;
  st.shake = k > 0.6 ? (k - 0.6) * 4 : 0;
  const now = performance.now();
  last.v = (e.clientY - last.y) / Math.max(1, now - last.t);
  last = { y: e.clientY, t: now, v: last.v };
  // 拉到头，或者往下猛拽（过半程且快于 1.8px/ms）
  if (pull > YANK || (pull > YANK * 0.5 && last.v > 1.8)) yank();
});
const release = () => {
  if (!dragging) return;
  dragging = false;
  btn.classList.remove('drag');
  gsap.to(st, { ...rest, duration: reduce ? 0 : 0.9, ease: 'elastic.out(1, .35)' });
};
grab.addEventListener('pointerup', release);
grab.addEventListener('pointercancel', release);

// 键盘：回车或空格等于猛拉一下
btn.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && !busy) { e.preventDefault(); yank(); }
});
