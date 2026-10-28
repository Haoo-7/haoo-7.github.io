// 邮票版交互：链接票盖戳后打开，邮箱票盖戳并复制，公众号票翻面
const sheet = document.querySelector('.sheet');
const msg = document.querySelector('[data-msg]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const idle = msg.textContent;
let t;

function say(text) {
  msg.textContent = text;
  clearTimeout(t);
  t = setTimeout(() => (msg.textContent = idle), 2400);
}

function frank(stamp) {
  stamp.classList.add('used');
  if (!reduce) {
    sheet.classList.remove('thud');
    void sheet.offsetWidth;
    sheet.classList.add('thud');
  }
}

document.querySelectorAll('.stamp').forEach((s) => {
  s.addEventListener('click', () => {
    if (s.dataset.href) {
      frank(s);
      // 小样里不真的跳转；站点里用 <a target="_blank"> 直接打开
      say(`Opening ${s.dataset.href.replace(/^https:\/\//, '')}`);
    } else if (s.dataset.copy) {
      frank(s);
      navigator.clipboard?.writeText(s.dataset.copy).catch(() => {});
      say(`Copied · ${s.dataset.copy}`);
    } else if ('flip' in s.dataset) {
      const on = !s.classList.contains('flipped');
      s.classList.toggle('flipped', on);
      s.setAttribute('aria-pressed', on);
      say(on ? 'Scan with WeChat' : idle);
    }
  });
});

document.querySelector('.copy-l').addEventListener('click', (e) => {
  navigator.clipboard?.writeText(e.currentTarget.dataset.copy).catch(() => {});
  say('Copied · re11.zhou@gmail.com');
});

addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.flipped').forEach((s) => { s.classList.remove('flipped'); s.setAttribute('aria-pressed', 'false'); });
});

// 广州时间
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false });
const clock = document.querySelector('[data-time]');
const tick = () => (clock.textContent = fmt.format(new Date()));
tick();
setInterval(tick, 30000);

// 截图用：?state=used 给几张票先盖上戳，?state=flip 翻开公众号
const q = new URLSearchParams(location.search).get('state');
if (q === 'used' || q === 'all') ['[data-copy="re11.zhou@gmail.com"].stamp', '[data-href*="github"]'].forEach((k) => document.querySelector(k)?.classList.add('used'));
if (q === 'flip' || q === 'all') document.querySelector('[data-flip]')?.click();
